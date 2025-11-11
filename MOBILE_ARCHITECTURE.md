# Архитектура мобильной версии

> Документация по структуре проекта для поддержки десктопной и мобильной версий приложения

## 📋 Содержание

- [Обзор](#обзор)
- [Архитектурные принципы](#архитектурные-принципы)
- [Структура проекта](#структура-проекта)
- [Разделение UI компонентов](#разделение-ui-компонентов)
- [Переиспользование логики](#переиспользование-логики)
- [Работа со стилями](#работа-со-стилями)
- [Роутинг](#роутинг)
- [Примеры использования](#примеры-использования)

## 🎯 Обзор

Проект поддерживает одновременную разработку десктопной и мобильной версий с эффективным переиспользованием общей бизнес-логики. Архитектура обеспечивает:

- ✅ Четкое разделение UI для разных платформ
- ✅ Максимальное переиспользование бизнес-логики
- ✅ Легкую навигацию (desktop и mobile версии рядом)
- ✅ Независимое развитие UI без конфликтов
- ✅ Переиспользование CSS переменных и утилит

## 🏗️ Архитектурные принципы

### 1. Разделение UI, объединение логики

**Разделяется:**
- ❌ UI компоненты страниц (TSX файлы)
- ❌ Специфичные компоненты интерфейса
- ❌ CSS файлы компонентов/страниц

**Переиспользуется:**
- ✅ Stores (MobX сторы)
- ✅ API клиенты и сервисы
- ✅ Hooks (кастомные хуки)
- ✅ Utils и helpers
- ✅ Types (типы TypeScript)
- ✅ Constants (константы)
- ✅ CSS переменные и общие стили

### 2. Именование файлов

- **Desktop версии**: стандартное именование (например, `AnalyticsPage.tsx`)
- **Mobile версии**: префикс `Mobile` в названии (например, `MobileAnalyticsPage.tsx`)

### 3. Организация файлов

Desktop и mobile версии размещаются **в одной папке** для удобства навигации.

## 📁 Структура проекта

```
src/
├── components/              # Переиспользуемые компоненты (desktop и mobile)
│   └── ui/                  # UI kit компоненты
│
├── mobile-components/       # Специфичные мобильные компоненты
│   └── index.ts
│
├── pages/                   # Страницы приложения
│   ├── AnalyticsPage/
│   │   ├── AnalyticsPage.tsx         # Desktop версия
│   │   ├── AnalyticsPage.css         # Desktop стили
│   │   ├── MobileAnalyticsPage.tsx   # Mobile версия (когда будет создана)
│   │   └── MobileAnalyticsPage.css   # Mobile стили (когда будет создан)
│   │
│   └── OrdersPage/
│       ├── OrdersPage.tsx
│       ├── OrdersPage.css
│       ├── MobileOrdersPage.tsx      # (будущая реализация)
│       └── MobileOrdersPage.css      # (будущая реализация)
│
├── hooks/                   # Кастомные хуки (переиспользуются)
│   ├── usePlatform.ts       # 🆕 Определение текущей платформы
│   ├── useStores.ts
│   └── index.ts
│
├── stores/                  # MobX сторы (переиспользуются)
│   ├── AuthStore.ts
│   ├── BookingsStore.ts
│   └── ...
│
├── services/                # API и сервисы (переиспользуются)
│   ├── api-client/
│   └── firebase.ts
│
├── utils/                   # Утилиты (переиспользуются)
│   ├── helpers.ts
│   └── errors.ts
│
├── types/                   # TypeScript типы (переиспользуются)
│   └── common.ts
│
├── constants/               # Константы (переиспользуются)
│   └── routes.ts
│
├── styles/                  # Глобальные стили и переменные
│   ├── variables.css        # 🔄 CSS переменные (desktop + mobile)
│   ├── global.css
│   └── theme.ts
│
└── router/                  # Конфигурация роутинга
    ├── AppRouter.tsx        # 🔄 Главный роутер
    ├── PlatformRoute.tsx    # 🆕 Компонент для platform-aware роутинга
    └── index.ts
```

## 🎨 Разделение UI компонентов

### Структура страницы

```
src/pages/ExamplePage/
├── ExamplePage.tsx              # Desktop версия
├── ExamplePage.css              # Desktop стили
├── MobileExamplePage.tsx        # Mobile версия
└── MobileExamplePage.css        # Mobile стили
```

### Пример Desktop компонента

```tsx
// src/pages/ExamplePage/ExamplePage.tsx
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';
import './ExamplePage.css';

export const ExamplePage = observer(() => {
  const { exampleStore } = useStores();
  
  return (
    <div className="example-page">
      <h1>Desktop Example</h1>
      {/* Desktop UI */}
    </div>
  );
});
```

### Пример Mobile компонента

```tsx
// src/pages/ExamplePage/MobileExamplePage.tsx
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';
import './MobileExamplePage.css';

export const MobileExamplePage = observer(() => {
  const { exampleStore } = useStores();
  
  return (
    <div className="mobile-example-page">
      <h1>Mobile Example</h1>
      {/* Mobile UI */}
    </div>
  );
});
```

## ♻️ Переиспользование логики

### MobX Stores

Все сторы переиспользуются между desktop и mobile версиями:

```tsx
// Одинаково работает и в desktop, и в mobile компонентах
import { useStores } from '@/hooks';

const { bookingsStore, authStore } = useStores();
```

### Hooks

Кастомные хуки доступны для всех компонентов:

```tsx
import { useStores, useDebounce, usePlatform } from '@/hooks';

const platform = usePlatform(); // 'desktop' | 'mobile'
```

### API и сервисы

API клиенты и сервисы едины для всех версий:

```tsx
import { client } from '@/services/api-client';
import { notificationService } from '@/services/notificationService';
```

## 🎨 Работа со стилями

### CSS переменные

В `src/styles/variables.css` определены переменные для обеих платформ:

```css
:root {
  /* Desktop spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  /* ... */
  
  /* Mobile spacing (меньшие отступы) */
  --spacing-mobile-xs: 0.25rem;
  --spacing-mobile-sm: 0.375rem;
  --spacing-mobile-md: 0.5rem;
  /* ... */
  
  /* Mobile font sizes */
  --font-size-mobile-xs: 0.625rem;   /* 10px */
  --font-size-mobile-sm: 0.75rem;    /* 12px */
  --font-size-mobile-base: 0.875rem; /* 14px */
  /* ... */
  
  /* Mobile-specific heights */
  --mobile-header-height: 56px;
  --mobile-tab-bar-height: 64px;
  --mobile-button-height: 44px;      /* Apple recommended touch target */
  --mobile-touch-target-min: 44px;
}
```

### Использование в компонентах

**Desktop стили:**
```css
/* ExamplePage.css */
.example-page {
  padding: var(--spacing-xl);
  font-size: var(--font-size-base);
}
```

**Mobile стили:**
```css
/* MobileExamplePage.css */
.mobile-example-page {
  padding: var(--spacing-mobile-md);
  font-size: var(--font-size-mobile-base);
}

.mobile-button {
  height: var(--mobile-button-height);
  min-height: var(--mobile-touch-target-min);
}
```

## 🛣️ Роутинг

### Хук usePlatform()

Определяет текущую платформу на основе:
1. URL параметра `?platform=mobile|desktop` (приоритет)
2. User Agent (автоопределение мобильных устройств)
3. Ширины экрана (breakpoint: 768px)

```tsx
import { usePlatform } from '@/hooks';

const platform = usePlatform(); // 'desktop' | 'mobile'
```

### Компонент PlatformRoute

Автоматически выбирает нужную версию компонента:

```tsx
import { PlatformRoute } from '@/router';

<PlatformRoute 
  desktop={AnalyticsPage} 
  mobile={MobileAnalyticsPage} 
/>
```

### Интеграция в AppRouter

```tsx
// src/router/AppRouter.tsx
import { PlatformRoute } from './PlatformRoute';

<Route
  path={ROUTES.ANALYTICS}
  element={
    <PrivateRoute>
      <PlatformRoute 
        desktop={AnalyticsPage} 
        mobile={MobileAnalyticsPage}
      />
    </PrivateRoute>
  }
/>
```

## 📚 Примеры использования

### Создание новой страницы с desktop и mobile версиями

1. **Создайте структуру файлов:**
```
src/pages/NewPage/
├── NewPage.tsx
├── NewPage.css
├── MobileNewPage.tsx
└── MobileNewPage.css
```

2. **Реализуйте desktop версию:**
```tsx
// NewPage.tsx
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';
import './NewPage.css';

export const NewPage = observer(() => {
  const { someStore } = useStores();
  
  return (
    <div className="new-page">
      {/* Desktop UI */}
    </div>
  );
});
```

3. **Реализуйте mobile версию:**
```tsx
// MobileNewPage.tsx
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';
import './MobileNewPage.css';

export const MobileNewPage = observer(() => {
  const { someStore } = useStores();
  
  return (
    <div className="mobile-new-page">
      {/* Mobile UI */}
    </div>
  );
});
```

4. **Добавьте в роутер:**
```tsx
// src/router/AppRouter.tsx
import { NewPage } from '@/pages/NewPage/NewPage';
import { MobileNewPage } from '@/pages/NewPage/MobileNewPage';

<Route
  path={ROUTES.NEW_PAGE}
  element={
    <PrivateRoute>
      <PlatformRoute 
        desktop={NewPage} 
        mobile={MobileNewPage}
      />
    </PrivateRoute>
  }
/>
```

### Условный рендеринг на основе платформы

```tsx
import { usePlatform } from '@/hooks';

const MyComponent = () => {
  const platform = usePlatform();
  
  return (
    <div>
      {platform === 'mobile' ? (
        <MobileSpecificComponent />
      ) : (
        <DesktopSpecificComponent />
      )}
    </div>
  );
};
```

### Использование в сторах

```tsx
// stores/ExampleStore.ts
import { makeAutoObservable } from 'mobx';

class ExampleStore {
  constructor() {
    makeAutoObservable(this);
  }
  
  // Логика работает одинаково для desktop и mobile
  async fetchData() {
    // ...
  }
}
```

## 🔧 Тестирование платформ

### Тестирование через URL параметр

Добавьте параметр `?platform=mobile` или `?platform=desktop` к URL:

```
http://localhost:5173/?platform=mobile
http://localhost:5173/?platform=desktop
```

### Тестирование через DevTools

1. Откройте Chrome DevTools (F12)
2. Включите Device Toolbar (Ctrl+Shift+M)
3. Выберите мобильное устройство
4. Перезагрузите страницу

## ✅ Преимущества архитектуры

1. **Четкое разделение ответственности** - UI отделен от логики
2. **DRY принцип** - бизнес-логика не дублируется
3. **Удобная навигация** - desktop и mobile версии в одной папке
4. **Независимая разработка** - можно работать над desktop/mobile параллельно
5. **Гибкость** - легко добавлять новые платформы (например, tablet)
6. **Переиспользование стилей** - общие CSS переменные для всех платформ
7. **Type safety** - TypeScript типы едины для всех версий

## 🚀 Следующие шаги

1. Создайте mobile версии существующих страниц
2. Разработайте специфичные мобильные компоненты в `src/mobile-components/`
3. Добавьте mobile-specific утилиты при необходимости
4. Настройте mobile layout (MobileAppLayout)
5. Оптимизируйте производительность для мобильных устройств

## 📝 Дополнительные ресурсы

- [MobX Documentation](https://mobx.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)
