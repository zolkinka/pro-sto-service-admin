import { useEffect, useRef } from 'react';
import IMask, { type InputMask } from 'imask';

interface UseInputMaskOptions {
  mask: string | RegExp | any;
  value?: string;
  onAccept?: (value: string, maskRef: InputMask<any>) => void;
  onComplete?: (value: string, maskRef: InputMask<any>) => void;
}

export const useInputMask = (
  inputRef: React.RefObject<HTMLInputElement | null>,
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
      lazy: false, // Маска всегда видна
      placeholderChar: '_', // Символ для незаполненных позиций
      overwrite: 'shift', // Режим перезаписи
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

  // Убираем синхронизацию value - пусть IMask полностью управляет значением
  // useEffect для value больше не нужен, так как мы используем uncontrolled режим

  return maskRef;
};