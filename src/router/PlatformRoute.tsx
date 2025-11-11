import { usePlatform } from '@/hooks';

interface PlatformRouteProps {
  /** Desktop версия компонента */
  desktop: React.ComponentType;
  /** Mobile версия компонента (опционально, если не указана - используется desktop) */
  mobile?: React.ComponentType;
}

/**
 * PlatformRoute - компонент для отображения разных версий страниц в зависимости от платформы
 * 
 * Автоматически определяет текущую платформу через хук usePlatform() и рендерит соответствующую версию компонента.
 * Если mobile версия не указана, будет использована desktop версия для всех платформ.
 * 
 * @example
 * // С отдельными версиями для desktop и mobile
 * <PlatformRoute 
 *   desktop={AnalyticsPage} 
 *   mobile={MobileAnalyticsPage}
 * />
 * 
 * @example
 * // Только desktop версия (будет использована для всех платформ)
 * <PlatformRoute desktop={SettingsPage} />
 */
export const PlatformRoute = ({ desktop: Desktop, mobile: Mobile }: PlatformRouteProps) => {
  const platform = usePlatform();
  
  // Если mobile версия не указана или платформа desktop - используем Desktop компонент
  if (!Mobile || platform === 'desktop') {
    return <Desktop />;
  }
  
  // Иначе используем Mobile компонент
  return <Mobile />;
};
