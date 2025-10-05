export type AnchorType = 'floor' | 'wall' | 'ceiling';

export interface SubModule {
  id: string;
  name: string;
  shortName: string;
  width: number; // meters
  depth: number; // meters (length in specs)
  height: number; // meters
  volume: number; // m³
  category: 'hygiene' | 'dining' | 'storage' | 'maintenance' | 'habitat' | 'medical' | 'galley' | 'exercise' | 'mission' | 'command' | 'waste' | 'exercise';
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
  },
  {
    id: 'cycle-ergometer',
    name: 'Cycle Ergometer',
    shortName: 'Cycle',
    width: 0.60, depth: 1.10, height: 1.20, volume: 0.79,
    category: 'exercise', color: '#2ECC71',
    allowedAnchors: ['floor'], zAware: true
  },
  {
    id: 'treadmill',
    name: 'Treadmill',
    shortName: 'Treadmill',
    width: 0.90, depth: 1.60, height: 1.50, volume: 2.16,
    category: 'exercise', color: '#27AE60',
    allowedAnchors: ['floor'], zAware: true
  },
  {
    id: 'resistive-device',
    name: 'Resistive Exercise Device',
    shortName: 'RED',
    width: 1.20, depth: 1.20, height: 2.00, volume: 2.88,
    category: 'exercise', color: '#1E8449',
    allowedAnchors: ['floor','wall'], zAware: true
  },
  
  // Mission planning & command/monitoring (table, console, comms)
  {
    id: 'mission-planning-surface',
    name: 'Mission Planning Surface',
    shortName: 'Plan Surface',
    width: 1.20, depth: 0.80, height: 0.75, volume: 0.72,
    category: 'mission', color: '#8E44AD',
    allowedAnchors: ['floor'], zAware: false
  },
  {
    id: 'mission-console',
    name: 'Mission Console',
    shortName: 'Mission Console',
    width: 1.00, depth: 0.60, height: 1.20, volume: 0.72,
    category: 'mission', color: '#9B59B6',
    allowedAnchors: ['floor','wall'], zAware: true
  },
  {
    id: 'command-console',
    name: 'Command & Control Console',
    shortName: 'C2 Console',
    width: 1.00, depth: 0.60, height: 1.20, volume: 0.72,
    category: 'command', color: '#34495E',
    allowedAnchors: ['floor','wall'], zAware: true
  },
  {
    id: 'comms-panel',
    name: 'Comms Panel',
    shortName: 'Comms',
    width: 0.80, depth: 0.30, height: 1.20, volume: 0.29,
    category: 'command', color: '#2C3E50',
    allowedAnchors: ['wall'], zAware: true
  },
  
  // Private habitation (sleep & small desk in quarters)
  {
    id: 'sleep-berth',
    name: 'Crew Sleep Berth',
    shortName: 'Berth',
    width: 0.80, depth: 2.10, height: 1.10, volume: 1.85,
    category: 'habitat', color: '#4A90E2',
    allowedAnchors: ['floor'], zAware: true
  },
  {
    id: 'personal-work-surface',
    name: 'Personal Work Surface',
    shortName: 'Desk',
    width: 1.00, depth: 0.60, height: 0.75, volume: 0.45,
    category: 'habitat', color: '#5C9FE8',
    allowedAnchors: ['floor'], zAware: false
  },
  
  // Human waste & waste management
  {
    id: 'handwash-station',
    name: 'Handwash Station',
    shortName: 'Handwash',
    width: 0.60, depth: 0.40, height: 1.20, volume: 0.29,
    category: 'hygiene', color: '#50C878',
    allowedAnchors: ['floor','wall'], zAware: true
  },
{
  id: 'cycle-ergometer',
  name: 'Cycle Ergometer',
  shortName: 'Cycle',
  width: 0.60, depth: 1.10, height: 1.20, volume: 0.79,
  category: 'exercise', color: '#2ECC71',
  allowedAnchors: ['floor'], zAware: true
},
{
  id: 'treadmill',
  name: 'Treadmill',
  shortName: 'Treadmill',
  width: 0.90, depth: 1.60, height: 1.50, volume: 2.16,
  category: 'exercise', color: '#27AE60',
  allowedAnchors: ['floor'], zAware: true
},
{
  id: 'resistive-device',
  name: 'Resistive Exercise Device',
  shortName: 'RED',
  width: 1.20, depth: 1.20, height: 2.00, volume: 2.88,
  category: 'exercise', color: '#1E8449',
  allowedAnchors: ['floor','wall'], zAware: true
}

];
