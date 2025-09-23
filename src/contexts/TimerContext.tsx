import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useStudyTimer } from '../hooks/useStudyTimer';
import type { StudyTimerState, StudyTimerControls, StudyTimerFormatted } from '../hooks/useStudyTimer';

type TimerContextType = StudyTimerState & StudyTimerControls & StudyTimerFormatted;

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const timer = useStudyTimer(25);

  return (
    <TimerContext.Provider value={timer}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
