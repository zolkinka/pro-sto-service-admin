import { usePlatform } from '@/hooks';
import './PlatformIndicator.css';

/**
 * Компонент для отображения текущей платформы (для отладки)
 * Показывает красный индикатор в правом нижнем углу экрана
 */
export const PlatformIndicator = () => {
  const platform = usePlatform();
  
  return (
    <div className="platform-indicator" data-platform={platform}>
      Platform: {platform}
    </div>
  );
};
