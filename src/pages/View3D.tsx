import React, { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import * as THREE from "three";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

interface Port {
  id: string;
  type: string;
  position: "north" | "south" | "east" | "west";
  x: number;
  y: number;
}

interface MainModule {
  id: string;
  name: string;
  shortName: string;
  width: number;   // ignore for exterior layout
  depth: number;   // ignore for exterior layout
  height: number;  // ignore for exterior layout
  volume: number;
  category: string;
  color: string;
  ports: Port[];
  allowedSubModules: string[];
  maxConnections?: number;
  x: number;       // ignore for exterior layout
  y: number;       // ignore for exterior layout
  rotation: number;
  instanceId: string;
}

interface Connection {
  id: string;
  fromModuleId: string;
  fromPortId: string;
  toModuleId: string;
  toPortId: string;
}

interface ModuleConfig {
  crewSize: number;
  mainModules: MainModule[];
  subModules: any[];
  connections: Connection[];
  selectedMainModuleId: string | null;
  selectedSubModuleId: string | null;
  zoomedModuleId: string | null;
}

// ----------- helpers -----------
const SNAP_GAP = 0; // meters separation between shells

type Bounds = { width: number; depth: number };

function getPort(mod: MainModule, portId: string) {
  return mod.ports.find((p) => p.id === portId) || null;
}

// place TO relative to FROM using measured bounds (no scaling)
function placeRelativeByBounds(
  from: MainModule,
  to: MainModule,
  fromPortPos: Port["position"],
  toPortPos: Port["position"],
  fromPos: { x: number; y: number },
  bFrom: Bounds,
  bTo: Bounds
): { x: number; y: number } {
  const dxHalf = (bFrom.width + bTo.width) / 2 + (fromPortPos === "east" || fromPortPos === "west" ? SNAP_GAP : 0);
  const dyHalf = (bFrom.depth + bTo.depth) / 2 + (fromPortPos === "north" || fromPortPos === "south" ? SNAP_GAP : 0);

  let x = fromPos.x;
  let y = fromPos.y;

  // Opposite edges — snap center-to-center so edges just touch + gap
  if (fromPortPos === "east" && toPortPos === "west") {
    x = fromPos.x + dxHalf;
  } else if (fromPortPos === "west" && toPortPos === "east") {
    x = fromPos.x - dxHalf;
  } else if (fromPortPos === "north" && toPortPos === "south") {
    y = fromPos.y - dyHalf;
  } else if (fromPortPos === "south" && toPortPos === "north") {
    y = fromPos.y + dyHalf;
  } else {
    // Non-opposite (fallback)
    if (fromPortPos === "east") x = fromPos.x + (bFrom.width + bTo.width) / 2 + SNAP_GAP;
    if (fromPortPos === "west") x = fromPos.x - (bFrom.width + bTo.width) / 2 - SNAP_GAP;
    if (fromPortPos === "south") y = fromPos.y + (bFrom.depth + bTo.depth) / 2 + SNAP_GAP;
    if (fromPortPos === "north") y = fromPos.y - (bFrom.depth + bTo.depth) / 2 - SNAP_GAP;
  }
  return { x, y };
}

function placeInverseByBounds(
  to: MainModule,
  from: MainModule,
  toPortPos: Port["position"],
  fromPortPos: Port["position"],
  toPos: { x: number; y: number },
  bTo: Bounds,
  bFrom: Bounds
) {
  // swap roles and reuse the same math
  return placeRelativeByBounds(to, from, toPortPos, fromPortPos, toPos, bTo, bFrom);
}

function solvePositionsWithMeasuredBounds(
  modules: MainModule[],
  connections: Connection[],
  bounds: Map<string, Bounds>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (modules.length === 0) return positions;

  // seed: put first module at origin ONLY if it has bounds
  if (bounds.has(modules[0].instanceId)) {
    positions.set(modules[0].instanceId, { x: 0, y: 0 });
  }

  // index
  const modById = new Map<string, MainModule>();
  modules.forEach((m) => modById.set(m.instanceId, m));

  // iterate until stable (only uses modules that already have measured bounds)
  let changed = true;
  let guard = 0;
  while (changed && guard < 1000) {
    changed = false;
    guard++;

    for (const conn of connections) {
      const from = modById.get(conn.fromModuleId);
      const to = modById.get(conn.toModuleId);
      if (!from || !to) continue;

      const bFrom = bounds.get(from.instanceId);
      const bTo = bounds.get(to.instanceId);
      if (!bFrom || !bTo) continue; // skip until both measured

      const fromPort = getPort(from, conn.fromPortId);
      const toPort = getPort(to, conn.toPortId);
      if (!fromPort || !toPort) continue;

      const fromPos = positions.get(from.instanceId);
      const toPos = positions.get(to.instanceId);

      if (fromPos && !toPos) {
        const newTo = placeRelativeByBounds(
          from, to, fromPort.position, toPort.position, fromPos, bFrom, bTo
        );
        positions.set(to.instanceId, newTo);
        changed = true;
      } else if (!fromPos && toPos) {
        const newFrom = placeInverseByBounds(
          to, from, toPort.position, fromPort.position, toPos, bTo, bFrom
        );
        positions.set(from.instanceId, newFrom);
        changed = true;
      }
      // if both known, you could validate consistency; skipping.
    }
  }
  return positions;
}

// ------------- GLB loader that MEASURES (no scaling, no stretching) -------------
function LoadedModule({
  module,
  glbFile,
  worldPos,             // where to render (when available)
  onMeasured,           // report measured bounds once
  onLoadSuccess,
  onLoadError,
}: {
  module: MainModule;
  glbFile: string;
  worldPos?: { x: number; y: number };
  onMeasured: (instanceId: string, b: Bounds) => void;
  onLoadSuccess: (name: string) => void;
  onLoadError: (name: string, error: any) => void;
}) {
  try {
    const { scene } = useGLTF(`/assets/${glbFile}`);
    // Clone the scene for each instance to allow duplicates
    const cloned = useMemo(() => scene.clone(true), [scene]);

    // Measure original size from authoring (no scaling/recenter applied)
    useEffect(() => {
      try {
        cloned.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(cloned);
        const size = new THREE.Vector3();
        box.getSize(size);
        const b: Bounds = { width: size.x, depth: size.z };
        onMeasured(module.instanceId, b);
        onLoadSuccess(module.shortName);
      } catch (e) {
        onLoadError(module.shortName, e);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cloned, module.instanceId]);

    if (!worldPos) {
      return null; // don't render until we know where it should go
    }

  return (
    <primitive
      object={cloned}
      position={[worldPos.x, 0, worldPos.y]}  // (x,y)->(x,z)
      rotation={[0, module.rotation, 0]}
      userData={{
        moduleId: module.instanceId,
        moduleName: module.shortName,
        moduleType: module.category
      }}
    />
  );
  } catch (error) {
    onLoadError(module.shortName, error);
    return null;
  }
}

// ------------------------------ Scene ------------------------------
function Scene({ moduleConfig, onSceneReady }: { moduleConfig: ModuleConfig; onSceneReady?: (scene: THREE.Scene) => void }) {
  // bounds measured from GLBs (by instanceId)
  const [measuredBounds, setMeasuredBounds] = useState<Map<string, Bounds>>(new Map());
  // solved positions (by instanceId)
  const [modulePositions, setModulePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  const [loaded, setLoaded] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);

  // Get reference to the Three.js group
  const sceneRef = useRef<THREE.Group>(null);

  // Pass scene reference to parent when ready
  useEffect(() => {
    if (sceneRef.current && onSceneReady) {
      // Get the scene from the group's parent (the Canvas scene)
      const scene = sceneRef.current.parent;
      if (scene) {
        onSceneReady(scene as THREE.Scene);
      }
    }
  }, [onSceneReady]);

  // when bounds update (from any GLB), recompute positions for all modules that have bounds
  useEffect(() => {
    const positions = solvePositionsWithMeasuredBounds(
      moduleConfig.mainModules,
      moduleConfig.connections,
      measuredBounds
    );
    setModulePositions(positions);
  }, [measuredBounds, moduleConfig]);

  const handleMeasured = (instanceId: string, b: Bounds) => {
    setMeasuredBounds((prev) => {
      const next = new Map(prev);
      next.set(instanceId, b);
      return next;
    });
  };

  const handleLoadSuccess = (name: string) => setLoaded((p) => [...p, name]);
  const handleLoadError = (name: string, err: any) => {
    console.warn(`Failed to load ${name}:`, err);
    setFailed((p) => [...p, name]);
  };

  return (
    <group ref={sceneRef}>
      {/* simple lights, no floor */}
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <ambientLight intensity={0.35} />

      {/* render modules only when we know their measured bounds + solved position */}
      {moduleConfig?.mainModules.map((module) => {
        const glbFile = moduleMapper[module.shortName];
        if (!glbFile) return null;

        const pos = modulePositions.get(module.instanceId);    // may be undefined until enough bounds exist
        const bounds = measuredBounds.get(module.instanceId);  // triggers measurement on first load

        return (
          <Suspense key={module.instanceId} fallback={null}>
            <LoadedModule
              module={module}
              glbFile={glbFile}
              worldPos={pos}
              onMeasured={handleMeasured}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
            />
          </Suspense>
        );
      })}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={false}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={60}
      />
    </group>
  );
}

// Module mapping from shortName to GLB file
const moduleMapper: Record<string, string> = {
  "Wardroom": "Wardroom.glb",
  "Hygiene": "Hygiene.glb",
  "Galley": "Galley.glb",
  "Medical": "Medical.glb",
  "Maintenance": "Maintenance.glb",
  "Storage": "Storage.glb",
  "Social": "Social.glb",
  "Vanity": "Vanity.glb",
  "Recreation": "Recreation.glb"
};

// Camera controller to automatically focus on all modules
function CameraController({ modules }: { modules: MainModule[] }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (modules.length === 0) return;
    
    // Calculate bounding box of all modules
    const box = new THREE.Box3();
    
    modules.forEach(module => {
      // Estimate module size (this is a rough approximation)
      const moduleSize = 2; // Assume average module is ~2m in each dimension
      const center = new THREE.Vector3(module.x || 0, 0, module.y || 0);
      
      box.expandByPoint(new THREE.Vector3(
        center.x - moduleSize/2, center.y - moduleSize/2, center.z - moduleSize/2
      ));
      box.expandByPoint(new THREE.Vector3(
        center.x + moduleSize/2, center.y + moduleSize/2, center.z + moduleSize/2
      ));
    });
    
    // Calculate center and size of bounding box
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Calculate distance needed to fit all modules in view
    const maxDim = Math.max(size.x, size.z);
    const distance = maxDim * 2; // Add some padding
    
    // Position camera to look at the center
    const cameraPosition = new THREE.Vector3(
      center.x,
      Math.max(distance * 0.5, 3), // Keep camera above ground
      center.z + distance
    );
    
    // Animate camera to new position
    if (controls) {
      // Set camera position
      camera.position.copy(cameraPosition);
      camera.lookAt(center);
      
      // Update controls target to center on modules
      (controls as any).target.copy(center);
      (controls as any).update();
    }
  }, [modules, camera, controls]);
  
  return null;
}

// ------------------------------ View3D Component ------------------------------
export default function View3D() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sceneRef, setSceneRef] = useState<THREE.Scene | null>(null);
  
  // Get layout state from navigation state and convert to ModuleConfig
  const layoutState = location.state?.layoutState || {
    crewSize: 4,
    mainModules: [],
    subModules: [],
    connections: [],
    selectedMainModuleId: null,
    selectedSubModuleId: null,
    zoomedModuleId: null
  };

  const moduleConfig: ModuleConfig = {
    crewSize: layoutState.crewSize,
    mainModules: layoutState.mainModules,
    subModules: layoutState.subModules,
    connections: layoutState.connections,
    selectedMainModuleId: layoutState.selectedMainModuleId,
    selectedSubModuleId: layoutState.selectedSubModuleId,
    zoomedModuleId: layoutState.zoomedModuleId
  };

  const exportGLB = () => {
    if (!sceneRef) {
      console.warn('Scene not ready for export');
      return;
    }

    try {
      const exporter = new GLTFExporter();
      const options = {
        binary: true,
        includeCustomExtensions: true,
      };

      exporter.parse(
        sceneRef,
        (glb) => {
          // Create download link
          const blob = new Blob([glb as ArrayBuffer], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `space-station-layout-${Date.now()}.glb`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          console.log('✅ Space station layout exported successfully!');
        },
        (error) => {
          console.error('❌ Export failed:', error);
        },
        options
      );
    } catch (error) {
      console.error('❌ Export error:', error);
    }
  };

  const exportIndividualGLBs = () => {
    console.log('Individual export functionality temporarily disabled - will be re-enabled once basic 3D view is working');
    // TODO: Re-enable export functionality
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/', { state: { layoutState } })}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to 2D
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-semibold text-lg text-card-foreground">
            Habitat Layout Builder - 3D View
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={exportGLB} variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Complete Station
          </Button>
          <Button onClick={exportIndividualGLBs} variant="outline" size="sm" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export Individual Modules
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas
          camera={{ position: [0, 2, 10], fov: 60, near: 0.1, far: 1000 }}
          shadows
        >
          <Scene moduleConfig={moduleConfig} onSceneReady={setSceneRef} />
          <CameraController modules={moduleConfig.mainModules} />
        </Canvas>
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t border-border bg-card px-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Modules: {moduleConfig.mainModules.length}</span>
          <span>Connections: {moduleConfig.connections.length}</span>
          <span>Crew Size: {moduleConfig.crewSize}</span>
        </div>
        <div>
          3D Visualization - Use mouse to orbit, zoom, and pan
        </div>
      </div>
    </div>
  );
}