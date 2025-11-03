export type YDirection = 'top' | 'bottom';
export type XDirection = 'left' | 'right';
export type YDirectionMode = 'bottom' | 'top' | 'free-space' | 'bottom-priority' | 'top-priority';
export type XDirectionMode = 'right' | 'left' | 'free-space' | 'right-priority' | 'left-priority';

export const DROPDOWN_CONTAINER_CLASS = 'dropdown-container';
const MIN_SAFE_PADDING = 8;
const DROPDOWN_GAP = 8; // Gap between toggle and dropdown

export function getYDirection({ yDirectionMode, toggleRect, containerRect, dropdownHeight }: {
  yDirectionMode: YDirectionMode;
  toggleRect: DOMRect;
  containerRect: DOMRect;
  dropdownHeight: number;
}): YDirection {
  const bottomSpace = containerRect.bottom - toggleRect.bottom;
  const topSpace = toggleRect.top - containerRect.top;

  if (yDirectionMode === 'top' || yDirectionMode === 'bottom') return yDirectionMode;
  if (yDirectionMode === 'free-space') return topSpace > bottomSpace ? 'top' : 'bottom';
  if (yDirectionMode === 'bottom-priority') {
    if (dropdownHeight + MIN_SAFE_PADDING < bottomSpace) return 'bottom';
    return topSpace > bottomSpace ? 'top' : 'bottom';
  }
  if (yDirectionMode === 'top-priority') {
    if (dropdownHeight + MIN_SAFE_PADDING < topSpace) return 'top';
    return topSpace > bottomSpace ? 'top' : 'bottom';
  }
  return 'bottom';
}

export function getXDirection({ xDirectionMode, toggleRect, containerRect, dropdownRect }: {
  xDirectionMode: XDirectionMode;
  toggleRect: DOMRect;
  containerRect: DOMRect;
  dropdownRect: DOMRect;
}): XDirection {
  const leftSpace = toggleRect.left - containerRect.left;
  const rightSpace = containerRect.right - toggleRect.right;

  if (xDirectionMode === 'right' || xDirectionMode === 'left') return xDirectionMode;
  if (xDirectionMode === 'free-space') return leftSpace > rightSpace ? 'left' : 'right';
  if (xDirectionMode === 'right-priority') return dropdownRect.width + MIN_SAFE_PADDING < rightSpace ? 'right' : 'left';
  if (xDirectionMode === 'left-priority') return dropdownRect.width + MIN_SAFE_PADDING < leftSpace ? 'left' : 'right';
  return 'right';
}

export function getDropdownWidth({ dropdownWidthMode, toggleRect }: {
  dropdownWidthMode: 'min-toggle' | 'equal-toggle' | 'none' | string;
  toggleRect: DOMRect;
}) {
  const result: Record<string, string> = {};
  if (dropdownWidthMode === 'equal-toggle') {
    result.width = `${toggleRect.width}px`;
  } else if (dropdownWidthMode === 'min-toggle') {
    result.minWidth = `${toggleRect.width}px`;
  } else if (dropdownWidthMode !== 'none') {
    result.width = dropdownWidthMode;
  }
  return result;
}

export function getXDirectionStyle({ xDirection, toggleRect, windowWidth }: {
  xDirection: XDirection;
  toggleRect: DOMRect;
  windowWidth: number;
}) {
  if (xDirection === 'left') {
    return { right: `${windowWidth - toggleRect.right}px` } as const;
  }
  return { left: `${toggleRect.left}px` } as const;
}

export function restrictWidthIfOverlay({ dropdownRect, toggleRect, containerRect, xDirection }: {
  dropdownRect: DOMRect;
  toggleRect: DOMRect;
  containerRect: DOMRect;
  xDirection: XDirection;
}) {
  const xDiff = dropdownRect.width - toggleRect.width;
  const leftSpace = toggleRect.left - containerRect.left;
  const rightSpace = containerRect.right - toggleRect.right;
  const result: Record<string, string> = {};

  if (xDirection === 'left') {
    if (leftSpace - xDiff < MIN_SAFE_PADDING) {
      result.maxWidth = `${leftSpace + toggleRect.width - MIN_SAFE_PADDING}px`;
    }
  } else if (rightSpace - xDiff < MIN_SAFE_PADDING) {
    result.maxWidth = `${rightSpace + toggleRect.width - MIN_SAFE_PADDING}px`;
  }
  return result;
}

export function restrictHeightIfOverlay({ dropdownRect, toggleRect, containerRect, yDirection, maxDropdownHeight }: {
  dropdownRect: DOMRect;
  toggleRect: DOMRect;
  containerRect: DOMRect;
  yDirection: YDirection;
  maxDropdownHeight?: number;
}) {
  const bottomSpace = containerRect.bottom - toggleRect.bottom;
  const topSpace = toggleRect.top - containerRect.top;
  const result: Record<string, string> = {};

  if (maxDropdownHeight) {
    result.maxHeight = `${maxDropdownHeight}px`;
  }

  const dropdownHeight = maxDropdownHeight ?? dropdownRect.height;

  if (yDirection === 'top') {
    if (topSpace - dropdownHeight < MIN_SAFE_PADDING) {
      result.maxHeight = `${topSpace - MIN_SAFE_PADDING}px`;
    }
  } else if (bottomSpace - dropdownHeight < MIN_SAFE_PADDING) {
    result.maxHeight = `${bottomSpace - MIN_SAFE_PADDING}px`;
  }
  return result;
}

export function getYDirectionStyle({ toggleRect, yDirection, windowHeight }: {
  toggleRect: DOMRect;
  yDirection: YDirection;
  windowHeight: number;
}) {
  if (yDirection === 'top') return { bottom: `${windowHeight - toggleRect.top + DROPDOWN_GAP}px` } as const;
  return { top: `${toggleRect.bottom + DROPDOWN_GAP}px` } as const;
}

export function getDropdownDirectionStyles({
  dropdownRect,
  toggleRect,
  containerRect,
  windowWidth,
  windowHeight,
  xDirectionMode,
  yDirectionMode,
  maxDropdownHeight,
  noRestrictHeigth,
  fixedXDirection,
  fixedYDirection,
}: {
  dropdownRect: DOMRect;
  toggleRect: DOMRect;
  containerRect: DOMRect;
  windowWidth: number;
  windowHeight: number;
  xDirectionMode: XDirectionMode;
  yDirectionMode: YDirectionMode;
  maxDropdownHeight?: number;
  noRestrictHeigth?: boolean;
  fixedXDirection?: XDirection;
  fixedYDirection?: YDirection;
}) {
  const xDirection = fixedXDirection ?? getXDirection({ xDirectionMode, toggleRect, containerRect, dropdownRect });
  const xDirectionStyles = getXDirectionStyle({ xDirection, toggleRect, windowWidth });
  const widthCorrectionStyles = restrictWidthIfOverlay({ dropdownRect, toggleRect, containerRect, xDirection });

  const yDirection = fixedYDirection ?? getYDirection({ yDirectionMode, toggleRect, containerRect, dropdownHeight: maxDropdownHeight || dropdownRect.height });
  const yDirectionStyles = getYDirectionStyle({ toggleRect, yDirection, windowHeight });
  const heightCorrectionStyles = !noRestrictHeigth
    ? restrictHeightIfOverlay({ dropdownRect, toggleRect, containerRect, yDirection, maxDropdownHeight })
    : {};

  return {
    styles: {
      ...xDirectionStyles,
      ...widthCorrectionStyles,
      ...yDirectionStyles,
      ...heightCorrectionStyles,
    },
    xDirection,
    yDirection,
  } as const;
}
