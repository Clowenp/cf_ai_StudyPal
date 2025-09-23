import { useState, useRef, useCallback, useEffect } from 'react';

export interface StudyTimerState {
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  wasStopped: boolean; // true if timer was manually stopped
}

export interface StudyTimerControls {
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setTime: (minutes: number) => void;
  addTime: (minutes: number) => void;
  clearTimer: () => void; // Completely clear all timer state
}

export interface StudyTimerFormatted {
  minutes: number;
  seconds: number;
  displayTime: string;
  progress: number; // 0-100 percentage
}

export function useStudyTimer(initialMinutes: number = 25): StudyTimerState & StudyTimerControls & StudyTimerFormatted {
  const [timeRemaining, setTimeRemaining] = useState(initialMinutes * 60);
  const [totalTime, setTotalTime] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wasStopped, setWasStopped] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate derived values
  const isFinished = timeRemaining === 0 && !isRunning;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  // Timer tick function
  const tick = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        setIsPaused(false);
        return 0;
      }
      return prev - 1;
    });
  }, []);

  // Start the timer
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setWasStopped(false); // Reset stopped flag when starting
  }, []);

  // Pause the timer
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  // Stop and reset the timer
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setWasStopped(true); // Mark as manually stopped
    setTimeRemaining(totalTime);
  }, [totalTime]);

  // Reset to original time
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(totalTime);
  }, [totalTime]);

  // Set new timer duration
  const setTime = useCallback((minutes: number) => {
    const newTime = minutes * 60;
    setTotalTime(newTime);
    setTimeRemaining(newTime);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  // Add time to current timer
  const addTime = useCallback((minutes: number) => {
    const additionalTime = minutes * 60;
    setTimeRemaining((prev) => prev + additionalTime);
    setTotalTime((prev) => prev + additionalTime);
  }, []);

  // Completely clear all timer state
  const clearTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setWasStopped(false);
    setTimeRemaining(initialMinutes * 60);
    setTotalTime(initialMinutes * 60);
  }, [initialMinutes]);

  // Effect to handle the timer interval
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    timeRemaining,
    totalTime,
    isRunning,
    isPaused,
    isFinished,
    wasStopped,
    
    // Controls
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setTime,
    addTime,
    clearTimer,
    
    // Formatted values
    minutes,
    seconds,
    displayTime,
    progress,
  };
}
