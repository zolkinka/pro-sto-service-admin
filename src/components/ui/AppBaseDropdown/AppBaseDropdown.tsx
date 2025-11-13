import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import './AppBaseDropdown.css';
import {
  getDropdownDirectionStyles,
  getDropdownWidth,
  type XDirectionMode,
  type YDirectionMode,
} from './helpers';
import { CSS_CLASSES, DEBOUNCE_DELAY } from './constants';
import {
  createFallbackStyles,
  createFinalDropdownStyles,
  createInitialDropdownStyles,
  getDropdownElement,
  nextFrame,
} from './utils';
import { useDebouncedCallback } from './hooks/useDebouncedCallback';
import { useDropdownState } from './hooks/useDropdownState';
import { useEscapeKey } from './hooks/useEscapeKey';
import { useLatest } from './hooks/useLatest';
import { useResizeObserver } from './hooks/useResizeObserver';
import { useWindowEvent } from './hooks/useWindowEvent';
import { usePlatform } from '@/hooks/usePlatform';
import { MobileDrawer } from './MobileDrawer';

export interface AppBaseDropdownProps {
  opened: boolean;
  container?: Element | null;
  toggleWidth?: string;
  dropdownWidth?: 'min-toggle' | 'equal-toggle' | 'none' | string;
  xDirection?: XDirectionMode;
  yDirection?: YDirectionMode;
  maxDropdownHeight?: number | string;
  noRestrictHeigth?: boolean;
  onClose?: () => void;
  toggle: ReactNode;
  dropdown: ReactNode;
  /** Force mobile drawer mode (useful for specific components like DatePicker) */
  forceMobileDrawer?: boolean;
}

export const AppBaseDropdown: React.FC<AppBaseDropdownProps> = ({
  opened,
  container = null,
  toggleWidth = 'auto',
  dropdownWidth = 'min-toggle',
  xDirection = 'free-space',
  yDirection = 'free-space',
  maxDropdownHeight,
  noRestrictHeigth = false,
  onClose,
  toggle,
  dropdown,
  forceMobileDrawer = false,
}) => {
  const platform = usePlatform();
  const isMobileMode = platform === 'mobile' || forceMobileDrawer;
  
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const overflowRef = useRef<HTMLDivElement | null>(null);

  const [state, actions] = useDropdownState();
  const onCloseRef = useLatest(onClose);

  const preparedContainer = useMemo(() => {
    if (container) return container;
    const root = rootRef.current;
    const parent = root?.closest('.dropdown-container');
    return parent || document.body;
  }, [container]);

  const preparedMaxDropdownHeight = useMemo(() => {
    if (maxDropdownHeight === undefined) return undefined;
    return Number.parseFloat(String(maxDropdownHeight));
  }, [maxDropdownHeight]);

  const close = useCallback(() => {
    actions.reset();
    onCloseRef.current?.();
  }, [actions, onCloseRef]);

  const handleWheelScroll = useCallback((e: React.WheelEvent) => {
    if (state.localOpened) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [state.localOpened]);

  const measureAndPosition = useCallback(async () => {
    const toggleEl = toggleRef.current;
    if (!toggleEl) return;

    const toggleRect = toggleEl.getBoundingClientRect();
    const containerRect = preparedContainer?.getBoundingClientRect();
    if (!containerRect) return;

    actions.setToggleHeight(toggleRect.height);

    // Create initial styles
    const dropdownWidthStyle = getDropdownWidth({ 
      dropdownWidthMode: dropdownWidth, 
      toggleRect 
    });
    const initialStyles = createInitialDropdownStyles(
      state.dropdownStyle, 
      dropdownWidthStyle
    );

    actions.setDropdownStyle(initialStyles);
    actions.setLocalOpened(true);

    // Wait for DOM mount
    await nextFrame();
    const dropdownEl = await getDropdownElement(dropdownRef);

    if (!dropdownEl) {
      actions.setDropdownStyle(prev => createFallbackStyles(prev));
      return;
    }

    // Calculate positioning
    const dropdownRect = dropdownEl.getBoundingClientRect();
    const windowHeight = document.documentElement.clientHeight;
    const windowWidth = document.documentElement.clientWidth;

    const directionStyles = getDropdownDirectionStyles({
      dropdownRect,
      toggleRect,
      containerRect,
      windowWidth,
      windowHeight,
      xDirectionMode: xDirection,
      yDirectionMode: yDirection,
      maxDropdownHeight: preparedMaxDropdownHeight,
      noRestrictHeigth,
      fixedXDirection: undefined,
      fixedYDirection: undefined,
    });

    const finalStyles = createFinalDropdownStyles(initialStyles, directionStyles.styles);
    actions.setDropdownStyle(finalStyles);
    actions.setDirections({ 
      x: directionStyles.xDirection, 
      y: directionStyles.yDirection 
    });
  }, [
    preparedContainer,
    dropdownWidth,
    state.dropdownStyle,
    xDirection,
    yDirection,
    preparedMaxDropdownHeight,
    noRestrictHeigth,
    actions,
  ]);

  const recalculateWithDirection = useCallback(async () => {
    const toggleEl = toggleRef.current;
    if (!toggleEl) return;

    const toggleRect = toggleEl.getBoundingClientRect();
    const containerRect = preparedContainer?.getBoundingClientRect();
    if (!containerRect) return;

    await nextFrame();
    const dropdownEl = await getDropdownElement(dropdownRef);
    if (!dropdownEl) return;

    const dropdownRect = dropdownEl.getBoundingClientRect();
    const windowHeight = document.documentElement.clientHeight;
    const windowWidth = document.documentElement.clientWidth;

    const directionStyles = getDropdownDirectionStyles({
      dropdownRect,
      toggleRect,
      containerRect,
      windowWidth,
      windowHeight,
      xDirectionMode: xDirection,
      yDirectionMode: yDirection,
      maxDropdownHeight: preparedMaxDropdownHeight,
      noRestrictHeigth,
      fixedXDirection: state.directions.x,
      fixedYDirection: state.directions.y,
    });

    const finalStyles = createFinalDropdownStyles(
      state.dropdownStyle, 
      directionStyles.styles
    );
    console.log('finalStyles', finalStyles);
    actions.setDropdownStyle(finalStyles);
  }, [
    preparedContainer,
    xDirection,
    yDirection,
    preparedMaxDropdownHeight,
    noRestrictHeigth,
    state.directions,
    state.dropdownStyle,
    actions,
  ]);

  const debouncedRecalculate = useDebouncedCallback(recalculateWithDirection, DEBOUNCE_DELAY);

  const handleToggleDimensionChange = useCallback(() => {
    if (!state.localOpened) return;
    const h = toggleRef.current?.getBoundingClientRect().height;
    if (h === undefined || h === state.toggleHeight) return;
    recalculateWithDirection();
  }, [state.localOpened, state.toggleHeight, recalculateWithDirection]);

  const handleWindowResize = useCallback(() => {
    if (!state.localOpened) return;
    actions.setIsWindowResizing(true);
    debouncedRecalculate();
  }, [state.localOpened, debouncedRecalculate, actions]);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const root = rootRef.current;
    const clickOutside = !root?.contains(target) || target === overflowRef.current;
    if (clickOutside) {
      e.stopPropagation();
      close();
    }
  }, [close]);

  // React to opened prop changes
  useEffect(() => {
    if (state.localOpened === opened) return;
    if (opened) {
      measureAndPosition();
    } else {
      close();
    }
  }, [opened, state.localOpened, measureAndPosition, close]);

  // Event listeners
  useResizeObserver(toggleRef, handleToggleDimensionChange);
  useWindowEvent('resize', handleWindowResize, undefined, state.localOpened);
  // Don't handle outside clicks in mobile mode - drawer handles its own closing
  useWindowEvent('mousedown', handleOutsideClick, true, state.localOpened && !isMobileMode);
  useEscapeKey(close, state.localOpened);

  const rootClassName = useMemo(() => [
    CSS_CLASSES.root,
    opened && CSS_CLASSES.rootOpened,
  ].filter(Boolean).join(' '), [opened]);

  // Mobile drawer mode
  if (isMobileMode) {
    return (
      <div ref={rootRef} className={rootClassName}>
        <div
          ref={toggleRef}
          className={CSS_CLASSES.toggleWrapper}
          style={{ width: toggleWidth }}
        >
          {toggle}
        </div>

        <MobileDrawer opened={opened} onClose={onClose}>
          {dropdown}
        </MobileDrawer>
      </div>
    );
  }

  // Desktop dropdown mode
  return (
    <div ref={rootRef} className={rootClassName}>
      {state.localOpened && (
        <div ref={overflowRef} className={CSS_CLASSES.overflow} />
      )}
      
      <div
        ref={toggleRef}
        className={CSS_CLASSES.toggleWrapper}
        style={{ width: toggleWidth }}
        onWheel={handleWheelScroll}
      >
        {toggle}
      </div>

      <div className={CSS_CLASSES.dropdownWrapper}>
        <div className={CSS_CLASSES.contentWrapper}>
          {state.localOpened && !state.isWindowResizing && (
            <div 
              ref={dropdownRef} 
              className={CSS_CLASSES.content} 
              style={state.dropdownStyle}
            >
              {dropdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppBaseDropdown;