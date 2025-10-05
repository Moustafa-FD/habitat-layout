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
  mass: number; // kg
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
    mass: 2800, // Dining module with furniture and equipment
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
    mass: 3200, // Hygiene module with plumbing and water systems
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
    mass: 3500, // Galley module with food prep equipment and appliances
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
    width: 2.00,
    depth: 1.45,
    height: 2.00,
    volume: 5.80,
    mass: 4500, // Medical module with life support and medical equipment
    category: 'medical',
    color: '#1ABC9C',
    ports: [
      { id: 'med-n', type: 'std-port', position: 'north', x: 1.00, y: 0 },
      { id: 'med-s', type: 'std-port', position: 'south', x: 1.00, y: 1.45 },
      { id: 'med-e', type: 'std-port', position: 'east', x: 2.00, y: 0.725 },
      { id: 'med-w', type: 'std-port', position: 'west', x: 0, y: 0.725 },
    ],
    allowedSubModules: ['treatment-bay', 'locker'],
    maxConnections: 4
  },

  // E. Maintenance / Workbench Module (Work-surface access)
  {
    id: 'maintenance',
    name: 'Maintenance / Workbench Module',
    shortName: 'Maintenance',
    width: 2.02,
    depth: 0.98,
    height: 1.91,
    volume: 4.35,
    mass: 3800, // Maintenance module with tools and repair equipment
    category: 'maintenance',
    color: '#95A5A6',
    ports: [
      { id: 'maint-n', type: 'std-port', position: 'north', x: 1.01, y: 0 },
      { id: 'maint-s', type: 'std-port', position: 'south', x: 1.01, y: 0.98 },
      { id: 'maint-e', type: 'std-port', position: 'east', x: 2.02, y: 0.49 },
      { id: 'maint-w', type: 'std-port', position: 'west', x: 0, y: 0.49 },
    ],
    allowedSubModules: ['workbench-surface', 'locker'],
    maxConnections: 4
  },

  // F. Storage / Logistics Module (Temporary stowage)
  {
    id: 'storage-logistics',
    name: 'Storage / Logistics Module',
    shortName: 'Storage',
    width: 0.98,
    depth: 2.02,
    height: 2.31,
    volume: 6.00,
    mass: 4200, // Storage module with logistics and cargo systems
    category: 'storage',
    color: '#7F8C8D',
    ports: [
      { id: 'stor-n', type: 'std-port', position: 'north', x: 0.49, y: 0 },
      { id: 'stor-s', type: 'std-port', position: 'south', x: 0.49, y: 2.02 },
      { id: 'stor-e', type: 'airlock-port', position: 'east', x: 0.98, y: 1.01 },
      { id: 'stor-w', type: 'std-port', position: 'west', x: 0, y: 1.01 },
    ],
    allowedSubModules: ['logistics-rack', 'locker'],
    maxConnections: 4
  },

  // G. Group Socialization Module (Tabletop / creative area)
  {
    id: 'group-social',
    name: 'Group Socialization Module',
    shortName: 'Social',
    width: 1.91,
    depth: 1.91,
    height: 1.49,
    volume: 10.09,
    mass: 3400, // Social module with recreational equipment
    category: 'social',
    color: '#9B59B6',
    ports: [
      { id: 'soc-n', type: 'std-port', position: 'north', x: 0.955, y: 0 },
      { id: 'soc-s', type: 'std-port', position: 'south', x: 0.955, y: 1.91 },
      { id: 'soc-e', type: 'std-port', position: 'east', x: 1.91, y: 0.955 },
      { id: 'soc-w', type: 'std-port', position: 'west', x: 0, y: 0.955 },
    ],
    allowedSubModules: ['dining-table', 'leisure-seat'],
    maxConnections: 4
  },

  // H. Private Habitation — Vanity / Mirror area
  {
    id: 'private-vanity',
    name: 'Private Habitation — Vanity / Mirror',
    shortName: 'Vanity',
    width: 0.91,
    depth: 0.99,
    height: 2.00,
    volume: 1.80,
    mass: 1800, // Private habitat with personal systems
    category: 'habitat',
    color: '#4A90E2',
    ports: [
      { id: 'van-n', type: 'hab-port', position: 'north', x: 0.455, y: 0 },
      { id: 'van-s', type: 'hab-port', position: 'south', x: 0.455, y: 0.99 },
      { id: 'van-e', type: 'std-port', position: 'east', x: 0.91, y: 0.495 },
      { id: 'van-w', type: 'std-port', position: 'west', x: 0, y: 0.495 },
    ],
    allowedSubModules: ['mirror-station', 'leisure-seat', 'locker'],
    maxConnections: 4
  },

  // I. Private Habitation — Personal recreation nook
  {
    id: 'private-recreation',
    name: 'Private Habitation — Recreation Nook',
    shortName: 'Recreation',
    width: 0.91,
    depth: 0.66,
    height: 2.00,
    volume: 1.20,
    mass: 1600, // Private recreation with entertainment systems
    category: 'habitat',
    color: '#5C9FE8',
    ports: [
      { id: 'rec-n', type: 'hab-port', position: 'north', x: 0.455, y: 0 },
      { id: 'rec-s', type: 'hab-port', position: 'south', x: 0.455, y: 0.66 },
      { id: 'rec-e', type: 'std-port', position: 'east', x: 0.91, y: 0.33 },
      { id: 'rec-w', type: 'std-port', position: 'west', x: 0, y: 0.33 },
    ],
    allowedSubModules: ['mirror-station', 'leisure-seat', 'locker'],
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
