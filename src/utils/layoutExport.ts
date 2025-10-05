import { LayoutState } from '@/types/layout';

export interface LayoutGLBData {
  glbBlob: Blob | null;
  glbUrl: string;
  totalMass: number;
  moduleCount: number;
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

/**
 * Generates layout data with module information for the orbital simulator
 * Returns layout metadata and module positions for dynamic loading
 */
export async function generateLayoutGLB(layoutState: LayoutState): Promise<LayoutGLBData> {
  // Calculate total mass from all modules
  const totalMass = layoutState.mainModules.reduce((sum, module) => sum + module.mass, 0);
  
  // Create a data URL containing the layout information that the orbital simulator can use
  // This approach passes the complete layout data rather than trying to create a single GLB file
  const layoutData = {
    modules: layoutState.mainModules.map(module => ({
      shortName: module.shortName,
      glbFile: moduleMapper[module.shortName],
      position: { x: module.x, y: 0, z: module.y },
      rotation: { x: 0, y: (module.rotation || 0) * Math.PI / 180, z: 0 },
      mass: module.mass,
      width: module.width,
      height: module.height,
      depth: module.depth,
      instanceId: module.instanceId
    })),
    totalMass,
    moduleCount: layoutState.mainModules.length
  };
  
  // Create a data URL that contains the layout information
  const layoutJson = JSON.stringify(layoutData);
  const dataUrl = `data:application/json;base64,${btoa(layoutJson)}`;
  
  return {
    glbBlob: null, // Not using a single GLB, using individual modules
    glbUrl: dataUrl, // Contains layout data for dynamic loading
    totalMass,
    moduleCount: layoutState.mainModules.length
  };
}

/**
 * Cleanup function to revoke GLB URLs when they're no longer needed
 */
export function cleanupLayoutGLB(glbUrl: string) {
  if (glbUrl) {
    URL.revokeObjectURL(glbUrl);
  }
}