import { useEffect, useRef } from 'react';
import IMask, { type InputMask } from 'imask';

interface UseInputMaskOptions {
  mask: string | RegExp | any;
  onAccept?: (value: string, maskRef: InputMask<any>) => void;
  onComplete?: (value: string, maskRef: InputMask<any>) => void;
}

export const useInputMask = (
  inputRef: React.RefObject<HTMLInputElement>,
  options: UseInputMaskOptions
) => {
  const maskRef = useRef<InputMask<any> | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    maskRef.current = IMask(inputRef.current, {
      mask: options.mask,
      lazy: false,
    });

    if (options.onAccept) {
      maskRef.current.on('accept', () => {
        if (maskRef.current) {
          options.onAccept?.(maskRef.current.value, maskRef.current);
        }
      });
    }

    if (options.onComplete) {
      maskRef.current.on('complete', () => {
        if (maskRef.current) {
          options.onComplete?.(maskRef.current.value, maskRef.current);
        }
      });
    }

    return () => {
      maskRef.current?.destroy();
    };
  }, [options.mask]);

  return maskRef;
};