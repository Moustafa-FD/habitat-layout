// Updated Index.tsx - Save this to src/pages/Index.tsx

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ComponentLibrary } from '@/components/ComponentLibrary';
import { LayoutCanvas2D } from '@/components/LayoutCanvas2D';
import { ValidationPanel } from '@/components/ValidationPanel';
import { Toolbar } from '@/components/Toolbar';
import { LayoutState } from '@/types/layout';
import { validateLayout } from '@/utils/validation';

const Index = () => {
  const location = useLocation();
  const [layoutState, setLayoutState] = useState<LayoutState>({
    crewSize: 4,
    mainModules: [],
    subModules: [],
    connections: [],
    selectedMainModuleId: null,
    selectedSubModuleId: null,
    zoomedModuleId: null
  });

  // Restore layout state when returning from 3D view
  useEffect(() => {
    if (location.state?.layoutState) {
      setLayoutState(location.state.layoutState);
    }
  }, [location.state]);

  const validationErrors = validateLayout(layoutState);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar layoutState={layoutState} onStateChange={setLayoutState} />
      
      <div className="flex-1 flex overflow-hidden" style={{maxWidth: '100vw'}}>
        {/* Left sidebar - Component Library */}
        <div className="w-80 flex-shrink-0" style={{minWidth: '320px', maxWidth: '320px'}}>
          <ComponentLibrary layoutState={layoutState} />
        </div>
        
        {/* Center - 2D Canvas */}
        <div className="flex-1" style={{minWidth: '0', maxWidth: 'calc(100vw - 640px)'}}>
          <LayoutCanvas2D 
            layoutState={layoutState}
            onStateChange={setLayoutState}
          />
        </div>

        {/* Right sidebar - Validation Panel */}
        <div className="w-80 flex-shrink-0 bg-background border-l-2 border-border" style={{minWidth: '320px', maxWidth: '320px', minHeight: '200px'}}>
          <ValidationPanel errors={validationErrors} />
        </div>
      </div>
    </div>
  );
};

export default Index;
