import { useCallback, useState } from 'react';
import type { CSSProperties } from 'react';

interface DropdownState {
  localOpened: boolean;
  dropdownStyle: CSSProperties;
  directions: { x: 'left' | 'right'; y: 'top' | 'bottom' };
  toggleHeight: number;
  isWindowResizing: boolean;
}

interface DropdownActions {
  setLocalOpened: (opened: boolean) => void;
  setDropdownStyle: (style: CSSProperties | ((prev: CSSProperties) => CSSProperties)) => void;
  setDirections: (directions: { x: 'left' | 'right'; y: 'top' | 'bottom' }) => void;
  setToggleHeight: (height: number) => void;
  setIsWindowResizing: (resizing: boolean) => void;
  reset: () => void;
}

const initialState: DropdownState = {
  localOpened: false,
  dropdownStyle: {},
  directions: { x: 'right', y: 'bottom' },
  toggleHeight: 0,
  isWindowResizing: false,
};

export function useDropdownState(): [DropdownState, DropdownActions] {
  const [localOpened, setLocalOpened] = useState(initialState.localOpened);
  const [dropdownStyle, setDropdownStyle] = useState(initialState.dropdownStyle);
  const [directions, setDirections] = useState(initialState.directions);
  const [toggleHeight, setToggleHeight] = useState(initialState.toggleHeight);
  const [isWindowResizing, setIsWindowResizing] = useState(initialState.isWindowResizing);

  const reset = useCallback(() => {
    setLocalOpened(initialState.localOpened);
    setDropdownStyle(initialState.dropdownStyle);
    setDirections(initialState.directions);
    setToggleHeight(initialState.toggleHeight);
    setIsWindowResizing(initialState.isWindowResizing);
  }, []);

  const state: DropdownState = {
    localOpened,
    dropdownStyle,
    directions,
    toggleHeight,
    isWindowResizing,
  };

  const actions: DropdownActions = {
    setLocalOpened,
    setDropdownStyle,
    setDirections,
    setToggleHeight,
    setIsWindowResizing,
    reset,
  };

  return [state, actions];
}
