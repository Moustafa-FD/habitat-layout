import { MainModule, Port } from '@/data/mainModules';
import { SubModule } from '@/data/subModules';

export interface PlacedMainModule extends MainModule {
  instanceId: string;
  x: number; // position in meters
  y: number; // position in meters
  rotation: number; // degrees: 0, 90, 180, 270
}

export interface PlacedSubModule extends SubModule {
  instanceId: string;
  parentInstanceId: string; // instanceId of the parent main module
  x: number; // relative to parent module
  y: number; // relative to parent module
  z: number; // z-layer/height within parent
}

export interface Connection {
  id: string;
  fromModuleId: string;
  fromPortId: string;
  toModuleId: string;
  toPortId: string;
}

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  moduleId?: string;
}

export interface LayoutState {
  crewSize: number;
  mainModules: PlacedMainModule[];
  subModules: PlacedSubModule[];
  connections: Connection[];
  selectedMainModuleId: string | null;
  selectedSubModuleId: string | null;
  zoomedModuleId: string | null; // ID of main module we're zoomed into for sub-module placement
}
