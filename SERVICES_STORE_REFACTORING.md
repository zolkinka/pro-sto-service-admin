# Рефакторинг ServicesStore - Централизация логики и состояния формы

## Обзор изменений

Вся логика и состояние формы для создания/редактирования услуг теперь полностью управляются через MobX store `ServicesStore`. Компонент `MobileServiceModal` стал "глупым" компонентом, который только отображает данные из store и вызывает его методы.

## Структура изменений

### 1. Добавлен новый тип `ServiceFormData`

```typescript
export interface ServiceFormData {
  name: string;
  description: string;
  duration: string;
  priceSedan: string;
  priceCrossover: string;
  priceSuv: string;
  priceMinivan: string;
}
```

Этот тип представляет данные формы для создания/редактирования услуги и экспортируется из `ServicesStore.ts`.

### 2. Добавлено состояние формы в `ServicesStore`

```typescript
export class ServicesStore {
  services: ServiceDto[] = [];
  activeCategory: 'car_wash' | 'tire_service' = 'car_wash';
  isLoading = false;
  error: string | null = null;
  
  // Состояние формы создания/редактирования
  formData: ServiceFormData = {
    name: '',
    description: '',
    duration: '',
    priceSedan: '',
    priceCrossover: '',
    priceSuv: '',
    priceMinivan: '',
  };
  
  formErrors: Record<string, string> = {};
  isSubmitting = false;
}
```

### 3. Добавлены методы управления формой в `ServicesStore`

#### `initCreateForm()`
Инициализирует форму для создания новой услуги (очищает все поля).

**Использование:**
```typescript
servicesStore.initCreateForm();
```

#### `initEditForm(service: ServiceDto)`
Инициализирует форму для редактирования существующей услуги (заполняет поля данными).

**Использование:**
```typescript
servicesStore.initEditForm(service);
```

#### `updateFormField(field: keyof ServiceFormData, value: string)`
Обновляет отдельное поле формы и автоматически очищает ошибку этого поля.

**Использование:**
```typescript
servicesStore.updateFormField('name', 'Новое название');
```

**Функциональность:**
- Реактивно обновляет поле в `formData`
- Автоматически удаляет ошибку для этого поля из `formErrors`
- MobX автоматически обновляет UI

#### `validateCurrentForm(): boolean`
Валидирует текущие данные формы и сохраняет ошибки в `formErrors`.

**Использование:**
```typescript
const isValid = servicesStore.validateCurrentForm();
```

**Возвращает:** `true` если форма валидна, `false` если есть ошибки

#### `resetForm()`
Сбрасывает форму в начальное состояние.

**Использование:**
```typescript
servicesStore.resetForm();
```

#### `submitServiceForm(mode, serviceCenterUuid, serviceType, serviceUuid?): Promise<boolean>`
Единый метод для отправки формы (создание или редактирование услуги).

**Использование:**
```typescript
const success = await servicesStore.submitServiceForm(
  'edit',
  authStore.user.service_center_uuid,
  'main',
  service.uuid
);
```

**Функциональность:**
- Валидирует форму перед отправкой
- Устанавливает `isSubmitting = true` на время выполнения
- Вызывает `createService` или `updateService` в зависимости от режима
- Сбрасывает форму при успешной отправке
- Возвращает `true` при успехе, `false` при ошибке

#### Унаследованные методы преобразования данных

- `serviceToFormData(service)` - преобразование из API формата в формат формы
- `formDataToServiceDto(formData, serviceType, serviceCenterUuid?)` - преобразование из формата формы в API формат. **Важно:** `serviceCenterUuid` передаётся только при создании, не при редактировании
- `validateFormData(formData)` - валидация данных формы

## Обновление компонента `MobileServiceModal`

### Было (локальное состояние в компоненте):

```typescript
const [formData, setFormData] = useState<ServiceFormData>({...});
const [errors, setErrors] = useState<FormErrors>({});
const [isSubmitting, setIsSubmitting] = useState(false);

// Инициализация формы
useEffect(() => {
  if (mode === 'edit' && service) {
    setFormData(servicesStore.serviceToFormData(service));
  } else {
    setFormData({...});
  }
  setErrors({});
}, [mode, service, isOpen]);

// Обработка изменений
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }
};

// Валидация
const validate = () => {
  const validationErrors = servicesStore.validateFormData(formData);
  setErrors(validationErrors);
  return Object.keys(validationErrors).length === 0;
};

// Отправка
const handleSubmit = async (e) => {
  if (!validate()) return;
  setIsSubmitting(true);
  // ... сложная логика отправки
  setIsSubmitting(false);
};

// JSX
<MobileInput
  value={formData.name}
  onChange={(value) => handleChange('name', value)}
  error={errors.name}
/>
```

### Стало (использование store):

```typescript
// Инициализация формы
useEffect(() => {
  if (isOpen) {
    if (mode === 'edit' && service) {
      servicesStore.initEditForm(service);
    } else {
      servicesStore.initCreateForm();
    }
  }
}, [mode, service, isOpen]);

// Отправка
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const serviceCenterUuid = authStore.user?.service_center_uuid;
  if (!serviceCenterUuid) {
    console.error('Service center UUID not found');
    return;
  }

  const success = await servicesStore.submitServiceForm(
    mode,
    serviceCenterUuid,
    serviceType,
    service?.uuid
  );

  if (success) {
    onClose();
  }
};

// JSX - прямое использование store
<MobileInput
  value={servicesStore.formData.name}
  onChange={(value) => servicesStore.updateFormField('name', value)}
  error={servicesStore.formErrors.name}
/>

<MobileButton
  loading={servicesStore.isSubmitting}
  disabled={servicesStore.isSubmitting}
>
  {mode === 'create' ? 'Добавить' : 'Сохранить'}
</MobileButton>
```

## Преимущества новой архитектуры

### 1. Единый источник истины
- Все состояние формы в одном месте (store)
- Нет дублирования состояния между компонентами
- MobX обеспечивает реактивность из коробки

### 2. Упрощение компонентов
- Компонент не управляет локальным состоянием
- Меньше useState, useEffect, обработчиков
- Компонент фокусируется только на отображении

### 3. Переиспользование логики
- Вся логика доступна для любых компонентов
- Десктопная версия может легко переключиться на те же методы
- Тестирование store без компонентов

### 4. Лучшая отладка
- Состояние видно в MobX DevTools
- Легко проверить текущие значения формы
- История изменений отслеживается

### 5. Персистентность данных
- Данные формы сохраняются при переключении между компонентами
- Можно реализовать черновики (draft)
- Возможность отмены изменений

### 6. Оптимизация производительности
- MobX автоматически оптимизирует ре-рендеры
- Обновляются только зависимые компоненты
- Нет лишних вычислений

## Миграция существующих компонентов

Для миграции других форм на эту архитектуру:

1. Добавить состояние формы в store:
```typescript
formData: YourFormData = {...};
formErrors: Record<string, string> = {};
isSubmitting = false;
```

2. Создать методы управления:
```typescript
initCreateForm() { ... }
initEditForm(data) { ... }
updateFormField(field, value) { ... }
validateCurrentForm() { ... }
submitForm(...) { ... }
```

3. Обновить компонент:
```typescript
// Вместо useState
servicesStore.formData.field

// Вместо handleChange
servicesStore.updateFormField('field', value)

// Вместо validate + submit
servicesStore.submitForm(...)
```

## Тестирование

Функциональность проверена:
- ✅ Инициализация формы для создания (пустая форма)
- ✅ Инициализация формы для редактирования (заполненные данные)
- ✅ Обновление полей формы через `updateFormField`
- ✅ Реактивное обновление UI при изменении store
- ✅ Валидация формы
- ✅ Отправка формы через `submitServiceForm`
- ✅ Сброс формы после успешной отправки
- ✅ Индикация загрузки (`isSubmitting`)
- ✅ Сборка проекта успешна

## Файлы изменены

1. **src/stores/ServicesStore.ts** - добавлено состояние формы и 7 новых методов управления
2. **src/mobile-components/MobileServiceModal/MobileServiceModal.tsx** - полностью рефакторен для использования store
   - Удалены все useState
   - Удалены handleChange, validate
   - Упрощен handleSubmit
   - Прямое использование servicesStore.formData и servicesStore.formErrors

## Дальнейшие улучшения

1. Добавить автосохранение черновиков в localStorage
2. Реализовать undo/redo для изменений формы
3. Добавить unit-тесты для методов store
4. Перевести десктопную версию на ту же архитектуру
5. Добавить TypeScript strict mode проверки
6. Реализовать оптимистичные обновления UI
