# Pro-STO Admin Panel

Административная панель для сервиса бронирования автоуслуг Pro-STO.

## 🚀 Технологический стек

- **Frontend Framework**: React 18+ с TypeScript
- **State Management**: MobX 6+
- **Styling**: Styled Components
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 📁 Структура проекта

```
src/
├── components/         # Переиспользуемые компоненты
│   └── Layout/        # Компоненты макета (Header, Sidebar, MainLayout)
├── pages/             # Страницы приложения
│   ├── Dashboard/     # Главная страница
│   └── NotFound/      # Страница 404
├── stores/            # MobX сторы
│   ├── RootStore.ts   # Корневой стор
│   ├── context.ts     # React контекст для сторов
│   └── StoreContext.tsx # Провайдер сторов
├── styles/            # Styled Components темы и стили
│   ├── theme.ts       # Конфигурация темы
│   ├── GlobalStyles.ts # Глобальные стили
│   └── index.ts       # Экспорт стилей
├── utils/             # Утилиты и хелперы
│   ├── helpers.ts     # Общие утилиты
│   ├── errors.ts      # Обработка ошибок
│   └── index.ts       # Экспорт утилит
├── types/             # TypeScript типы
│   ├── common.ts      # Общие типы
│   ├── styled.d.ts    # Типы для styled-components
│   └── index.ts       # Экспорт типов
├── constants/         # Константы приложения
│   └── routes.ts      # Константы маршрутов
├── hooks/             # Custom React хуки
│   ├── useStores.ts   # Хук для доступа к сторам
│   └── index.ts       # Экспорт хуков
└── router/            # Конфигурация роутинга
    ├── AppRouter.tsx  # Основной роутер
    └── index.ts       # Экспорт роутера
```

## 🛠 Установка и запуск

### Требования

- Node.js 18+ 
- npm или yarn

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

### Сборка для продакшена

```bash
npm run build
```

### Просмотр продакшен сборки

```bash
npm run preview
```

### Линтинг

```bash
# Проверка кода
npm run lint

# Автоматическое исправление
npm run lint:fix

# Проверка типов TypeScript
npm run type-check
```

## 🎨 Дизайн система

### Цвета

- **Primary**: Синяя палитра (#3b82f6)
- **Gray**: Нейтральная палитра
- **Success**: Зеленый (#10b981)
- **Warning**: Оранжевый (#f59e0b)
- **Error**: Красный (#ef4444)

### Брейкпоинты

- **Mobile**: 576px
- **Tablet**: 768px
- **Desktop**: 1024px
- **Widescreen**: 1200px

### Спейсинг

Используется система спейсинга от `xs` (4px) до `5xl` (96px).

## 📱 Адаптивность

Приложение полностью адаптивно и поддерживает:

- Мобильные устройства (320px+)
- Планшеты (768px+)
- Десктопы (1024px+)

### Мобильные особенности

- Боковое меню скрывается на мобильных устройствах
- Кнопка гамбургер-меню для открытия навигации
- Оптимизированные размеры элементов для touch-интерфейса

## 📦 Архитектура State Management

Используется MobX для управления состоянием:

```typescript
// Использование в компонентах
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks';

const MyComponent = observer(() => {
  const { rootStore } = useStores();
  
  return <div>...</div>;
});
```

## 🔧 Настройка окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Настройте переменные окружения в `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=Pro-STO Admin Panel
VITE_BASE_STATIC_PATH=https://dev.prosto-app.ru
VITE_NODE_ENV=development
```

**Переменные окружения:**
- `VITE_API_BASE_URL` - URL API бэкенда
- `VITE_APP_TITLE` - Название приложения
- `VITE_BASE_STATIC_PATH` - Базовый путь для статических файлов (изображения автомобилей и т.д.)
  - Development: `https://dev.prosto-app.ru`
  - Production: пустая строка (файлы отдаются с того же домена)
- `VITE_NODE_ENV` - Окружение (development/production)

## 📋 Доступные скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm run preview` - Просмотр продакшен сборки
- `npm run lint` - Проверка кода ESLint
- `npm run lint:fix` - Автоматическое исправление ESLint
- `npm run type-check` - Проверка типов TypeScript

## 🎯 Особенности реализации

### Типизация

- Строгая типизация TypeScript на всех уровнях
- Типы для styled-components theme
- Общие типы для API responses и состояний

### Стилизация

- Использование Styled Components для компонентной стилизации
- Глобальная тема с цветами, спейсингом и брейкпоинтами
- Адаптивные стили с использованием медиа-запросов

### Обработка ошибок

- Централизованная обработка ошибок
- Типизированные состояния загрузки и ошибок
- Логирование ошибок для отладки

## 🔮 Планы развития

В будущих задачах будут добавлены:

- Система авторизации с JWT
- Интеграция с API
- Функциональные модули админки
- UI компоненты (таблицы, формы, модальные окна)
- Система уведомлений
- Работа с файлами

## 📝 Coding Standards

### TypeScript

- Использование строгого режима TypeScript
- Обязательная типизация всех функций и компонентов
- Использование `type` для типов и `interface` для объектов

### React

- Только функциональные компоненты с хуками
- Использование `observer` для MobX компонентов
- Деструктуризация props в параметрах функции

### Styled Components

- Именование компонентов в PascalCase
- Группировка связанных стилей
- Использование темы для консистентности

## 🤝 Contributing

1. Создайте ветку для фичи: `git checkout -b feature/amazing-feature`
2. Зафиксируйте изменения: `git commit -m 'Add amazing feature'`
3. Отправьте в ветку: `git push origin feature/amazing-feature`
4. Создайте Pull Request

## 📄 License

Этот проект является частью Pro-STO сервиса и предназначен для внутреннего использования.
