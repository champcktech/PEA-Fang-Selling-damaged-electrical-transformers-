import { useEffect, useState } from 'react';

export function useNowTimestamp(intervalMs = 30_000): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const updateNow = () => setNowMs(Date.now());
    const timer = window.setInterval(updateNow, intervalMs);
    window.addEventListener('focus', updateNow);
    document.addEventListener('visibilitychange', updateNow);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', updateNow);
      document.removeEventListener('visibilitychange', updateNow);
    };
  }, [intervalMs]);

  return nowMs;
}
