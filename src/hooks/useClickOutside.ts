import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Хук для закрытия элемента при клике вне его области
 * @param ref - Реф элемента, для которого отслеживаются клики снаружи
 * @param handler - Функция, вызываемая при клике вне элемента
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Если клик внутри элемента - игнорируем
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Иначе вызываем handler
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
