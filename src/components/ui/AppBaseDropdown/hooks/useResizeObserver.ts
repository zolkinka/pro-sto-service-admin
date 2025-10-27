import { useEffect } from 'react';

export function useResizeObserver(
  target: React.RefObject<Element | null>,
  callback: ResizeObserverCallback,
) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const ro = new ResizeObserver(callback);
    ro.observe(el);
    return () => ro.disconnect();
  }, [target, callback]);
}
