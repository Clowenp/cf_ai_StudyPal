import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Warning, X } from "@phosphor-icons/react";

interface SetupRequiredCardProps {
  message: string;
  details: string;
  alternative?: string;
  skipMessage: string;
  onSkip?: () => void;
}

export function SetupRequiredCard({ 
  message, 
  details, 
  alternative, 
  skipMessage,
  onSkip 
}: SetupRequiredCardProps) {
  return (
    <Card className="p-4 my-3 w-full max-w-[500px] rounded-md bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full flex-shrink-0">
          <Warning size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            {message}
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            {details}
          </p>
          
          {alternative && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3 italic">
              💡 {alternative}
            </p>
          )}
          
          <div className="bg-amber-100/50 dark:bg-amber-900/30 p-3 rounded-lg mb-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {skipMessage}
            </p>
          </div>
          
          <Button
            onClick={onSkip}
            variant="secondary"
            className="bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-600 flex items-center gap-2"
          >
            <X size={16} />
            Continue Without Calendar
          </Button>
        </div>
      </div>
    </Card>
  );
}
