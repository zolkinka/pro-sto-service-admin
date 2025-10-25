export interface AppLogoProps {
  /**
   * Дополнительный CSS класс для кастомизации
   */
  className?: string;
  
  /**
   * Обработчик клика по логотипу
   */
  onClick?: () => void;
  
  /**
   * Data-testid для тестирования
   */
  'data-testid'?: string;
}
