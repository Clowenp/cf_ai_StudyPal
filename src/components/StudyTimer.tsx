import { useState } from 'react';
import { useTimerContext } from '../contexts/TimerContext';
import { Card } from '@/components/card/Card';
import { Button } from '@/components/button/Button';
import {
  Play,
  Pause,
  Stop,
  ArrowClockwise,
  Plus,
  Minus,
  Timer
} from '@phosphor-icons/react';

interface StudyTimerProps {
  className?: string;
}

export function StudyTimer({ className = '' }: StudyTimerProps) {
  const [customMinutes, setCustomMinutes] = useState(25);
  const timer = useTimerContext();

  const handleSetCustomTime = () => {
    timer.setTime(customMinutes);
  };


  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-300 dark:border-neutral-800 flex items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8">
          <Timer size={24} className="text-[#E91E63]" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-base">Study Timer</h2>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-4">
        {/* Main Timer Display */}
        <Card className="p-6 bg-neutral-100 dark:bg-neutral-900 text-center w-full max-w-[280px]">
          <div className="space-y-3">
            {/* Time Display */}
            <div className="text-4xl font-mono font-bold text-neutral-800 dark:text-neutral-200">
              {timer.displayTime}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="bg-[#E91E63] h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${timer.progress}%` }}
              />
            </div>
            
            {/* Status */}
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              {timer.isFinished && (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  🎉 Time's up!
                </span>
              )}
              {timer.isRunning && (
                <span className="text-[#E91E63] dark:text-[#E91E63]/80">
                  ⏱️ Timer running...
                </span>
              )}
              {timer.isPaused && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  ⏸️ Timer paused
                </span>
              )}
              {!timer.isRunning && !timer.isPaused && !timer.isFinished && (
                <span className="text-neutral-500">
                  Ready to start
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Timer Controls */}
        <div className="flex items-center gap-2 justify-center">
          {!timer.isRunning ? (
            <Button
              onClick={timer.startTimer}
              disabled={timer.timeRemaining === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
            >
              <Play size={14} className="mr-1" />
              {timer.isPaused ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button
              onClick={timer.pauseTimer}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm"
            >
              <Pause size={14} className="mr-1" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={timer.stopTimer}
            disabled={!timer.isRunning && !timer.isPaused}
            variant="ghost"
            className="px-3 py-2 text-sm"
          >
            <Stop size={14} />
          </Button>
          
          <Button
            onClick={timer.resetTimer}
            variant="ghost"
            className="px-3 py-2"
          >
            <ArrowClockwise size={14} />
          </Button>
        </div>

        {/* Quick Add Time */}
        {(timer.isRunning || timer.isPaused) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Quick add:</span>
            <Button
              onClick={() => timer.addTime(1)}
              size="sm"
              variant="ghost"
              className="px-3 py-1"
            >
              +1m
            </Button>
            <Button
              onClick={() => timer.addTime(5)}
              size="sm"
              variant="ghost"
              className="px-3 py-1"
            >
              +5m
            </Button>
            <Button
              onClick={() => timer.addTime(10)}
              size="sm"
              variant="ghost"
              className="px-3 py-1"
            >
              +10m
            </Button>
          </div>
        )}
      </div>

      {/* Compact Timer Settings */}
      <div className="p-3 border-t border-neutral-300 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCustomMinutes(Math.max(1, customMinutes - 1))}
            disabled={timer.isRunning}
            size="sm"
            variant="ghost"
            className="px-2 h-8"
          >
            <Minus size={14} />
          </Button>
          
          <div className="flex-1 flex items-center justify-center gap-2">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={timer.isRunning}
              className="w-12 text-center bg-transparent border border-neutral-300 dark:border-neutral-600 rounded px-1 py-1 text-sm"
              min="1"
              max="999"
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">min</span>
          </div>
          
          <Button
            onClick={() => setCustomMinutes(customMinutes + 1)}
            disabled={timer.isRunning}
            size="sm"
            variant="ghost"
            className="px-2 h-8"
          >
            <Plus size={14} />
          </Button>
          
          <Button
            onClick={handleSetCustomTime}
            disabled={timer.isRunning}
            size="sm"
            className="px-3 h-8 text-xs"
            variant="ghost"
          >
            Set
          </Button>
        </div>
      </div>
    </div>
  );
}
