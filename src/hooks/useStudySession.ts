import { useState, useCallback, useEffect } from 'react';

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

export interface StudySessionStats {
  totalSessions: number;
  averageDuration: number;
  totalStudyTime: number;
  subjects: Record<string, {
    sessions: number;
    averageDuration: number;
    totalTime: number;
  }>;
}

const STORAGE_KEY = 'study-sessions';
const DEFAULT_STUDY_TIME = 30; // 30 minutes default

export function useStudySession() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed.map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        })));
      } catch (error) {
        console.error('Failed to load study sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Parse study intent from message
  const parseStudyIntent = useCallback((message: string): { subject: string } | null => {
    const patterns = [
      /^i want to study\s+(.+)$/i,
      /^let's study\s+(.+)$/i,
      /^study\s+(.+)$/i,
      /^time to study\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = message.trim().match(pattern);
      if (match) {
        return { subject: match[1].trim() };
      }
    }
    return null;
  }, []);

  // Get average study time for a subject
  const getAverageStudyTime = useCallback((subject: string): number => {
    const subjectSessions = sessions.filter(
      s => s.subject.toLowerCase() === subject.toLowerCase() && s.completed
    );
    
    if (subjectSessions.length === 0) {
      return DEFAULT_STUDY_TIME;
    }

    const totalTime = subjectSessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.round(totalTime / subjectSessions.length);
  }, [sessions]);

  // Start a new study session
  const startStudySession = useCallback((subject: string, duration?: number): StudySession => {
    const suggestedDuration = duration || getAverageStudyTime(subject);
    
    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: subject.trim(),
      duration: suggestedDuration,
      startTime: new Date(),
      completed: false,
    };

    setCurrentSession(newSession);
    setSessions(prev => [...prev, newSession]);
    
    return newSession;
  }, [getAverageStudyTime]);

  // Complete current study session
  const completeStudySession = useCallback((actualDuration?: number) => {
    if (!currentSession) return;

    const updatedSession: StudySession = {
      ...currentSession,
      endTime: new Date(),
      duration: actualDuration || currentSession.duration,
      completed: true,
    };

    setSessions(prev => 
      prev.map(s => s.id === currentSession.id ? updatedSession : s)
    );
    setCurrentSession(null);
  }, [currentSession]);

  // Cancel current study session
  const cancelStudySession = useCallback(() => {
    if (!currentSession) return;

    setSessions(prev => prev.filter(s => s.id !== currentSession.id));
    setCurrentSession(null);
  }, [currentSession]);

  // Get study statistics
  const getStudyStats = useCallback((): StudySessionStats => {
    const completedSessions = sessions.filter(s => s.completed);
    
    const stats: StudySessionStats = {
      totalSessions: completedSessions.length,
      averageDuration: 0,
      totalStudyTime: 0,
      subjects: {},
    };

    if (completedSessions.length === 0) {
      return stats;
    }

    stats.totalStudyTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    stats.averageDuration = Math.round(stats.totalStudyTime / completedSessions.length);

    // Calculate per-subject stats
    completedSessions.forEach(session => {
      const subject = session.subject.toLowerCase();
      if (!stats.subjects[subject]) {
        stats.subjects[subject] = {
          sessions: 0,
          averageDuration: 0,
          totalTime: 0,
        };
      }
      
      stats.subjects[subject].sessions++;
      stats.subjects[subject].totalTime += session.duration;
      stats.subjects[subject].averageDuration = Math.round(
        stats.subjects[subject].totalTime / stats.subjects[subject].sessions
      );
    });

    return stats;
  }, [sessions]);

  // Generate motivational messages
  const getMotivationalMessage = useCallback((subject: string): string => {
    const messages = [
      `🚀 Great choice! Time to dive into ${subject}. You've got this!`,
      `📚 Let's make some progress with ${subject}! Stay focused and you'll do amazing!`,
      `💪 ${subject} time! Remember, every minute of study gets you closer to your goals!`,
      `🎯 Focus mode activated for ${subject}! You're going to crush this session!`,
      `⭐ Time to shine with ${subject}! Believe in yourself - you're capable of great things!`,
      `🔥 ${subject} study session starting! Channel that energy and make it count!`,
      `🌟 Ready to level up your ${subject} skills? Let's make this session productive!`,
      `💡 ${subject} awaits! Remember, consistent effort leads to extraordinary results!`,
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  return {
    // State
    sessions,
    currentSession,
    
    // Actions
    parseStudyIntent,
    startStudySession,
    completeStudySession,
    cancelStudySession,
    
    // Utilities
    getAverageStudyTime,
    getStudyStats,
    getMotivationalMessage,
  };
}
