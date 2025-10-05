import { LayoutState, PlacedMainModule, PlacedSubModule, ValidationError } from '@/types/layout';
import { mainModules, canPortsConnect } from '@/data/mainModules';
import { subModules } from '@/data/subModules';

const MIN_HABITABLE_VOLUME_PER_CREW = 10.0;

// Find main modules not connected to the station network
const findFloatingModules = (state: LayoutState): string[] => {
  if (state.mainModules.length <= 1) return [];
  if (state.connections.length === 0) return state.mainModules.slice(1).map(m => m.instanceId);

  const connectedSet = new Set<string>([state.mainModules[0].instanceId]);
  const toVisit = [state.mainModules[0].instanceId];

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;
    state.connections.forEach(conn => {
      if (conn.fromModuleId === current && !connectedSet.has(conn.toModuleId)) {
        connectedSet.add(conn.toModuleId);
        toVisit.push(conn.toModuleId);
      } else if (conn.toModuleId === current && !connectedSet.has(conn.fromModuleId)) {
        connectedSet.add(conn.fromModuleId);
        toVisit.push(conn.fromModuleId);
      }
    });
  }

  return state.mainModules.filter(m => !connectedSet.has(m.instanceId)).map(m => m.instanceId);
};

// Check for overlapping main modules
const checkMainModuleOverlaps = (modules: PlacedMainModule[]): string[] => {
  const overlapping: string[] = [];
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      if (doModulesOverlap(modules[i], modules[j])) {
        overlapping.push(modules[i].instanceId, modules[j].instanceId);
      }
    }
  }
  return [...new Set(overlapping)];
};

const doModulesOverlap = (m1: PlacedMainModule, m2: PlacedMainModule): boolean => {
  const getDim = (m: PlacedMainModule) =>
    m.rotation === 90 || m.rotation === 270 ? { w: m.depth, d: m.width } : { w: m.width, d: m.depth };
  const d1 = getDim(m1);
  const d2 = getDim(m2);
  const tol = 0.01;
  return !(m1.x + d1.w <= m2.x + tol || m2.x + d2.w <= m1.x + tol || m1.y + d1.d <= m2.y + tol || m2.y + d2.d <= m1.y + tol);
};

// Validate parent capacity
const validateParentCapacity = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  state.mainModules.forEach(mainModule => {
    const children = state.subModules.filter(sub => sub.parentInstanceId === mainModule.instanceId);
    const totalSubVolume = children.reduce((sum, sub) => sum + sub.volume, 0);
    const availableVolume = mainModule.volume;

    if (totalSubVolume > availableVolume * 0.9 && totalSubVolume <= availableVolume) {
      errors.push({
        type: 'warning',
        message: `${mainModule.shortName} at ${Math.round((totalSubVolume / availableVolume) * 100)}% capacity`,
        moduleId: mainModule.instanceId
      });
    }
    if (totalSubVolume > availableVolume) {
      errors.push({
        type: 'error',
        message: `${mainModule.shortName} exceeds capacity: ${totalSubVolume.toFixed(1)}/${availableVolume.toFixed(1)}m³`,
        moduleId: mainModule.instanceId
      });
    }
  });
  return errors;
};

// Validate crew volume
const validateCrewVolume = (state: LayoutState): ValidationError | null => {
  const totalVolume = state.mainModules.reduce((sum, m) => sum + m.volume, 0);
  const minRequired = state.crewSize * MIN_HABITABLE_VOLUME_PER_CREW;
  if (totalVolume < minRequired) {
    return {
      type: 'error',
      message: `Insufficient volume: ${totalVolume.toFixed(1)}m³ / ${minRequired.toFixed(1)}m³ for ${state.crewSize} crew`
    };
  }
  return null;
};

// Validate essentials
const validateEssentials = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  const subIds = state.subModules.map(s => s.id);
  const mainIds = state.mainModules.map(m => m.id);

  const minHygiene = Math.max(1, Math.ceil(state.crewSize / 3));
  const hygieneCount = mainIds.filter(id => id === 'hygiene').length;
  if (hygieneCount < minHygiene) {
    errors.push({ type: 'error', message: `Need ${minHygiene} hygiene module(s), have ${hygieneCount}` });
  }

  if (mainIds.filter(id => id === 'galley').length < 1) {
    errors.push({ type: 'error', message: 'Need at least 1 galley module' });
  }

  if (mainIds.filter(id => id === 'medical').length < 1) {
    errors.push({ type: 'error', message: 'Need at least 1 medical module' });
  }

  return errors;
};

// Validate Z clearance
const validateZClearance = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  state.mainModules.forEach(mainModule => {
    const children = state.subModules.filter(sub => sub.parentInstanceId === mainModule.instanceId && sub.zAware);
    children.forEach(sub => {
      if (sub.height > mainModule.height) {
        errors.push({
          type: 'error',
          message: `${sub.shortName} height exceeds ${mainModule.shortName}`,
          moduleId: mainModule.instanceId
        });
      }
      if (sub.z + sub.height > mainModule.height) {
        errors.push({
          type: 'error',
          message: `${sub.shortName} extends beyond ${mainModule.shortName} height`,
          moduleId: mainModule.instanceId
        });
      }
    });
  });
  return errors;
};

// Validate port connections
const validatePortConnections = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  state.connections.forEach(conn => {
    const fromMod = state.mainModules.find(m => m.instanceId === conn.fromModuleId);
    const toMod = state.mainModules.find(m => m.instanceId === conn.toModuleId);
    if (!fromMod || !toMod) {
      errors.push({ type: 'error', message: 'Connection references non-existent module' });
      return;
    }
    const fromPort = fromMod.ports.find(p => p.id === conn.fromPortId);
    const toPort = toMod.ports.find(p => p.id === conn.toPortId);
    if (!fromPort || !toPort) {
      errors.push({ type: 'error', message: 'Connection references non-existent port' });
      return;
    }
    if (!canPortsConnect(fromPort.type, toPort.type)) {
      errors.push({
        type: 'error',
        message: `Incompatible ports: ${fromPort.type} <-> ${toPort.type}`,
        moduleId: fromMod.instanceId
      });
    }
  });
  return errors;
};

// Validate sub-module placement
const validateSubModulePlacement = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  state.subModules.forEach(subModule => {
    const parent = state.mainModules.find(m => m.instanceId === subModule.parentInstanceId);
    if (!parent) {
      errors.push({ type: 'error', message: `${subModule.shortName} has no parent` });
      return;
    }
    if (!parent.allowedSubModules.includes(subModule.id)) {
      errors.push({
        type: 'error',
        message: `${subModule.shortName} cannot be placed in ${parent.shortName}`,
        moduleId: parent.instanceId
      });
    }
  });
  return errors;
};

// Validate port limits
const validatePortLimits = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  const portUsage = new Map<string, number>();
  state.connections.forEach(conn => {
    const fromKey = `${conn.fromModuleId}:${conn.fromPortId}`;
    const toKey = `${conn.toModuleId}:${conn.toPortId}`;
    portUsage.set(fromKey, (portUsage.get(fromKey) || 0) + 1);
    portUsage.set(toKey, (portUsage.get(toKey) || 0) + 1);
  });
  portUsage.forEach((count, portKey) => {
    if (count > 1) {
      const [moduleId] = portKey.split(':');
      const module = state.mainModules.find(m => m.instanceId === moduleId);
      errors.push({
        type: 'error',
        message: `Port in ${module?.shortName || 'module'} connected ${count} times (max 1)`,
        moduleId
      });
    }
  });
  return errors;
};

export const validateLayout = (state: LayoutState): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Show info message when layout is empty
  if (state.mainModules.length === 0) {
    errors.push({
      type: 'warning',
      message: 'No modules placed yet. Drag modules from the library to start building your habitat.'
    });
    return errors;
  }
  
  // RULE 1: No floating modules
  const floatingModules = findFloatingModules(state);
  if (floatingModules.length > 0) {
    errors.push({
      type: 'error',
      message: `${floatingModules.length} main module(s) not connected to station network`,
      moduleId: floatingModules[0]
    });
  }

  // RULE 2: No overlaps
  const overlaps = checkMainModuleOverlaps(state.mainModules);
  if (overlaps.length > 0) {
    errors.push({
      type: 'error',
      message: `${overlaps.length} overlapping main module(s) detected`
    });
  }

  // RULE 3: Parent capacity
  errors.push(...validateParentCapacity(state));

  // RULE 4: Crew volume
  const volumeError = validateCrewVolume(state);
  if (volumeError) errors.push(volumeError);

  // RULE 5: Essentials
  errors.push(...validateEssentials(state));

  // RULE 6: Z clearance
  errors.push(...validateZClearance(state));

  // RULE 7: Port connections
  errors.push(...validatePortConnections(state));

  // RULE 8: Sub-module placement
  errors.push(...validateSubModulePlacement(state));

  // RULE 9: Port limits
  errors.push(...validatePortLimits(state));
  
  return errors;
};

export const canSwitchTo3D = (state: LayoutState): { canSwitch: boolean; errors: ValidationError[] } => {
  const errors = validateLayout(state).filter(e => e.type === 'error');
  return { canSwitch: errors.length === 0 && state.mainModules.length > 0, errors };
};
