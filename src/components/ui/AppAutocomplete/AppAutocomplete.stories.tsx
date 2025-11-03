import type { Meta, StoryObj } from '@storybook/react';
import { AppAutocomplete } from './AppAutocomplete';
import { useState } from 'react';
import type { SelectOption } from './AppAutocomplete.types';

const meta: Meta<typeof AppAutocomplete> = {
  title: 'UI/AppAutocomplete',
  component: AppAutocomplete,
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Значение компонента - может быть строкой или SelectOption',
      control: { type: 'text' },
    },
    label: {
      description: 'Label над полем',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Отключение компонента',
      control: { type: 'boolean' },
    },
    error: {
      description: 'Сообщение об ошибке',
      control: { type: 'text' },
    },
    required: {
      description: 'Обязательное поле',
      control: { type: 'boolean' },
    },
    placeholder: {
      description: 'Плейсхолдер',
      control: { type: 'text' },
    },
    options: {
      description: 'Список опций для синхронной фильтрации',
      control: { type: 'object' },
    },
    minSearchLength: {
      description: 'Минимальная длина запроса для асинхронного поиска',
      control: { type: 'number' },
    },
    searchDebounce: {
      description: 'Задержка debounce в миллисекундах',
      control: { type: 'number' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppAutocomplete>;

const cityOptions: SelectOption[] = [
  { label: 'Москва', value: 'moscow' },
  { label: 'Санкт-Петербург', value: 'spb' },
  { label: 'Новосибирск', value: 'nsk' },
  { label: 'Екатеринбург', value: 'ekb' },
  { label: 'Казань', value: 'kazan' },
  { label: 'Нижний Новгород', value: 'nn' },
  { label: 'Челябинск', value: 'chel' },
  { label: 'Самара', value: 'samara' },
  { label: 'Омск', value: 'omsk' },
  { label: 'Ростов-на-Дону', value: 'rostov' },
  { label: 'Уфа', value: 'ufa' },
  { label: 'Красноярск', value: 'krasnoyarsk' },
  { label: 'Воронеж', value: 'voronezh' },
  { label: 'Пермь', value: 'perm' },
  { label: 'Волгоград', value: 'volgograd' },
];

/**
 * Базовый пример с локальными опциями
 */
export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);
    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Город"
          options={cityOptions}
          value={value}
          onChange={setValue}
          placeholder="Начните вводить название города..."
        />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Текущее значение:</strong>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

/**
 * С начальным значением
 */
export const WithValue: Story = {
  render: function WithValueStory() {
    const [value, setValue] = useState<SelectOption | undefined>(cityOptions[0]);
    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Город"
          options={cityOptions}
          value={value}
          onChange={setValue}
          placeholder="Начните вводить..."
        />
      </div>
    );
  },
};

/**
 * Обязательное поле
 */
export const Required: Story = {
  render: function RequiredStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);
    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Город"
          options={cityOptions}
          value={value}
          onChange={setValue}
          required
          placeholder="Выберите город"
        />
      </div>
    );
  },
};

/**
 * С ошибкой
 */
export const WithError: Story = {
  render: function WithErrorStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);
    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Город"
          options={cityOptions}
          value={value}
          onChange={setValue}
          error="Пожалуйста, выберите город из списка"
          placeholder="Выберите город"
        />
      </div>
    );
  },
};

/**
 * Отключенное состояние
 */
export const Disabled: Story = {
  render: function DisabledStory() {
    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Город"
          options={cityOptions}
          value={cityOptions[0]}
          disabled
        />
      </div>
    );
  },
};

/**
 * Асинхронный поиск
 */
export const AsyncSearch: Story = {
  render: function AsyncSearchStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);

    // Имитация асинхронного поиска
    const handleSearch = async (query: string): Promise<SelectOption[]> => {
      // Симулируем задержку сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Фильтруем города по запросу
      return cityOptions.filter(city =>
        city.label.toLowerCase().includes(query.toLowerCase())
      );
    };

    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Поиск города"
          onSearch={handleSearch}
          value={value}
          onChange={setValue}
          placeholder="Введите минимум 2 символа..."
          minSearchLength={2}
          searchDebounce={300}
        />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Выбранное значение:</strong>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

/**
 * Кастомный рендер опций
 */
export const CustomOptionRender: Story = {
  render: function CustomOptionRenderStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);

    const options: SelectOption[] = [
      { label: 'React', value: 'react' },
      { label: 'Vue', value: 'vue' },
      { label: 'Angular', value: 'angular' },
      { label: 'Svelte', value: 'svelte' },
    ];

    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Выберите фреймворк"
          options={options}
          value={value}
          onChange={setValue}
          placeholder="Начните вводить..."
          renderOption={(option) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚛️</span>
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>
    );
  },
};

/**
 * Кастомная фильтрация
 */
export const CustomFilter: Story = {
  render: function CustomFilterStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);

    // Фильтрация только по началу строки
    const customFilter = (option: SelectOption, query: string) => {
      return option.label.toLowerCase().startsWith(query.toLowerCase());
    };

    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Город (фильтр по началу)"
          options={cityOptions}
          value={value}
          onChange={setValue}
          filterOption={customFilter}
          placeholder="Введите первые буквы..."
        />
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Фильтрация работает только по началу названия города
        </div>
      </div>
    );
  },
};

/**
 * Произвольный ввод
 */
export const CustomInput: Story = {
  render: function CustomInputStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);

    return (
      <div style={{ maxWidth: '400px' }}>
        <AppAutocomplete
          label="Город или произвольное значение"
          options={cityOptions}
          value={value}
          onChange={setValue}
          placeholder="Выберите из списка или введите свой город..."
        />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Значение:</strong>
          <pre>{JSON.stringify(value, null, 2)}</pre>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            {value?.isCustom ? '✏️ Произвольное значение' : '✓ Выбрано из списка'}
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Интерактивный пример
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [value, setValue] = useState<SelectOption | undefined>(undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
        <AppAutocomplete
          label="Выберите город"
          options={cityOptions}
          value={value}
          onChange={setValue}
          placeholder="Начните вводить или выберите из списка..."
        />
        
        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>Возможности:</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Введите текст для фильтрации</li>
            <li>Выберите из списка или введите произвольное значение</li>
            <li>Используйте ↑↓ для навигации</li>
            <li>Enter для выбора</li>
            <li>Esc для закрытия</li>
            <li>Tab сохраняет текущее значение</li>
          </ul>
        </div>

        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Текущее значение:</strong>
          <pre style={{ marginTop: '8px' }}>{JSON.stringify(value, null, 2)}</pre>
          {value && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              {value.isCustom 
                ? '✏️ Произвольное значение (isCustom: true, value: null)' 
                : `✓ Выбрано из списка (value: ${value.value})`}
            </div>
          )}
        </div>
      </div>
    );
  },
};
