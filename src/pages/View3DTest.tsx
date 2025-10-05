import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import * as THREE from "three";

// Simple test component to load GLB files from layout data
function TestModule({ module }: { module: any }) {
  const glbFile = moduleMapper[module.shortName];
  if (!glbFile) return null;
  
  const { scene } = useGLTF(`/assets/${glbFile}`);
  
  return (
    <primitive 
      object={scene} 
      position={[module.x || 0, 0, module.y || 0]}
      rotation={[0, module.rotation || 0, 0]}
    />
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
function CameraController({ modules }: { modules: any[] }) {
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

export default function View3DTest() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get layout state from navigation state
  const layoutState = location.state?.layoutState || {
    crewSize: 4,
    mainModules: [],
    subModules: [],
    connections: [],
    selectedMainModuleId: null,
    selectedSubModuleId: null,
    zoomedModuleId: null
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
            Habitat Layout Builder - 3D Test
          </h1>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
          <Suspense fallback={null}>
            {layoutState.mainModules.map((module, index) => (
              <TestModule key={module.instanceId || index} module={module} />
            ))}
          </Suspense>
          <CameraController modules={layoutState.mainModules} />
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
        </Canvas>
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t border-border bg-card px-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Modules: {layoutState.mainModules.length}</span>
          <span>Test Mode - Single Module</span>
        </div>
      </div>
    </div>
  );
}
