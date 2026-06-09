// filename: client/src/components/molecules/CountdownClock/CountdownClock.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './CountdownClock.module.scss';
import Icon from '../../atoms/Icon/Icon';

interface CountdownClockProps {
  targetDate: string | Date;
  mode?: 'card' | 'test';
  prefix?: string;
  onComplete?: () => void;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({
  targetDate,
  mode = 'card',
  prefix = '',
  onComplete,
}) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining.total <= 0) {
        clearInterval(timer);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, calculateTimeLeft, onComplete]);

  if (timeLeft.total <= 0) {
    return (
      <div className={`${styles.clock} ${styles.completed}`}>
        <Icon name="timer" size={16} />
        <span>Time's up</span>
      </div>
    );
  }

  // MM:SS format for test screen mode
  if (mode === 'test') {
    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
    const formattedMinutes = String(totalMinutes).padStart(2, '0');
    const formattedSeconds = String(timeLeft.seconds).padStart(2, '0');

    return (
      <div className={`${styles.clock} ${styles.testMode}`}>
        <Icon name="stopwatch" size={18} className={styles.pulseIcon} />
        <span className={styles.timeStr}>{formattedMinutes}:{formattedSeconds}</span>
      </div>
    );
  }

  // Textual format for card mode (e.g. "Starts in 2h 30m 15s" or "Starts in 1d 14h")
  let displayStr = '';
  if (timeLeft.days > 0) {
    displayStr = `${timeLeft.days}d ${timeLeft.hours}h`;
  } else if (timeLeft.hours > 0) {
    displayStr = `${timeLeft.hours}h ${timeLeft.minutes}m`;
  } else {
    displayStr = `${timeLeft.minutes}m ${timeLeft.seconds}s`;
  }

  return (
    <div className={styles.clock}>
      <Icon name="timer" size={14} className={styles.icon} />
      <span>{prefix} {displayStr}</span>
    </div>
  );
};
export default CountdownClock;
