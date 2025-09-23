import { useState } from "react";
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { LinkSimple, Calendar, X } from "@phosphor-icons/react";

interface GoogleAuthButtonProps {
  authUrl: string;
  message: string;
  buttonText: string;
  skipMessage?: string;
  skipButtonText?: string;
  onSkip?: () => void;
  onAddMessage?: (message: string) => void;
}

export function GoogleAuthButton({ 
  authUrl, 
  message, 
  buttonText, 
  skipMessage, 
  skipButtonText, 
  onSkip,
  onAddMessage 
}: GoogleAuthButtonProps) {
  const [isSkipped, setIsSkipped] = useState(false);
  
  const handleAuthClick = () => {
    // Open the auth URL in a new window/tab
    window.open(authUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
  };
  
  const handleSkip = () => {
    setIsSkipped(true);
    if (onSkip) {
      onSkip();
    }
  };
  
  if (isSkipped) {
    return (
      <Card className="p-4 my-3 w-full max-w-[500px] rounded-md bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-800/50 p-2 rounded-full">
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Calendar Setup Skipped
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              No problem! I can help you with other tasks instead. What would you like to do?
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 my-3 w-full max-w-[500px] rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
          <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Google Calendar Authorization
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {message}
          </p>
        </div>
      </div>
      
      <Button
        onClick={handleAuthClick}
        variant="primary"
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <LinkSimple size={18} />
        {buttonText}
      </Button>
      
      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
        This will open Google's authorization page in a new window
      </p>
      
      {skipMessage && skipButtonText && onSkip && (
        <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            {skipMessage}
          </p>
          <Button
            onClick={handleSkip}
            variant="secondary"
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2"
          >
            <X size={16} />
            {skipButtonText}
          </Button>
        </div>
      )}
    </Card>
  );
}
