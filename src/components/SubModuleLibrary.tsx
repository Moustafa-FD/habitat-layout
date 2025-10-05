import { subModules, SubModule } from '@/data/subModules';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Maximize2 } from 'lucide-react';

interface SubModuleLibraryProps {
  onModuleSelect: (module: SubModule) => void;
}

export const SubModuleLibrary = ({ onModuleSelect }: SubModuleLibraryProps) => {
  const categories = Array.from(new Set(subModules.map(m => m.category)));

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground">Sub-Modules</h2>
        <p className="text-xs text-muted-foreground mt-1">Place inside main modules</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {categories.map(category => {
            const categoryModules = subModules.filter(m => m.category === category);
            return (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-sidebar-foreground capitalize sticky top-0 bg-sidebar py-1">
                  {category}
                </h3>
                {categoryModules.map(module => (
                  <Card
                    key={module.id}
                    className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-primary"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('subModule', JSON.stringify(module));
                    }}
                    onClick={() => onModuleSelect(module)}
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-3 h-3 rounded mt-1 flex-shrink-0"
                        style={{ backgroundColor: module.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-card-foreground truncate">
                          {module.shortName}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {module.width.toFixed(2)}×{module.depth.toFixed(2)}m
                          </Badge>
                          {module.zAware && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Maximize2 className="w-2 h-2" />
                              {module.height.toFixed(2)}m
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {module.volume.toFixed(2)} m³
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
