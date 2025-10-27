import type { Meta, StoryObj } from '@storybook/react';
import { AppSingleSelect } from './AppSingleSelect';
import { useState } from 'react';
import type { SelectOption } from './AppSingleSelect.types';

const meta: Meta<typeof AppSingleSelect> = {
  title: 'UI/AppSingleSelect',
  component: AppSingleSelect,
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Выбранное значение',
      control: { type: 'object' },
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
    searchPlaceholder: {
      description: 'Плейсхолдер для поиска',
      control: { type: 'text' },
    },
    clearable: {
      description: 'Показывать кнопку очистки',
      control: { type: 'boolean' },
    },
    options: {
      description: 'Список опций',
      control: { type: 'object' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppSingleSelect>;

const options: SelectOption[] = [
  { label: 'Москва', value: 'moscow' },
  { label: 'Санкт-Петербург', value: 'spb' },
  { label: 'Новосибирск', value: 'nsk' },
  { label: 'Екатеринбург', value: 'ekb' },
  { label: 'Казань', value: 'kazan' },
];

/**
 * Базовый пример использования компонента
 */
export const Default: Story = {
  args: {
    label: 'Выберите город',
    options,
    placeholder: 'Выберите...',
  },
};

/**
 * Компонент с выбранным значением
 */
export const WithValue: Story = {
  render: function WithValueStory() {
    const [value, setValue] = useState<SelectOption | null>(options[0]);
    return (
      <AppSingleSelect
        label="Город"
        options={options}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/**
 * Компонент с кнопкой очистки
 */
export const Clearable: Story = {
  render: function ClearableStory() {
    const [value, setValue] = useState<SelectOption | null>(options[0]);
    return (
      <AppSingleSelect
        label="Город"
        options={options}
        value={value}
        onChange={setValue}
        clearable
      />
    );
  },
};

/**
 * Обязательное поле
 */
export const Required: Story = {
  args: {
    label: 'Город',
    options,
    required: true,
    placeholder: 'Выберите город',
  },
};

/**
 * С сообщением об ошибке
 */
export const WithError: Story = {
  args: {
    label: 'Город',
    options,
    error: 'Выберите город из списка',
    placeholder: 'Выберите...',
  },
};

/**
 * Отключенное состояние
 */
export const Disabled: Story = {
  args: {
    label: 'Город',
    options,
    value: options[0],
    disabled: true,
  },
};

/**
 * Длинный список с поиском (> 10 элементов)
 */
export const LongList: Story = {
  args: {
    label: 'Страна',
    options: Array.from({ length: 50 }, (_, i) => ({
      label: `Страна ${i + 1}`,
      value: `country-${i + 1}`,
    })),
    searchPlaceholder: 'Найти страну...',
    placeholder: 'Выберите страну',
  },
};

/**
 * Интерактивный пример для тестирования
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [value, setValue] = useState<SelectOption | null>(null);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AppSingleSelect
          label="Выберите город"
          options={options}
          value={value}
          onChange={setValue}
          clearable
          placeholder="Выберите город"
        />
        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Выбранное значение:</strong>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

/**
 * Пример с кастомным плейсхолдером для поиска
 */
export const CustomSearchPlaceholder: Story = {
  args: {
    label: 'Город доставки',
    options: Array.from({ length: 20 }, (_, i) => ({
      label: `Город ${i + 1}`,
      value: `city-${i + 1}`,
    })),
    searchPlaceholder: 'Введите название города...',
    placeholder: 'Выберите город доставки',
  },
};

/**
 * Несколько селектов на одной странице
 */
export const MultipleSelects: Story = {
  render: function MultipleSelectsStory() {
    const [city, setCity] = useState<SelectOption | null>(null);
    const [country, setCountry] = useState<SelectOption | null>(null);
    
    const countries: SelectOption[] = [
      { label: 'Россия', value: 'ru' },
      { label: 'Казахстан', value: 'kz' },
      { label: 'Беларусь', value: 'by' },
      { label: 'Украина', value: 'ua' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
        <AppSingleSelect
          label="Страна"
          options={countries}
          value={country}
          onChange={setCountry}
          required
          placeholder="Выберите страну"
        />
        <AppSingleSelect
          label="Город"
          options={options}
          value={city}
          onChange={setCity}
          clearable
          placeholder="Выберите город"
        />
      </div>
    );
  },
};
