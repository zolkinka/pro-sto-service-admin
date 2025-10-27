import { useCallback, useEffect, useRef } from 'react';
import { useLatest } from './useLatest';

export function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const latest = useLatest(fn);
  const timerRef = useRef<number | null>(null);

  const debounced = useCallback((...args: Parameters<T>) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => latest.current(...args), delay);
  }, [delay, latest]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return debounced as (...args: Parameters<T>) => void;
}
