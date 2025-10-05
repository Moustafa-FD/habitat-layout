import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line, Group, Circle } from 'react-konva';
import Konva from 'konva';
import { toast } from 'sonner';
import { MainModule } from '@/data/mainModules';
import { SubModule } from '@/data/subModules';
import { PlacedMainModule, PlacedSubModule, LayoutState } from '@/types/layout';

const PIXELS_PER_METER = 40;
const GRID_SIZE = 0.5;

// Helper function to check if two rectangles overlap
const rectanglesOverlap = (rect1: {x: number, y: number, w: number, h: number}, 
                          rect2: {x: number, y: number, w: number, h: number}): boolean => {
  return !(rect1.x + rect1.w <= rect2.x || rect2.x + rect2.w <= rect1.x || 
           rect1.y + rect1.h <= rect2.y || rect2.y + rect2.h <= rect1.y);
};

// Helper function to calculate used surface area in a main module
const calculateUsedArea = (mainModule: PlacedMainModule, subModules: PlacedSubModule[]): number => {
  const children = subModules.filter(sub => sub.parentInstanceId === mainModule.instanceId);
  return children.reduce((total, sub) => total + (sub.width * sub.depth), 0);
};

// Collision detection is now handled inline in the new system

interface LayoutCanvas2DProps {
  layoutState: LayoutState;
  onStateChange: (state: LayoutState) => void;
}

export const LayoutCanvas2D = ({ layoutState, onStateChange }: LayoutCanvas2DProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(1.5);
  const [stagePos, setStagePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [connectingPort, setConnectingPort] = useState<{ moduleId: string; portId: string } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [isModuleDragging, setIsModuleDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Robust canvas sizing with multiple fallbacks
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth || containerRef.current.clientWidth || 1200;
        const height = containerRef.current.offsetHeight || containerRef.current.clientHeight || 800;
        
        // Only update if we have valid dimensions
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };

    // Immediate measurement
    updateDimensions();
    
    // Delayed measurement to ensure DOM is fully rendered
    const timeout = setTimeout(updateDimensions, 100);
    
    // ResizeObserver for responsive sizing
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Window resize as backup
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle spacebar for panning
      if (e.code === 'Space' && !spacePressed) {
        e.preventDefault();
        setSpacePressed(true);
        return;
      }
      
      const selectedId = layoutState.selectedMainModuleId || layoutState.selectedSubModuleId;
      if (!selectedId) return;
      
      if (e.key === 'r' || e.key === 'R') {
        // Rotate selected main module only
        if (layoutState.selectedMainModuleId) {
          e.preventDefault();
          onStateChange({
            ...layoutState,
            mainModules: layoutState.mainModules.map(m =>
              m.instanceId === layoutState.selectedMainModuleId
                ? { ...m, rotation: (m.rotation + 90) % 360 }
                : m
            )
          });
          toast.success('Main module rotated 90°');
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected module
        e.preventDefault();
        
        if (layoutState.selectedMainModuleId) {
          const moduleName = layoutState.mainModules.find(
            m => m.instanceId === layoutState.selectedMainModuleId
          )?.shortName;
          
          onStateChange({
            ...layoutState,
            mainModules: layoutState.mainModules.filter(
              m => m.instanceId !== layoutState.selectedMainModuleId
            ),
            subModules: layoutState.subModules.filter(
              s => s.parentInstanceId !== layoutState.selectedMainModuleId
            ),
            connections: layoutState.connections.filter(
              c => c.fromModuleId !== layoutState.selectedMainModuleId && 
                   c.toModuleId !== layoutState.selectedMainModuleId
            ),
            selectedMainModuleId: null
          });
          toast.success(`${moduleName} and its sub-modules deleted`);
        } else if (layoutState.selectedSubModuleId) {
          const subModuleName = layoutState.subModules.find(
            s => s.instanceId === layoutState.selectedSubModuleId
          )?.shortName;
          
          onStateChange({
            ...layoutState,
            subModules: layoutState.subModules.filter(
              s => s.instanceId !== layoutState.selectedSubModuleId
            ),
            selectedSubModuleId: null
          });
          toast.success(`${subModuleName} deleted`);
        }
      } else if (e.key === 'Escape') {
        // Deselect, cancel port connection, or exit zoom mode
        e.preventDefault();
        if (connectingPort) {
          setConnectingPort(null);
          toast.info('Connection cancelled');
        } else if (layoutState.zoomedModuleId) {
          onStateChange({
            ...layoutState,
            zoomedModuleId: null,
            selectedMainModuleId: null,
            selectedSubModuleId: null
          });
          toast.info('Exited zoom mode');
        } else {
          onStateChange({
            ...layoutState,
            selectedMainModuleId: null,
            selectedSubModuleId: null
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [layoutState, onStateChange, connectingPort, spacePressed]);

  const snapToGrid = (value: number) => {
    return Math.round(value / (GRID_SIZE * PIXELS_PER_METER)) * (GRID_SIZE * PIXELS_PER_METER);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const moduleType = e.dataTransfer.getData('moduleType');
    
    const stage = stageRef.current;
    if (!stage) return;

    // Get drop position relative to container
    const rect = stage.container().getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;
    
    // Convert to canvas coordinates (accounting for stage position and scale)
    const canvasX = (dropX - stagePos.x) / scale;
    const canvasY = (dropY - stagePos.y) / scale;
    
    // Convert to meters
    const metersX = canvasX / PIXELS_PER_METER;
    const metersY = canvasY / PIXELS_PER_METER;

    if (moduleType === 'main') {
      const moduleData = e.dataTransfer.getData('mainModule');
      if (!moduleData) return;
      
      const module = JSON.parse(moduleData) as MainModule;
      
      // Snap to grid
      const snappedX = Math.round(metersX / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(metersY / GRID_SIZE) * GRID_SIZE;

      const newModule: PlacedMainModule = {
        ...module,
        x: snappedX,
        y: snappedY,
        rotation: 0,
        instanceId: `${module.id}-${Date.now()}`
      };

      onStateChange({
        ...layoutState,
        mainModules: [...layoutState.mainModules, newModule]
      });
      
      toast.success(`Added ${module.shortName} to layout`);
    } else if (moduleType === 'sub') {
      // SIMPLE SUB-MODULE PLACEMENT - No complex logic
      if (!layoutState.zoomedModuleId) {
        toast.error('Double-click a main module first to zoom in for sub-module placement');
        return;
      }
      
      const moduleData = e.dataTransfer.getData('subModule');
      if (!moduleData) return;
      
      const module = JSON.parse(moduleData) as SubModule;
      const parentModule = layoutState.mainModules.find(m => m.instanceId === layoutState.zoomedModuleId);
      
      if (!parentModule) {
        toast.error('Zoomed module not found');
        return;
      }

      // Check if allowed
      if (!parentModule.allowedSubModules.includes(module.id)) {
        toast.error(`${module.shortName} cannot be placed in ${parentModule.shortName}`);
        return;
      }

      // Simple placement: just use drop position with basic constraints
      let relativeX = metersX - parentModule.x;
      let relativeY = metersY - parentModule.y;
      
      // Basic bounds check - keep it inside parent with small margin
      const margin = 0.1; // 10cm margin - generous
      const parentW = parentModule.rotation === 90 || parentModule.rotation === 270 
        ? parentModule.height 
        : parentModule.width;
      const parentH = parentModule.rotation === 90 || parentModule.rotation === 270 
        ? parentModule.width 
        : parentModule.height;
      
      relativeX = Math.max(margin, Math.min(relativeX, parentW - module.width - margin));
      relativeY = Math.max(margin, Math.min(relativeY, parentH - module.depth - margin));
      
      // Snap to grid
      relativeX = Math.round(relativeX / GRID_SIZE) * GRID_SIZE;
      relativeY = Math.round(relativeY / GRID_SIZE) * GRID_SIZE;

      // Create sub-module - no collision checking for now (keep it simple)
      const newSubModule: PlacedSubModule = {
        ...module,
        parentInstanceId: parentModule.instanceId,
        x: relativeX,
        y: relativeY,
        z: 0,
        instanceId: `${module.id}-${Date.now()}`
      };

      onStateChange({
        ...layoutState,
        subModules: [...layoutState.subModules, newSubModule]
      });
      
      toast.success(`Added ${module.shortName} to ${parentModule.shortName}`);
    }
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 
      ? Math.min(oldScale * 1.1, 3)
      : Math.max(oldScale / 1.1, 0.5);

    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const renderGrid = () => {
    const lines = [];
    const gridSpacing = GRID_SIZE * PIXELS_PER_METER;
    // Ensure minimum canvas size for grid rendering
    const width = Math.max(dimensions.width, 1200) / scale;
    const height = Math.max(dimensions.height, 800) / scale;
    
    // Smaller buffer to prevent excessive canvas extension
    const bufferSize = 400;
    const gridExtent = { w: width + bufferSize, h: height + bufferSize };

    // Start grid from 0,0 with reasonable extent
    for (let i = 0; i <= gridExtent.w / gridSpacing; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSpacing, 0, i * gridSpacing, gridExtent.h]}
          stroke="hsl(var(--grid-line))"
          strokeWidth={0.5 / scale}
          listening={false}
        />
      );
    }

    for (let i = 0; i <= gridExtent.h / gridSpacing; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSpacing, gridExtent.w, i * gridSpacing]}
          stroke="hsl(var(--grid-line))"
          strokeWidth={0.5 / scale}
          listening={false}
        />
      );
    }

    return lines;
  };

  const handleMainModuleDragEnd = (moduleId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    // Get the current position in pixels and convert to meters
    const pixelX = e.target.x();
    const pixelY = e.target.y();
    
    // Convert to meters and snap to grid
    const metersX = pixelX / PIXELS_PER_METER;
    const metersY = pixelY / PIXELS_PER_METER;
    
    const snappedX = Math.round(metersX / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(metersY / GRID_SIZE) * GRID_SIZE;
    
    // Update state
    onStateChange({
      ...layoutState,
      mainModules: layoutState.mainModules.map((m) =>
        m.instanceId === moduleId
          ? { ...m, x: snappedX, y: snappedY }
          : m
      )
    });
    
    // Update the visual position to match snapped position
    e.target.position({ 
      x: snappedX * PIXELS_PER_METER, 
      y: snappedY * PIXELS_PER_METER 
    });
  };

  const handleSubModuleDragEnd = (subModuleId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const sub = layoutState.subModules.find(s => s.instanceId === subModuleId);
    if (!sub) return;
    
    // Get absolute position in pixels and convert to meters
    const absX = e.target.x() / PIXELS_PER_METER;
    const absY = e.target.y() / PIXELS_PER_METER;
    
    // Find which main module (if any) can fully contain this sub-module
    const containingModule = layoutState.mainModules.find(m => {
      const dims = m.rotation === 90 || m.rotation === 270 
        ? { w: m.height, h: m.width } 
        : { w: m.width, h: m.height };
      
      // Check if ENTIRE sub-module fits within the main module with generous tolerance
      const tolerance = 0.15; // 15cm tolerance for removal - gives more leverage
      return absX >= m.x - tolerance && 
             absY >= m.y - tolerance &&
             absX + sub.width <= m.x + dims.w + tolerance &&
             absY + sub.depth <= m.y + dims.h + tolerance;
    });
    
    if (containingModule) {
      // Calculate relative position
      const relativeX = absX - containingModule.x;
      const relativeY = absY - containingModule.y;
      
      // Update state with the current position
      onStateChange({
        ...layoutState,
        subModules: layoutState.subModules.map((s) =>
          s.instanceId === subModuleId
            ? { 
                ...s, 
                parentInstanceId: containingModule.instanceId,
                x: relativeX, 
                y: relativeY 
              }
            : s
        )
      });
    } else {
      // Sub-module is outside any main module - remove it
      toast.info(`${sub.shortName} removed (must be inside a main module)`);
      onStateChange({
        ...layoutState,
        subModules: layoutState.subModules.filter(s => s.instanceId !== subModuleId),
        selectedSubModuleId: layoutState.selectedSubModuleId === subModuleId ? null : layoutState.selectedSubModuleId
      });
    }
  };

  const handlePortClick = (moduleId: string, portId: string) => {
    if (!connectingPort) {
      // Start connection
      setConnectingPort({ moduleId, portId });
      toast.info('Click another port to connect');
    } else {
      // Complete connection
      if (connectingPort.moduleId === moduleId) {
        toast.error('Cannot connect a module to itself');
        setConnectingPort(null);
        return;
      }

      // Check if connection already exists
      const existingConnection = layoutState.connections.find(
        c => (c.fromModuleId === connectingPort.moduleId && c.toModuleId === moduleId) ||
             (c.fromModuleId === moduleId && c.toModuleId === connectingPort.moduleId)
      );

      if (existingConnection) {
        toast.error('Connection already exists');
        setConnectingPort(null);
        return;
      }

      // Create new connection
      const newConnection = {
        id: `conn-${Date.now()}`,
        fromModuleId: connectingPort.moduleId,
        fromPortId: connectingPort.portId,
        toModuleId: moduleId,
        toPortId: portId
      };

      onStateChange({
        ...layoutState,
        connections: [...layoutState.connections, newConnection]
      });

      toast.success('Modules connected!');
      setConnectingPort(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-canvas relative"
      style={{maxWidth: '100%', maxHeight: '100%', overflow: 'hidden'}}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        draggable={true}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          if (isModuleDragging) {
            e.evt.preventDefault();
            return;
          }
          // Only allow panning if clicking on stage background
          if (e.target === e.target.getStage()) {
            setIsPanning(true);
          }
        }}
        onMouseMove={(e) => {
          if (isModuleDragging) {
            e.evt.preventDefault();
          }
        }}
        onMouseUp={() => {
          setIsPanning(false);
        }}
        onDragStart={(e) => {
          if (isModuleDragging) {
            e.evt.preventDefault();
            return false;
          }
        }}
        onDragEnd={(e) => {
          if (!isModuleDragging) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        <Layer>
          {renderGrid()}
        </Layer>
        
        {/* Connections Layer */}
        <Layer>
          {layoutState.connections.map(conn => {
            const fromModule = layoutState.mainModules.find(m => m.instanceId === conn.fromModuleId);
            const toModule = layoutState.mainModules.find(m => m.instanceId === conn.toModuleId);
            
            if (!fromModule || !toModule) return null;
            
            const fromPort = fromModule.ports.find(p => p.id === conn.fromPortId);
            const toPort = toModule.ports.find(p => p.id === conn.toPortId);
            
            if (!fromPort || !toPort) return null;
            
            const getDimensions = (m: PlacedMainModule) => {
              if (m.rotation === 90 || m.rotation === 270) {
                return { width: m.height, depth: m.width };
              }
              return { width: m.width, depth: m.height };
            };
            
            const getPortPosition = (module: PlacedMainModule, port: typeof fromPort) => {
              const dim = getDimensions(module);
              let portX = module.x * PIXELS_PER_METER;
              let portY = module.y * PIXELS_PER_METER;
              
              switch(port.position) {
                case 'north':
                  portX += port.x * PIXELS_PER_METER;
                  portY += -5 / scale;
                  break;
                case 'south':
                  portX += port.x * PIXELS_PER_METER;
                  portY += dim.depth * PIXELS_PER_METER + 5 / scale;
                  break;
                case 'east':
                  portX += dim.width * PIXELS_PER_METER + 5 / scale;
                  portY += port.y * PIXELS_PER_METER;
                  break;
                case 'west':
                  portX += -5 / scale;
                  portY += port.y * PIXELS_PER_METER;
                  break;
              }
              
              return { x: portX, y: portY };
            };
            
            const fromPos = getPortPosition(fromModule, fromPort);
            const toPos = getPortPosition(toModule, toPort);

            return (
              <Line
                key={conn.id}
                points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                stroke="hsl(var(--primary))"
                strokeWidth={3 / scale}
                dash={[10, 5]}
              />
            );
          })}
        </Layer>

        {/* Main Modules Layer */}
        <Layer>
          {layoutState.mainModules.map((module) => {
            const isSelected = layoutState.selectedMainModuleId === module.instanceId;
            
            const displayWidth = (module.rotation === 90 || module.rotation === 270) 
              ? module.height 
              : module.width;
            const displayDepth = (module.rotation === 90 || module.rotation === 270) 
              ? module.width 
              : module.height;
            
            return (
              <Group
                key={module.instanceId}
                x={module.x * PIXELS_PER_METER}
                y={module.y * PIXELS_PER_METER}
                draggable
                onDragStart={() => {
                  setIsModuleDragging(true);
                }}
                onClick={() => onStateChange({ 
                  ...layoutState, 
                  selectedMainModuleId: module.instanceId,
                  selectedSubModuleId: null 
                })}
                onDblClick={() => {
                  // Double-click to zoom into module for sub-module placement
                  onStateChange({
                    ...layoutState,
                    zoomedModuleId: module.instanceId,
                    selectedMainModuleId: module.instanceId,
                    selectedSubModuleId: null
                  });
                  toast.info(`Zoomed into ${module.shortName}. Drop sub-modules here or press Esc to exit.`);
                }}
                onTap={() => onStateChange({ 
                  ...layoutState, 
                  selectedMainModuleId: module.instanceId,
                  selectedSubModuleId: null 
                })}
                onDragEnd={(e) => {
                  setIsModuleDragging(false);
                  handleMainModuleDragEnd(module.instanceId, e);
                }}
              >
                <Rect
                  width={displayWidth * PIXELS_PER_METER}
                  height={displayDepth * PIXELS_PER_METER}
                  fill={module.color}
                  stroke={layoutState.zoomedModuleId === module.instanceId ? '#3b82f6' : 
                         isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={layoutState.zoomedModuleId === module.instanceId ? 4 / scale :
                              isSelected ? 3 / scale : 1 / scale}
                  opacity={layoutState.zoomedModuleId === module.instanceId ? 0.9 : 0.7}
                  shadowBlur={layoutState.zoomedModuleId === module.instanceId ? 15 : 
                             isSelected ? 10 : 0}
                  shadowColor={layoutState.zoomedModuleId === module.instanceId ? '#3b82f6' : 
                              "hsl(var(--primary))"}
                  dash={layoutState.zoomedModuleId === module.instanceId ? [10, 5] : undefined}
                />
                
                {/* Port indicators */}
                {module.ports.map(port => {
                  let portX = 0, portY = 0;
                  
                  switch(port.position) {
                    case 'north':
                      portX = port.x * PIXELS_PER_METER;
                      portY = -5 / scale;
                      break;
                    case 'south':
                      portX = port.x * PIXELS_PER_METER;
                      portY = displayDepth * PIXELS_PER_METER + 5 / scale;
                      break;
                    case 'east':
                      portX = displayWidth * PIXELS_PER_METER + 5 / scale;
                      portY = port.y * PIXELS_PER_METER;
                      break;
                    case 'west':
                      portX = -5 / scale;
                      portY = port.y * PIXELS_PER_METER;
                      break;
                  }
                  
                  const portColor = port.type === 'hab-port' ? '#4A90E2' :
                                   port.type === 'svc-port' ? '#50C878' :
                                   port.type === 'airlock-port' ? '#E74C3C' : '#F39C12';
                  
                  const isConnecting = connectingPort?.moduleId === module.instanceId && connectingPort?.portId === port.id;
                  
                  return (
                    <Circle
                      key={port.id}
                      x={portX}
                      y={portY}
                      radius={isConnecting ? 6 / scale : 4 / scale}
                      fill={portColor}
                      stroke={isConnecting ? 'yellow' : 'white'}
                      strokeWidth={isConnecting ? 2 / scale : 1 / scale}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        handlePortClick(module.instanceId, port.id);
                      }}
                      onTap={(e) => {
                        e.cancelBubble = true;
                        handlePortClick(module.instanceId, port.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })}
                
                {/* Module name */}
                <Text
                  text={module.shortName}
                  width={displayWidth * PIXELS_PER_METER}
                  height={displayDepth * PIXELS_PER_METER}
                  align="center"
                  verticalAlign="middle"
                  fontSize={14 / scale}
                  fill="white"
                  fontStyle="bold"
                />
                
                {/* Dimensions */}
                <Text
                  text={`${displayWidth.toFixed(2)}×${displayDepth.toFixed(2)}m`}
                  y={(displayDepth * PIXELS_PER_METER) - (20 / scale)}
                  width={displayWidth * PIXELS_PER_METER}
                  align="center"
                  fontSize={10 / scale}
                  fill="white"
                />
                
                {/* Rotation indicator */}
                {module.rotation !== 0 && (
                  <Text
                    text={`${module.rotation}°`}
                    x={2 / scale}
                    y={2 / scale}
                    fontSize={9 / scale}
                    fill="white"
                    fontStyle="bold"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
        
        {/* Sub-Modules Layer */}
        <Layer>
          {layoutState.subModules.map((subModule) => {
            const parent = layoutState.mainModules.find(m => m.instanceId === subModule.parentInstanceId);
            const isSelected = layoutState.selectedSubModuleId === subModule.instanceId;
            
            // Calculate position - either relative to parent or absolute if no parent
            const posX = parent ? (parent.x + subModule.x) * PIXELS_PER_METER : subModule.x * PIXELS_PER_METER;
            const posY = parent ? (parent.y + subModule.y) * PIXELS_PER_METER : subModule.y * PIXELS_PER_METER;
            
            return (
              <Group
                key={subModule.instanceId}
                x={posX}
                y={posY}
                draggable
                onDragStart={() => {
                  setIsModuleDragging(true);
                }}
                onClick={(e) => {
                  e.cancelBubble = true;
                  onStateChange({ 
                    ...layoutState, 
                    selectedSubModuleId: subModule.instanceId,
                    selectedMainModuleId: null
                  });
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  onStateChange({ 
                    ...layoutState, 
                    selectedSubModuleId: subModule.instanceId,
                    selectedMainModuleId: null
                  });
                }}
                onDblClick={(e) => {
                  e.cancelBubble = true;
                  // Double-click to enable focused movement (visual feedback only)
                  onStateChange({ 
                    ...layoutState, 
                    selectedSubModuleId: subModule.instanceId,
                    selectedMainModuleId: null
                  });
                  toast.info(`${subModule.shortName} selected. Drag to move within ${parent?.shortName || 'module'}. Press DELETE to remove.`);
                }}
                onDragMove={(e) => {
                  if (!parent) return;
                  
                  const parentDims = parent.rotation === 90 || parent.rotation === 270 
                    ? { w: parent.height, h: parent.width } 
                    : { w: parent.width, h: parent.height };
                  
                  const pos = e.target.position();
                  const relativeX = (pos.x / PIXELS_PER_METER) - parent.x;
                  const relativeY = (pos.y / PIXELS_PER_METER) - parent.y;
                  
                  // SIMPLE DRAG SYSTEM - Just constrain to bounds
                  const margin = 0.1; // 10cm margin - generous
                  
                  // Constrain to parent bounds - that's it, keep it simple
                  const constrainedX = Math.max(margin, Math.min(relativeX, parentDims.w - subModule.width - margin));
                  const constrainedY = Math.max(margin, Math.min(relativeY, parentDims.h - subModule.depth - margin));
                  
                  // Snap to grid
                  const snappedX = Math.round(constrainedX / GRID_SIZE) * GRID_SIZE;
                  const snappedY = Math.round(constrainedY / GRID_SIZE) * GRID_SIZE;
                  
                  e.target.position({
                    x: (parent.x + snappedX) * PIXELS_PER_METER,
                    y: (parent.y + snappedY) * PIXELS_PER_METER
                  });
                }}
                onDragEnd={(e) => {
                  setIsModuleDragging(false);
                  handleSubModuleDragEnd(subModule.instanceId, e);
                }}
              >
                <Rect
                  width={subModule.width * PIXELS_PER_METER}
                  height={subModule.depth * PIXELS_PER_METER}
                  fill={subModule.color}
                  stroke={isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.7)'}
                  strokeWidth={isSelected ? 3 / scale : 1 / scale}
                  opacity={0.85}
                  cornerRadius={2 / scale}
                  shadowBlur={isSelected ? 8 : 2}
                  shadowColor={isSelected ? '#8b5cf6' : 'rgba(0,0,0,0.3)'}
                  shadowOffset={{ x: 1 / scale, y: 1 / scale }}
                />
                
                <Text
                  text={subModule.shortName}
                  width={subModule.width * PIXELS_PER_METER}
                  height={subModule.depth * PIXELS_PER_METER}
                  align="center"
                  verticalAlign="middle"
                  fontSize={Math.min(12, Math.max(8, subModule.width * 8)) / scale}
                  fill="white"
                  fontStyle="bold"
                />
                
                {/* Equipment/furniture size indicator */}
                <Text
                  text={`${subModule.width.toFixed(1)}×${subModule.depth.toFixed(1)}m`}
                  x={2 / scale}
                  y={(subModule.depth * PIXELS_PER_METER) - (12 / scale)}
                  fontSize={8 / scale}
                  fill="rgba(255,255,255,0.9)"
                />
                
                {subModule.zAware && (
                  <Text
                    text={`z:${subModule.z.toFixed(1)}m`}
                    x={2 / scale}
                    y={2 / scale}
                    fontSize={8 / scale}
                    fill="rgba(255,255,255,0.8)"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>

      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg">
        <button 
          onClick={() => setShowControls(!showControls)}
          className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/20 rounded-lg transition-colors"
        >
          <span className="text-xs text-muted-foreground font-semibold">Controls</span>
          <span className="text-muted-foreground text-xs">{showControls ? '▼' : '▶'}</span>
        </button>
        {showControls && (
          <div className="px-3 pb-3">
            <ul className="text-xs space-y-1 text-card-foreground">
              <li>• Drag canvas background to pan</li>
              <li>• Scroll wheel to zoom (0.5x-3x)</li>
              <li>• Drag modules to reposition</li>
              <li>• <strong>Double-click</strong> main module to zoom in for sub-modules</li>
              <li>• Click ports to connect modules</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">R</kbd> to rotate</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Del</kbd> to delete</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to exit zoom/cancel</li>
            </ul>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg">
        <p className="text-xs text-muted-foreground">Main Modules: {layoutState.mainModules.length}</p>
        <p className="text-xs text-muted-foreground">Sub-Modules: {layoutState.subModules.length}</p>
        <p className="text-xs text-muted-foreground">Connections: {layoutState.connections.length}</p>
        <p className="text-xs text-muted-foreground">Zoom: {Math.round(scale * 100)}%</p>
        {layoutState.zoomedModuleId && (
          <p className="text-xs text-blue-600 mt-1 font-semibold">📍 Zoomed: {layoutState.mainModules.find(m => m.instanceId === layoutState.zoomedModuleId)?.shortName}</p>
        )}
        {layoutState.selectedMainModuleId && (
          <p className="text-xs text-primary mt-1">Selected: {layoutState.mainModules.find(m => m.instanceId === layoutState.selectedMainModuleId)?.shortName}</p>
        )}
        {layoutState.selectedSubModuleId && (
          <p className="text-xs text-ring mt-1">Selected: {layoutState.subModules.find(s => s.instanceId === layoutState.selectedSubModuleId)?.shortName}</p>
        )}
      </div>
    </div>
  );
};
