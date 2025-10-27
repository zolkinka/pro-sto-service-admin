import { useEffect, useRef } from 'react';
import IMask, { type InputMask } from 'imask';

interface UseInputMaskOptions {
  mask: string | RegExp | any;
  value?: string;
  onAccept?: (value: string, maskRef: InputMask<any>) => void;
  onComplete?: (value: string, maskRef: InputMask<any>) => void;
}

export const useInputMask = (
  inputRef: React.RefObject<HTMLInputElement>,
  options: UseInputMaskOptions
) => {
  const maskRef = useRef<InputMask<any> | null>(null);
  const onAcceptRef = useRef(options.onAccept);
  const onCompleteRef = useRef(options.onComplete);

  // Обновляем рефы колбэков
  useEffect(() => {
    onAcceptRef.current = options.onAccept;
    onCompleteRef.current = options.onComplete;
  });

  // Инициализация маски (только один раз)
  useEffect(() => {
    if (!inputRef.current) return;

    maskRef.current = IMask(inputRef.current, {
      mask: options.mask,
      lazy: false,
    });

    maskRef.current.on('accept', () => {
      if (maskRef.current) {
        onAcceptRef.current?.(maskRef.current.value, maskRef.current);
      }
    });

    maskRef.current.on('complete', () => {
      if (maskRef.current) {
        onCompleteRef.current?.(maskRef.current.value, maskRef.current);
      }
    });

    return () => {
      maskRef.current?.destroy();
    };
  }, [inputRef, options.mask]);

  // Синхронизация внешнего value с маской
  useEffect(() => {
    if (maskRef.current && options.value !== undefined) {
      maskRef.current.value = options.value;
    }
  }, [options.value]);

  return maskRef;
};