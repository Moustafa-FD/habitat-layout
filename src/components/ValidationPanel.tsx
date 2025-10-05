import { ValidationError } from '@/types/layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ValidationPanelProps {
  errors: ValidationError[];
}

export const ValidationPanel = ({ errors }: ValidationPanelProps) => {
  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;
  
  // Check if we only have the "no modules" message
  const hasOnlyInfoMessage = errors.length === 1 && errors[0].message?.includes('No modules placed yet');
  
  if (errors.length === 0) {
    return (
      <div className="h-full flex flex-col bg-sidebar border-l border-sidebar-border" style={{minHeight: '200px'}}>
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-semibold text-sidebar-foreground">Validation</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-2 text-green-600">
            <CheckCircle className="w-12 h-12" />
            <p className="text-sm font-medium">All validations passed</p>
            <p className="text-xs text-muted-foreground text-center">
              Your habitat layout meets all requirements
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-sidebar border-l border-sidebar-border" style={{minHeight: '200px'}}>
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground">Validation</h2>
        {!hasOnlyInfoMessage && (
          <div className="flex gap-4 mt-2 text-xs">
            {errorCount > 0 && (
              <span className="text-destructive font-medium">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-amber-600 font-medium">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {errors.map((error, index) => (
            <Alert
              key={index}
              variant={error.type === 'error' ? 'destructive' : 'default'}
              className={error.type === 'warning' ? 'border-amber-600 bg-amber-50/10' : ''}
            >
              {error.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription className="text-xs">
                {error.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
