import { useState, useEffect } from 'react';

export type Platform = 'desktop' | 'mobile';

/**
 * Хук для определения текущей платформы (desktop/mobile)
 * 
 * Определение основано на:
 * 1. URL параметре ?platform=mobile|desktop
 * 2. User Agent (для автоматического определения мобильных устройств)
 * 3. Ширине экрана (breakpoint: 768px)
 * 
 * @returns {Platform} Текущая платформа: 'desktop' | 'mobile'
 * 
 * @example
 * const platform = usePlatform();
 * if (platform === 'mobile') {
 *   return <MobileComponent />;
 * }
 * return <DesktopComponent />;
 */
export const usePlatform = (): Platform => {
  const [platform, setPlatform] = useState<Platform>(() => {
    // Проверяем URL параметр
    const params = new URLSearchParams(window.location.search);
    const platformParam = params.get('platform');
    
    if (platformParam === 'mobile' || platformParam === 'desktop') {
      return platformParam as Platform;
    }
    
    // Проверяем User Agent
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobileDevice) {
      return 'mobile';
    }
    
    // Проверяем ширину экрана
    const isMobileWidth = window.innerWidth < 768;
    
    return isMobileWidth ? 'mobile' : 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      // Проверяем URL параметр (приоритет)
      const params = new URLSearchParams(window.location.search);
      const platformParam = params.get('platform');
      
      if (platformParam === 'mobile' || platformParam === 'desktop') {
        setPlatform(platformParam as Platform);
        return;
      }
      
      // Если нет URL параметра, используем ширину экрана
      const isMobileWidth = window.innerWidth < 768;
      setPlatform(isMobileWidth ? 'mobile' : 'desktop');
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return platform;
};
