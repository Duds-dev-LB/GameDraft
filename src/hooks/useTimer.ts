import { useState, useEffect, useRef } from 'react';

interface TimerResult {
  timeRemaining: number;
  isWarning: boolean;
  isExpired: boolean;
}

export function useTimer(turnStartedAt: string | null, timeLimit: number, onTimeout: () => void): TimerResult {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!turnStartedAt || timeLimit <= 0) {
      setTimeRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const elapsed = Math.floor((Date.now() - Date.parse(turnStartedAt)) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      return remaining;
    };

    let timeoutCalled = false;
    
    // Initial calculation
    let initialRemaining = calculateRemaining();
    setTimeRemaining(initialRemaining);
    
    if (initialRemaining <= 0) {
      onTimeoutRef.current();
      timeoutCalled = true;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && !timeoutCalled) {
        onTimeoutRef.current();
        timeoutCalled = true;
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [turnStartedAt, timeLimit]);

  const isWarning = timeRemaining > 0 && timeRemaining <= 10;
  const isExpired = timeRemaining <= 0 && !!turnStartedAt && timeLimit > 0;

  return { timeRemaining, isWarning, isExpired };
}
