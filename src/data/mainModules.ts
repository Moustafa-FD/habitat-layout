export type PortType = 'hab-port' | 'svc-port' | 'std-port' | 'airlock-port';

export interface Port {
  id: string;
  type: PortType;
  position: 'north' | 'south' | 'east' | 'west' | 'top' | 'bottom';
  x: number; // relative to module
  y: number; // relative to module
}

export interface MainModule {
  id: string;
  name: string;
  shortName: string;
  width: number; // meters
  depth: number; // meters (length in your specs)
  height: number; // meters
  volume: number; // m³ internal volume
  category: 'wardroom' | 'hygiene' | 'galley' | 'medical' | 'maintenance' | 'storage' | 'social' | 'habitat';
  color: string;
  ports: Port[];
  allowedSubModules: string[]; // IDs of allowed sub-modules
  maxConnections?: number;
}

export const mainModules: MainModule[] = [
  // A. Wardroom / Dining (Full-crew dining)
  {
    id: 'wardroom',
    name: 'Wardroom / Dining Module',
    shortName: 'Wardroom',
    width: 1.19,
    depth: 1.19,
    height: 1.91,
    volume: 10.09,
    category: 'wardroom',
    color: '#F39C12',
    ports: [
      { id: 'ward-n', type: 'std-port', position: 'north', x: 0.595, y: 0 },
      { id: 'ward-s', type: 'std-port', position: 'south', x: 0.595, y: 1.19 },
      { id: 'ward-e', type: 'std-port', position: 'east', x: 1.19, y: 0.595 },
      { id: 'ward-w', type: 'std-port', position: 'west', x: 0, y: 0.595 },
    ],
    allowedSubModules: ['dining-table', 'locker', 'leisure-seat'],
    maxConnections: 4
  },

  // B. Hygiene Module (Full-body cleaning / shower)
  {
    id: 'hygiene',
    name: 'Hygiene Module',
    shortName: 'Hygiene',
    width: 1.21,
    depth: 1.43,
    height: 2.51,
    volume: 4.34,
    category: 'hygiene',
    color: '#50C878',
    ports: [
      { id: 'hyg-n', type: 'svc-port', position: 'north', x: 0.605, y: 0 },
      { id: 'hyg-s', type: 'svc-port', position: 'south', x: 0.605, y: 1.43 },
      { id: 'hyg-e', type: 'std-port', position: 'east', x: 1.21, y: 0.715 },
      { id: 'hyg-w', type: 'std-port', position: 'west', x: 0, y: 0.715 },
    ],
    allowedSubModules: ['shower-stall', 'locker'],
    maxConnections: 4
  },

  // C. Galley Module (Food preparation)
  {
    id: 'galley',
    name: 'Galley Module',
    shortName: 'Galley',
    width: 1.41,
    depth: 1.41,
    height: 1.91,
    volume: 4.35,
    category: 'galley',
    color: '#F5A623',
    ports: [
      { id: 'gal-n', type: 'std-port', position: 'north', x: 0.705, y: 0 },
      { id: 'gal-s', type: 'std-port', position: 'south', x: 0.705, y: 1.41 },
      { id: 'gal-e', type: 'std-port', position: 'east', x: 1.41, y: 0.705 },
      { id: 'gal-w', type: 'std-port', position: 'west', x: 0, y: 0.705 },
    ],
    allowedSubModules: ['food-prep-console', 'locker'],
    maxConnections: 4
  },

  // D. Medical Module (Advanced medical care bay)
  {
    id: 'medical',
    name: 'Medical Module',
    shortName: 'Medical',
    width: 1.25,
    depth: 1.25,
    height: 2.1,
    volume: 3.28,
    category: 'medical',
    color: '#E74C3C',
    ports: [
      { id: 'med-n', type: 'std-port', position: 'north', x: 0.625, y: 0 },
      { id: 'med-s', type: 'std-port', position: 'south', x: 0.625, y: 1.25 },
      { id: 'med-e', type: 'std-port', position: 'east', x: 1.25, y: 0.625 },
      { id: 'med-w', type: 'std-port', position: 'west', x: 0, y: 0.625 },
    ],
    allowedSubModules: ['medical-bay', 'locker'],
    maxConnections: 4
  },

  // E. Maintenance / Workbench Module (Work-surface access)
  {
    id: 'maintenance',
    name: 'Maintenance Module',
    shortName: 'Maintenance',
    width: 1.3,
    depth: 1.3,
    height: 1.9,
    volume: 3.21,
    category: 'maintenance',
    color: '#34495E',
    ports: [
      { id: 'maint-n', type: 'std-port', position: 'north', x: 0.65, y: 0 },
      { id: 'maint-s', type: 'std-port', position: 'south', x: 0.65, y: 1.3 },
      { id: 'maint-e', type: 'std-port', position: 'east', x: 1.3, y: 0.65 },
      { id: 'maint-w', type: 'std-port', position: 'west', x: 0, y: 0.65 },
    ],
    allowedSubModules: ['tool-rack', 'workbench'],
    maxConnections: 4
  },

  // F. Storage / Logistics Module (Temporary stowage)
  {
    id: 'storage',
    name: 'Storage Module',
    shortName: 'Storage',
    width: 1.35,
    depth: 1.35,
    height: 1.8,
    volume: 3.28,
    category: 'storage',
    color: '#95A5A6',
    ports: [
      { id: 'stor-n', type: 'std-port', position: 'north', x: 0.675, y: 0 },
      { id: 'stor-s', type: 'std-port', position: 'south', x: 0.675, y: 1.35 },
      { id: 'stor-e', type: 'std-port', position: 'east', x: 1.35, y: 0.675 },
      { id: 'stor-w', type: 'std-port', position: 'west', x: 0, y: 0.675 },
    ],
    allowedSubModules: ['shelving', 'locker'],
    maxConnections: 4
  },

  // G. Group Socialization Module (Tabletop / creative area)
  {
    id: 'social',
    name: 'Social Module',
    shortName: 'Social',
    width: 1.4,
    depth: 1.4,
    height: 2.0,
    volume: 3.92,
    category: 'social',
    color: '#E91E63',
    ports: [
      { id: 'soc-n', type: 'std-port', position: 'north', x: 0.7, y: 0 },
      { id: 'soc-s', type: 'std-port', position: 'south', x: 0.7, y: 1.4 },
      { id: 'soc-e', type: 'std-port', position: 'east', x: 1.4, y: 0.7 },
      { id: 'soc-w', type: 'std-port', position: 'west', x: 0, y: 0.7 },
    ],
    allowedSubModules: ['meeting-table', 'leisure-seat'],
    maxConnections: 4
  },

  // H. Private Habitation — Vanity / Mirror area
  {
    id: 'vanity',
    name: 'Vanity Module',
    shortName: 'Vanity',
    width: 1.2,
    depth: 1.2,
    height: 1.8,
    volume: 2.59,
    category: 'vanity',
    color: '#FF69B4',
    ports: [
      { id: 'van-n', type: 'std-port', position: 'north', x: 0.6, y: 0 },
      { id: 'van-s', type: 'std-port', position: 'south', x: 0.6, y: 1.2 },
      { id: 'van-e', type: 'std-port', position: 'east', x: 1.2, y: 0.6 },
      { id: 'van-w', type: 'std-port', position: 'west', x: 0, y: 0.6 },
    ],
    allowedSubModules: ['mirror', 'storage-cabinet'],
    maxConnections: 4
  },

  // I. Private Habitation — Personal recreation nook
  {
    id: 'recreation',
    name: 'Recreation Module',
    shortName: 'Recreation',
    width: 1.5,
    depth: 1.5,
    height: 2.0,
    volume: 4.5,
    category: 'recreation',
    color: '#9B59B6',
    ports: [
      { id: 'rec-n', type: 'std-port', position: 'north', x: 0.75, y: 0 },
      { id: 'rec-s', type: 'std-port', position: 'south', x: 0.75, y: 1.5 },
      { id: 'rec-e', type: 'std-port', position: 'east', x: 1.5, y: 0.75 },
      { id: 'rec-w', type: 'std-port', position: 'west', x: 0, y: 0.75 },
    ],
    allowedSubModules: ['exercise-equipment', 'leisure-seat'],
    maxConnections: 4
  }
];

export const canPortsConnect = (port1Type: PortType, port2Type: PortType): boolean => {
  // Same types can always connect
  if (port1Type === port2Type) return true;
  
  // std-port can connect to anything
  if (port1Type === 'std-port' || port2Type === 'std-port') return true;
  
  // hab-port can connect to svc-port
  if ((port1Type === 'hab-port' && port2Type === 'svc-port') || 
      (port1Type === 'svc-port' && port2Type === 'hab-port')) return true;
  
  return false;
};
