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

  const presetTimes = [
    { label: '5 min', minutes: 5 },
    { label: '15 min', minutes: 15 },
    { label: '25 min', minutes: 25 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
  ];

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
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        {/* Main Timer Display */}
        <Card className="p-8 bg-neutral-100 dark:bg-neutral-900 text-center min-w-[200px]">
          <div className="space-y-4">
            {/* Time Display */}
            <div className="text-6xl font-mono font-bold text-neutral-800 dark:text-neutral-200">
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
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
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
        <div className="flex items-center gap-3">
          {!timer.isRunning ? (
            <Button
              onClick={timer.startTimer}
              disabled={timer.timeRemaining === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
            >
              <Play size={16} className="mr-2" />
              {timer.isPaused ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button
              onClick={timer.pauseTimer}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2"
            >
              <Pause size={16} className="mr-2" />
              Pause
            </Button>
          )}
          
          <Button
            onClick={timer.stopTimer}
            disabled={!timer.isRunning && !timer.isPaused}
            variant="ghost"
            className="px-6 py-2"
          >
            <Stop size={16} className="mr-2" />
            Stop
          </Button>
          
          <Button
            onClick={timer.resetTimer}
            variant="ghost"
            className="px-4 py-2"
          >
            <ArrowClockwise size={16} />
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

      {/* Timer Settings */}
      <div className="p-4 border-t border-neutral-300 dark:border-neutral-800 space-y-4">
        {/* Preset Times */}
        <div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Preset Times
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {presetTimes.map((preset) => (
              <Button
                key={preset.minutes}
                onClick={() => timer.setTime(preset.minutes)}
                disabled={timer.isRunning}
                size="sm"
                variant="ghost"
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Time */}
        <div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Custom Time
          </h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCustomMinutes(Math.max(1, customMinutes - 1))}
              disabled={timer.isRunning}
              size="sm"
              variant="ghost"
              className="px-2"
            >
              <Minus size={14} />
            </Button>
            
            <div className="flex-1 text-center">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={timer.isRunning}
                className="w-16 text-center bg-transparent border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 text-sm"
                min="1"
                max="999"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">min</span>
            </div>
            
            <Button
              onClick={() => setCustomMinutes(customMinutes + 1)}
              disabled={timer.isRunning}
              size="sm"
              variant="ghost"
              className="px-2"
            >
              <Plus size={14} />
            </Button>
          </div>
          
          <Button
            onClick={handleSetCustomTime}
            disabled={timer.isRunning}
            size="sm"
            className="w-full mt-2"
            variant="ghost"
          >
            Set {customMinutes} minutes
          </Button>
        </div>
      </div>
    </div>
  );
}
