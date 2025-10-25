# Storybook для Pro-STO Service Admin

Это руководство поможет вам эффективно использовать Storybook для разработки UI компонентов админки.

## Запуск Storybook

```bash
# Запуск в режиме разработки
npm run storybook

# Сборка для продакшна
npm run build-storybook
```

После запуска Storybook будет доступен по адресу: http://localhost:6006

## Структура проекта

```
src/
├── components/          # Основные компоненты
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.stories.tsx
│   └── Layout/
│       ├── Header/
│       │   ├── Header.tsx
│       │   └── Header.stories.tsx
│       └── Sidebar/
│           ├── Sidebar.tsx
│           └── Sidebar.stories.tsx
└── stories/
    └── templates/       # Шаблоны для создания новых stories
        └── ComponentTemplate.stories.tsx
```

## Создание новых Stories

### 1. Базовая структура

Используйте шаблон из `src/stories/templates/ComponentTemplate.stories.tsx` как основу для создания новых stories.

### 2. Пример создания Story для Button

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Кнопка для выполнения действий пользователя',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'Вариант отображения кнопки',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Размер кнопки',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключенное состояние',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

### 3. Рекомендации по именованию

- **Title**: Используйте формат `Category/ComponentName` (например, `Components/Button`, `Layout/Header`)
- **Stories**: Используйте описательные имена (например, `Primary`, `Secondary`, `Loading`, `Disabled`)

## Настроенные аддоны

### Controls
Позволяет интерактивно изменять пропсы компонентов в реальном времени.

**Доступные типы контролов:**
- `boolean` - чекбокс
- `text` - текстовое поле
- `select` - выпадающий список
- `range` - слайдер
- `color` - выбор цвета
- `date` - выбор даты

### Actions
Логирует события компонентов (клики, изменения и т.д.).

```typescript
argTypes: {
  onClick: { action: 'clicked' },
  onChange: { action: 'changed' },
}
```

### Viewport
Тестирование адаптивности на разных экранах.

**Доступные размеры:**
- Mobile: 375x667px
- Tablet: 768x1024px  
- Desktop: 1440x900px

### Backgrounds
Тестирование компонентов на разных фонах.

**Доступные фоны:**
- Light (белый)
- Dark (темно-серый)
- Gray (светло-серый)

### Docs
Автоматическая генерация документации из JSDoc комментариев и TypeScript типов.

## Интеграция с темой

Все компоненты в Storybook используют основную тему приложения (`src/styles/theme.ts`) через `ThemeProvider` и `GlobalStyles`.

### Использование темы в компонентах

```typescript
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.text.inverse};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;
```

## Лучшие практики

### 1. Документация компонентов
```typescript
/**
 * Кнопка для выполнения действий пользователя
 * 
 * @param variant - Вариант отображения кнопки
 * @param size - Размер кнопки
 * @param disabled - Отключенное состояние
 */
export const Button = ({ variant = 'primary', size = 'medium', disabled = false, ...props }) => {
  // код компонента
};
```

### 2. Покрытие всех состояний
Создавайте stories для всех важных состояний компонента:
- Default (по умолчанию)
- Loading (загрузка)
- Disabled (отключен)
- Error (ошибка)
- Empty (пустое состояние)

### 3. Интерактивность
Используйте Actions для логирования событий:
```typescript
args: {
  onClick: () => console.log('Button clicked'),
  onHover: () => console.log('Button hovered'),
}
```

### 4. Адаптивность
Тестируйте компоненты на разных размерах экрана через Viewport аддон.

## Отладка

### Проблемы с TypeScript
Если возникают проблемы с типами, проверьте:
1. Правильность импортов компонентов
2. Соответствие типов в `argTypes`
3. Настройки `typescript` в `.storybook/main.ts`

### Проблемы с темой
Если тема не применяется:
1. Проверьте настройки `decorators` в `.storybook/preview.tsx`
2. Убедитесь, что `ThemeProvider` обворачивает все компоненты
3. Проверьте импорты темы и глобальных стилей

### Горячая перезагрузка
Hot reload должен работать автоматически. Если не работает:
1. Перезапустите Storybook
2. Проверьте консоль на наличие ошибок
3. Убедитесь, что все зависимости установлены

## Полезные ссылки

- [Официальная документация Storybook](https://storybook.js.org/docs)
- [Storybook для React](https://storybook.js.org/docs/react/get-started/introduction)
- [Addon Controls](https://storybook.js.org/docs/react/essentials/controls)
- [Addon Actions](https://storybook.js.org/docs/react/essentials/actions)
- [Addon Viewport](https://storybook.js.org/docs/react/essentials/viewport)
- [Addon Docs](https://storybook.js.org/docs/react/writing-docs/introduction)