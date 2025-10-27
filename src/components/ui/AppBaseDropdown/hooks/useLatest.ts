import { useEffect, useRef } from 'react';

/**
 * Keeps a ref pointing to the latest value without causing re-renders.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
