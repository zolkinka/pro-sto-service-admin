# AppAutocomplete

Компонент автокомплита с возможностью ввода произвольного значения. Поддерживает как синхронную фильтрацию локальных опций, так и асинхронный поиск с debounce.

## Основные возможности

- ✅ Поле ввода с автофильтрацией опций
- ✅ Dropdown с отфильтрованными результатами
- ✅ Возможность выбора из списка или ввода произвольного значения
- ✅ Синхронная фильтрация локальных опций
- ✅ Асинхронный поиск с debounce
- ✅ Keyboard navigation (↑/↓/Enter/Esc/Tab)
- ✅ Настраиваемая минимальная длина запроса
- ✅ Индикатор загрузки при асинхронном поиске
- ✅ Кастомный рендер опций
- ✅ Кастомная функция фильтрации
- ✅ Поддержка всех состояний AppInput (label, error, disabled, required)

## API

### Props

```typescript
interface AppAutocompleteProps {
  // Основные
  value?: SelectOption;
  onChange?: (value: SelectOption) => void;
  
  // Опции
  options?: SelectOption[];
  onSearch?: (query: string) => Promise<SelectOption[]>;
  
  // Настройки поиска
  minSearchLength?: number; // по умолчанию 2
  searchDebounce?: number; // по умолчанию 300ms
  
  // UI
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Кастомизация
  renderOption?: (option: SelectOption) => ReactNode;
  filterOption?: (option: SelectOption, query: string) => boolean;
  
  // Служебные
  className?: string;
  baseDropdownProps?: Partial<AppBaseDropdownProps>;
}

interface SelectOption {
  label: string;
  value: string | number | null;
  disabled?: boolean;
  /** Флаг, указывающий что это произвольное значение пользователя */
  isCustom?: boolean;
}
```

## Примеры использования

### Базовый пример с локальными опциями

```tsx
import { AppAutocomplete } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [city, setCity] = useState('');

  const options = [
    { label: 'Москва', value: 'moscow' },
    { label: 'Санкт-Петербург', value: 'spb' },
    { label: 'Новосибирск', value: 'nsk' },
  ];

  return (
    <AppAutocomplete
      label="Город"
      options={options}
      value={city}
      onChange={setCity}
      placeholder="Начните вводить название..."
    />
  );
}
```

### Асинхронный поиск

```tsx
import { AppAutocomplete } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [city, setCity] = useState('');

  const handleSearch = async (query: string) => {
    const response = await fetch(`/api/cities?q=${query}`);
    return response.json();
  };

  return (
    <AppAutocomplete
      label="Город"
      onSearch={handleSearch}
      value={city}
      onChange={setCity}
      minSearchLength={2}
      searchDebounce={300}
      placeholder="Введите минимум 2 символа..."
    />
  );
}
```

### Кастомный рендер опций

```tsx
<AppAutocomplete
  label="Выберите технологию"
  options={techOptions}
  value={tech}
  onChange={setTech}
  renderOption={(option) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img src={option.icon} alt="" width="20" />
      <span>{option.label}</span>
    </div>
  )}
/>
```

### Кастомная фильтрация

```tsx
// Фильтрация только по началу строки
<AppAutocomplete
  label="Город"
  options={cityOptions}
  value={city}
  onChange={setCity}
  filterOption={(option, query) => 
    option.label.toLowerCase().startsWith(query.toLowerCase())
  }
/>
```

### С обработкой ошибок

```tsx
const [city, setCity] = useState('');
const [error, setError] = useState('');

const handleChange = (value: string | SelectOption) => {
  setCity(value);
  setError('');
};

<AppAutocomplete
  label="Город"
  options={cityOptions}
  value={city}
  onChange={handleChange}
  error={error}
  required
/>
```

## Поведение компонента

### Режим с локальными опциями

Когда передан prop `options`:
- Фильтрация происходит на клиенте по полю `label`
- Dropdown открывается сразу при фокусе или вводе
- Показывает все опции при пустом инпуте (если dropdown открыт)

### Режим с асинхронным поиском

Когда передан prop `onSearch`:
- При вводе текста длиной >= `minSearchLength` запускается поиск
- Запросы дебаунсятся с задержкой `searchDebounce` миллисекунд
- Показывается индикатор загрузки во время запроса
- При ошибке опции не отображаются (ошибка логируется в консоль)

### Возвращаемое значение

Callback `onChange` возвращает:
- **SelectOption** - если пользователь выбрал опцию из списка
- **string** - если пользователь ввел произвольное значение

```tsx
const handleChange = (value: string | SelectOption) => {
  if (typeof value === 'string') {
    console.log('Произвольное значение:', value);
  } else {
    console.log('Выбрана опция:', value.label, value.value);
  }
};
```

## Keyboard Navigation

- **↑/↓** - навигация по опциям
- **Enter** - выбор выделенной опции или сохранение текущего значения
- **Esc** - закрыть dropdown
- **Tab** - закрыть dropdown и сохранить текущее значение

## Зависимости

- `AppInput` - для стилей и базового инпута
- `AppBaseDropdown` - для dropdown функциональности
- `useDebounce` - для debounce асинхронных запросов
- `useClickOutside`, `useEscapeKey` - используются внутри AppBaseDropdown

## Стилизация

Компонент использует CSS классы с BEM нотацией:

```css
.app-autocomplete
.app-autocomplete_disabled
.app-autocomplete__input-container
.app-autocomplete__input-wrapper
.app-autocomplete__arrow
.app-autocomplete__arrow_open
.app-autocomplete__dropdown
.app-autocomplete__options-container
.app-autocomplete__option
.app-autocomplete__option_highlighted
.app-autocomplete__no-options
.app-autocomplete__loading
.app-autocomplete__min-length-hint
```

Стили базируются на дизайн-системе компонентов AppSingleSelect и AppInput.

## TypeScript

Компонент полностью типизирован и экспортирует все необходимые типы:

```typescript
import type { 
  AppAutocompleteProps, 
  SelectOption 
} from '@/components/ui/AppAutocomplete';
```
