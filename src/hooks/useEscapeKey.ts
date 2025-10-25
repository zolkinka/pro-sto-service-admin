import { useEffect } from 'react';

/**
 * Хук для закрытия элемента при нажатии клавиши Escape
 * @param handler - Функция, вызываемая при нажатии Escape
 */
export const useEscapeKey = (handler: () => void) => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [handler]);
};
