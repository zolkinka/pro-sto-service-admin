# AppToast Component

Компонент уведомлений (toast) для отображения временных сообщений пользователю.

## Файловая структура

```
src/components/ui/AppToast/
├── AppToast.tsx         # Компонент toast
├── ToastProvider.tsx    # Provider для управления
├── ToastContext.tsx     # React Context
├── useToast.tsx         # Hook для показа toast
├── AppToast.types.ts    # TypeScript типы
├── AppToast.stories.tsx # Storybook stories
└── index.ts            # Экспорты
```

## Основные возможности

✅ **Все типы уведомлений**: Success, Error, Info, Warning  
✅ **Автозакрытие и ручное закрытие**: Настраиваемое время или кнопка ×  
✅ **Анимации**: Slide-in/slide-out + fade с прогресс-баром  
✅ **Приостановка по hover**: Таймер останавливается при наведении  
✅ **Позиционирование**: top-right, top-left, bottom-right, bottom-left  
✅ **Стекинг**: Несколько toast одновременно (настраиваемый лимит)  
✅ **TypeScript типы**: Полная типизация  
✅ **Storybook stories**: 15+ интерактивных примеров  
✅ **Responsive design**: Адаптивная верстка  
✅ **Accessibility**: ARIA роли и атрибуты  

## Использование

### 1. Обернуть приложение в ToastProvider

```tsx
import { ToastProvider } from '@/components/ui';

function App() {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <YourApp />
    </ToastProvider>
  );
}
```

### 2. Использовать в компонентах

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { showToast, hideToast, hideAll } = useToast();

  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Успешно!',
      message: 'Операция выполнена успешно',
      duration: 3000, // мс
    });
  };

  const handleError = () => {
    showToast({
      type: 'error',
      title: 'Ошибка!',
      message: 'Произошла ошибка',
      duration: 0, // не закрывать автоматически
      closable: true,
      onClose: () => console.log('Toast closed'),
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={hideAll}>Закрыть все</button>
    </div>
  );
}
```

## API

### ToastProvider Props

```typescript
interface ToastProviderProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; // default: 'top-right'
  maxToasts?: number; // default: 5
  children: React.ReactNode;
}
```

### useToast Hook

```typescript
const useToast = (): {
  showToast: (config: ToastConfig) => string; // Возвращает ID toast'а
  hideToast: (id: string) => void;
  hideAll: () => void;
}
```

### ToastConfig

```typescript
interface ToastConfig {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number; // ms, 0 = не закрывать автоматически, default: 4000
  closable?: boolean; // default: true
  onClose?: () => void;
}
```

## Типы уведомлений

| Тип | Цвет | Фон | Использование |
|-----|------|-----|---------------|
| **Success** | `#0AB878` | `#DEF7E7` | Успешное действие |
| **Error** | `#E83046` | `#FBDFE2` | Ошибка |
| **Info** | `#4169E3` | `#EEF2FE` | Информация |
| **Warning** | `#CC8D18` | `#FEF5E7` | Предупреждение |

## Особенности реализации

### Анимации
- **Появление**: slide-in + fade-in (300ms)
- **Исчезновение**: slide-out + fade-out (300ms)
- **Прогресс-бар**: Показывает оставшееся время
- **Hover**: Приостанавливает таймер при наведении

### Позиционирование
- Компоненты рендерятся через Portal вне основного DOM дерева
- Автоматическая адаптация под мобильные устройства
- Стекинг с вертикальным отступом 12px

### Accessibility
- `role="alert"` для уведомлений
- `aria-live="polite"` для screen readers
- `aria-label` на кнопке закрытия
- Focus управление с клавиатуры

## Storybook Stories

Доступны следующие истории:
- All Types - Все типы уведомлений
- Success, Error, Info, Warning - Отдельные типы
- Without Title - Без заголовка
- Different Durations - Разная длительность
- Multiple Toasts - Множественные toast'ы
- With And Without Title - С заголовком и без
- Closable Options - Опции закрытия
- Position Top Right/Left - Позиционирование сверху
- Position Bottom Right/Left - Позиционирование снизу
- Interactive - Интерактивная демонстрация

## Технологии

- **React** 19.1.1
- **styled-components** 6.1.19
- **TypeScript** 5.9.3
- **Storybook** 8.6.14

## Цвета из темы

Компонент использует цвета из `/src/styles/theme.ts`:

```typescript
colors: {
  success: { 25: '#DEF7E7', 400: '#0AB878' },
  error: { 25: '#FBDFE2', 300: '#E83046' },
  blue: { 500: '#4169E3' }, // Info
  yellow: { 500: '#CC8D18' }, // Warning
  gray: { 25: '#FFFFFF', 800: '#53514F' },
}
```
