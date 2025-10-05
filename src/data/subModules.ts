export type AnchorType = 'floor' | 'wall' | 'ceiling';

export interface SubModule {
  id: string;
  name: string;
  shortName: string;
  width: number; // meters
  depth: number; // meters (length in specs)
  height: number; // meters
  volume: number; // m³
  category: 'hygiene' | 'dining' | 'storage' | 'maintenance' | 'habitat' | 'medical' | 'galley';
  color: string;
  allowedAnchors: AnchorType[];
  zAware: boolean; // whether height matters for placement
}

export const subModules: SubModule[] = [
  // J. Shower stall
  {
    id: 'shower-stall',
    name: 'Shower Stall',
    shortName: 'Shower',
    width: 0.70, // Reduced from 0.80
    depth: 0.70, // Reduced from 0.80
    height: 2.10,
    volume: 1.03,
    category: 'hygiene',
    color: '#50C878',
    allowedAnchors: ['floor'],
    zAware: true
  },

  // K. Dining table zone (tabletop / creative)
  {
    id: 'dining-table',
    name: 'Dining Table Zone',
    shortName: 'Table',
    width: 0.70, // Reduced from 0.80
    depth: 1.00, // Reduced from 1.10
    height: 0.75,
    volume: 0.53,
    category: 'dining',
    color: '#F39C12',
    allowedAnchors: ['floor'],
    zAware: false
  },

  // L. Storage locker (small-item containment)
  {
    id: 'locker',
    name: 'Storage Locker',
    shortName: 'Locker',
    width: 0.55, // Reduced from 0.65
    depth: 0.45, // Reduced from 0.54
    height: 1.91,
    volume: 0.47,
    category: 'storage',
    color: '#7F8C8D',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },

  // M. Logistics rack
  {
    id: 'logistics-rack',
    name: 'Logistics Rack',
    shortName: 'Log Rack',
    width: 0.50, // Reduced from 0.60
    depth: 1.00, // Reduced from 1.20
    height: 2.00,
    volume: 1.00,
    category: 'storage',
    color: '#34495E',
    allowedAnchors: ['floor'],
    zAware: true
  },

  // N. Workbench surface
  {
    id: 'workbench-surface',
    name: 'Workbench Surface',
    shortName: 'Workbench',
    width: 1.00, // Reduced from 1.20
    depth: 0.50, // Reduced from 0.60
    height: 0.90,
    volume: 0.45,
    category: 'maintenance',
    color: '#95A5A6',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },

  // O. Private mirror station
  {
    id: 'mirror-station',
    name: 'Private Mirror Station',
    shortName: 'Mirror',
    width: 0.50,
    depth: 0.15,
    height: 0.80,
    volume: 0.06,
    category: 'habitat',
    color: '#4A90E2',
    allowedAnchors: ['wall'],
    zAware: true
  },

  // P. Personal leisure seat
  {
    id: 'leisure-seat',
    name: 'Personal Leisure Seat',
    shortName: 'Seat',
    width: 0.75, // Reduced from 0.91
    depth: 0.55, // Reduced from 0.66
    height: 2.00,
    volume: 0.83,
    category: 'habitat',
    color: '#5C9FE8',
    allowedAnchors: ['floor'],
    zAware: true
  },

  // Q. Food-prep console
  {
    id: 'food-prep-console',
    name: 'Food-Prep Console',
    shortName: 'Food Prep',
    width: 0.85, // Reduced from 1.00
    depth: 0.50, // Reduced from 0.60
    height: 0.90,
    volume: 0.38,
    category: 'galley',
    color: '#F5A623',
    allowedAnchors: ['floor', 'wall'],
    zAware: true
  },

  // R. Medical treatment bay
  {
    id: 'treatment-bay',
    name: 'Medical Treatment Bay',
    shortName: 'Med Bay',
    width: 1.00, // Reduced from 1.20
    depth: 0.70, // Reduced from 0.80
    height: 1.20,
    volume: 0.84,
    category: 'medical',
    color: '#1ABC9C',
    allowedAnchors: ['floor'],
    zAware: true
  }
];
