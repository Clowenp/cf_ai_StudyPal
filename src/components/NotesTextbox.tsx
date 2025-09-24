import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/card/Card';
import { 
  FloppyDisk, 
  NotePencil, 
  Trash,
  Download
} from '@phosphor-icons/react';

interface NotesTextboxProps {
  className?: string;
}

export function NotesTextbox({ className = '' }: NotesTextboxProps) {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsSaved(false);
  };

  const saveToFile = () => {
    if (!notes.trim()) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `study-notes-${timestamp}.txt`;
    
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setIsSaved(true);
  };

  const clearNotes = () => {
    if (notes.trim() && !confirm('Are you sure you want to clear all notes?')) {
      return;
    }
    setNotes('');
    setIsSaved(true);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('study-notes', notes);
    setIsSaved(true);
  };

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('study-notes');
    if (savedNotes) {
      setNotes(savedNotes);
      setIsSaved(true);
    }
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-300 dark:border-neutral-800 flex items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8">
          <NotePencil size={24} className="text-[#E91E63]" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-base">Study Notes</h2>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Save to localStorage */}
          <button
            onClick={saveToLocalStorage}
            disabled={isSaved || !notes.trim()}
            className="relative group p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-[#E91E63]/10 dark:hover:bg-[#E91E63]/20 border border-neutral-200/40 dark:border-neutral-700/40 hover:border-[#E91E63]/20 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Save notes"
            title="Save notes locally"
          >
            <FloppyDisk size={16} className={`${isSaved ? 'text-green-500' : 'text-[#E91E63]'} transition-colors duration-200`} />
          </button>
          
          {/* Download as file */}
          <button
            onClick={saveToFile}
            disabled={!notes.trim()}
            className="relative group p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 border border-neutral-200/40 dark:border-neutral-700/40 hover:border-blue-200/60 dark:hover:border-blue-800/60 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Download notes as file"
            title="Download as .txt file"
          >
            <Download size={16} className="text-neutral-600 dark:text-neutral-300 group-hover:text-blue-500 transition-colors duration-200" />
          </button>
          
          {/* Clear notes */}
          <button
            onClick={clearNotes}
            disabled={!notes.trim()}
            className="relative group p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-red-50/80 dark:hover:bg-red-900/20 border border-neutral-200/40 dark:border-neutral-700/40 hover:border-red-200/60 dark:hover:border-red-800/60 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Clear all notes"
            title="Clear all notes"
          >
            <Trash size={16} className="text-neutral-600 dark:text-neutral-300 group-hover:text-red-500 transition-colors duration-200" />
          </button>
        </div>
      </div>

      {/* Notes textarea */}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <Card className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Write your study notes here...

• Key concepts
• Important formulas
• Questions to review
• Insights and ideas"
            className="w-full h-full p-4 bg-transparent border-none outline-none resize-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 text-sm leading-relaxed overflow-y-auto chat-scrollbar"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }}
          />
        </Card>
        
        {/* Status indicator with proper spacing */}
        <div className="mt-3 mb-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
          <span>
            {notes.length} characters
          </span>
          <span className={`flex items-center gap-1 ${isSaved ? 'text-green-600 dark:text-green-400' : 'text-[#E91E63]'}`}>
            {isSaved ? (
              <>
                <FloppyDisk size={12} />
                Saved
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-[#E91E63] rounded-full animate-pulse" />
                Unsaved changes
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
