// Updated Toolbar.tsx - Save this to src/components/Toolbar.tsx

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Trash2,
  Save,
  FolderOpen,
  Download,
  Box,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LayoutState } from '@/types/layout';
import { canSwitchTo3D } from '@/utils/validation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ToolbarProps {
  layoutState: LayoutState;
  onStateChange: (state: LayoutState) => void;
}

export const Toolbar = ({ layoutState, onStateChange }: ToolbarProps) => {
  const { canSwitch, errors } = canSwitchTo3D(layoutState);
  const navigate = useNavigate();

  const handleCrewSizeChange = (value: string) => {
    onStateChange({
      ...layoutState,
      crewSize: parseInt(value)
    });
    toast.info(`Crew size set to ${value}`);
  };

  const handleRotateSelected = () => {
    if (!layoutState.selectedMainModuleId) {
      toast.error('Select a main module first');
      return;
    }
    
    onStateChange({
      ...layoutState,
      mainModules: layoutState.mainModules.map(m =>
        m.instanceId === layoutState.selectedMainModuleId
          ? { ...m, rotation: (m.rotation + 90) % 360 }
          : m
      )
    });
    toast.success('Main module rotated 90°');
  };

  const handleDeleteSelected = () => {
    if (!layoutState.selectedMainModuleId && !layoutState.selectedSubModuleId) {
      toast.error('Select a component first');
      return;
    }
    
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
  };

  const handleClearAll = () => {
    if (layoutState.mainModules.length === 0 && layoutState.subModules.length === 0) {
      toast.info('Layout is already empty');
      return;
    }
    
    if (confirm('Are you sure you want to clear the entire layout?')) {
      onStateChange({
        ...layoutState,
        mainModules: [],
        subModules: [],
        connections: [],
        selectedMainModuleId: null,
        selectedSubModuleId: null
      });
      toast.success('Layout cleared');
    }
  };

  const handleSwitchTo3D = () => {
    if (canSwitch) {
      // Navigate to 3D test view with layout state
      navigate('/3d-test', { state: { layoutState } });
      toast.success('Switching to 3D test view...');
    } else {
      toast.error(`Cannot switch to 3D: ${errors.length} error(s) remaining`);
    }
  };

  const handleSave = () => {
    const layoutData = JSON.stringify(layoutState, null, 2);
    const blob = new Blob([layoutData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitat-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Layout saved');
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            onStateChange(data);
            toast.success('Layout loaded');
          } catch (error) {
            toast.error('Failed to load layout file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-lg text-card-foreground flex items-center gap-2">
          <Box className="w-5 h-5 text-primary" />
          Habitat Layout Builder
        </h1>
        <Badge variant="outline" className="text-xs">2D View</Badge>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        {/* Crew Size Selector */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <Select 
            value={layoutState.crewSize.toString()} 
            onValueChange={handleCrewSizeChange}
          >
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Crew</SelectItem>
              <SelectItem value="3">3 Crew</SelectItem>
              <SelectItem value="4">4 Crew</SelectItem>
              <SelectItem value="5">5 Crew</SelectItem>
              <SelectItem value="6">6 Crew</SelectItem>
              <SelectItem value="8">8 Crew</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* File Operations */}
        <Button variant="ghost" size="sm" onClick={handleOpen}>
          <FolderOpen className="w-4 h-4 mr-2" />
          Open
        </Button>
        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        {/* Edit Tools */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRotateSelected}
          disabled={!layoutState.selectedMainModuleId}
          title="Rotate selected component (R)"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDeleteSelected}
          disabled={!layoutState.selectedMainModuleId && !layoutState.selectedSubModuleId}
          title="Delete selected component (Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearAll}
          disabled={layoutState.mainModules.length === 0 && layoutState.subModules.length === 0}
        >
          Clear All
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* 3D Switch */}
        <Button 
          variant={canSwitch ? "default" : "secondary"} 
          size="sm" 
          disabled={!canSwitch}
          onClick={handleSwitchTo3D}
          title={canSwitch ? 'Switch to 3D view' : `Fix ${errors.length} error(s) first`}
        >
          <Box className="w-4 h-4 mr-2" />
          {canSwitch ? 'Switch to 3D' : `Fix ${errors.length} error(s)`}
        </Button>
      </div>
    </div>
  );
};
