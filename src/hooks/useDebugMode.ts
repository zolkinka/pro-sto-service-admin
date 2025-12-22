import { useState, useEffect } from 'react';

const DEBUG_MODE_KEY = 'pro-sto-debug-mode';

/**
 * Хук для управления дебаг-режимом приложения
 */
export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    try {
      const stored = localStorage.getItem(DEBUG_MODE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DEBUG_MODE_KEY, String(isDebugMode));
    } catch (error) {
      console.error('Failed to save debug mode:', error);
    }
  }, [isDebugMode]);

  const enableDebugMode = () => setIsDebugMode(true);
  const disableDebugMode = () => setIsDebugMode(false);
  const toggleDebugMode = () => setIsDebugMode(prev => !prev);

  return {
    isDebugMode,
    enableDebugMode,
    disableDebugMode,
    toggleDebugMode,
  };
};

/**
 * Утилита для проверки дебаг-режима без использования хука
 */
export const isDebugModeEnabled = (): boolean => {
  try {
    return localStorage.getItem(DEBUG_MODE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Утилита для установки дебаг-режима без использования хука
 */
export const setDebugMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(DEBUG_MODE_KEY, String(enabled));
    // Dispatch event для обновления других компонентов
    window.dispatchEvent(new CustomEvent('debugModeChanged', { detail: { enabled } }));
  } catch (error) {
    console.error('Failed to set debug mode:', error);
  }
};
