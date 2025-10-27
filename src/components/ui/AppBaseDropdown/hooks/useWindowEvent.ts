import { useEffect } from 'react';

export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener(type, handler as EventListener, options);
    return () => {
      window.removeEventListener(type, handler as EventListener, options);
    };
  }, [type, handler, options, enabled]);
}
