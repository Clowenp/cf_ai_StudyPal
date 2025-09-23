import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { LinkSimple, Calendar } from "@phosphor-icons/react";

interface GoogleAuthButtonProps {
  authUrl: string;
  message: string;
  buttonText: string;
}

export function GoogleAuthButton({ authUrl, message, buttonText }: GoogleAuthButtonProps) {
  const handleAuthClick = () => {
    // Open the auth URL in a new window/tab
    window.open(authUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
  };

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
    </Card>
  );
}
