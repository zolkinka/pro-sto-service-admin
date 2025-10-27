import type { CSSProperties } from 'react';

/**
 * Waits for the next animation frame to ensure DOM is mounted
 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Attempts to get dropdown element with retry logic
 */
export async function getDropdownElement(
  dropdownRef: React.RefObject<HTMLDivElement | null>
): Promise<HTMLDivElement | null> {
  let dropdownEl = dropdownRef.current;
  
  if (!dropdownEl) {
    await nextFrame();
    dropdownEl = dropdownRef.current;
  }
  
  return dropdownEl;
}

/**
 * Creates initial dropdown styles
 */
export function createInitialDropdownStyles(
  baseStyle: CSSProperties,
  widthStyle: Record<string, string>
): CSSProperties {
  return {
    ...baseStyle,
    ...widthStyle,
    visibility: 'hidden',
    position: 'fixed',
  };
}

/**
 * Creates final dropdown styles by merging base and direction styles
 */
export function createFinalDropdownStyles(
  baseStyle: CSSProperties,
  directionStyle: Record<string, string | undefined>
): CSSProperties {
  // Фильтруем undefined значения из directionStyle
  const cleanDirectionStyle: Record<string, string> = {};
  Object.entries(directionStyle).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanDirectionStyle[key] = value;
    }
  });

  return {
    ...baseStyle,
    ...cleanDirectionStyle,
    visibility: 'visible',
  };
}

/**
 * Creates fallback styles when dropdown positioning fails
 */
export function createFallbackStyles(baseStyle: CSSProperties): CSSProperties {
  return {
    ...baseStyle,
    top: '100%',
    left: '0',
    visibility: 'visible',
  };
}