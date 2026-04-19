import { useState, useEffect, useRef } from 'react';

export default function Timer({ seconds, onExpire, running = true }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, onExpire]);

  const pct = (remaining / seconds) * 100;
  const isWarning = pct <= 33;
  const isCritical = pct <= 15;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className={`timer${isWarning ? ' warning' : ''}${isCritical ? ' critical' : ''}`}>
      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="timer-label">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}
