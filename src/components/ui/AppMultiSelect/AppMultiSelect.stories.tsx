import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AppMultiSelect } from './AppMultiSelect';
import type { SelectOption } from './AppMultiSelect.types';

const meta: Meta<typeof AppMultiSelect> = {
  title: 'UI/AppMultiSelect',
  component: AppMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label над полем',
    },
    placeholder: {
      control: 'text',
      description: 'Плейсхолдер',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Плейсхолдер для поля поиска',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключение компонента',
    },
    required: {
      control: 'boolean',
      description: 'Обязательное поле',
    },
    clearable: {
      control: 'boolean',
      description: 'Показывать кнопку очистки всех значений',
    },
    error: {
      control: 'text',
      description: 'Сообщение об ошибке',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppMultiSelect>;

const cities: SelectOption[] = [
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

const services: SelectOption[] = [
  { label: 'Замена масла', value: 1 },
  { label: 'Шиномонтаж', value: 2 },
  { label: 'Диагностика', value: 3 },
  { label: 'Ремонт двигателя', value: 4 },
  { label: 'Мойка', value: 5 },
];

/**
 * Базовый пример компонента
 */
export const Default: Story = {
  args: {
    label: 'Выберите города',
    options: cities,
    placeholder: 'Выберите...',
  },
};

/**
 * Компонент с выбранными значениями
 */
export const WithValues: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>([cities[0], cities[2], cities[4]]);
    return (
      <AppMultiSelect
        label="Выбранные города"
        options={cities}
        value={value}
        onChange={setValue}
        placeholder="Выберите города..."
      />
    );
  },
};

/**
 * Компонент с кнопкой очистки
 */
export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>([cities[0], cities[1]]);
    return (
      <AppMultiSelect
        label="Города с очисткой"
        options={cities}
        value={value}
        onChange={setValue}
        clearable
        placeholder="Выберите города..."
      />
    );
  },
};

/**
 * Обязательное поле
 */
export const Required: Story = {
  args: {
    label: 'Обязательное поле',
    options: cities,
    required: true,
    placeholder: 'Выберите города...',
  },
};

/**
 * Компонент с ошибкой
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>([]);
    return (
      <AppMultiSelect
        label="Города"
        options={cities}
        value={value}
        onChange={setValue}
        error="Выберите хотя бы один город"
        placeholder="Выберите города..."
      />
    );
  },
};

/**
 * Отключенный компонент
 */
export const Disabled: Story = {
  args: {
    label: 'Отключенное поле',
    options: cities,
    value: [cities[0], cities[2]],
    disabled: true,
    placeholder: 'Выберите города...',
  },
};

/**
 * Длинный список с поиском (>10 элементов)
 */
export const LongList: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>([]);
    return (
      <AppMultiSelect
        label="Все города России"
        options={cities}
        value={value}
        onChange={setValue}
        searchPlaceholder="Найти город..."
        placeholder="Выберите города..."
      />
    );
  },
};

/**
 * Короткий список (без поиска)
 */
export const ShortList: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>([]);
    return (
      <AppMultiSelect
        label="Выберите услуги"
        options={services}
        value={value}
        onChange={setValue}
        placeholder="Выберите услуги..."
      />
    );
  },
};

/**
 * Все выбранные значения
 */
export const AllSelected: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>(services);
    return (
      <AppMultiSelect
        label="Все услуги выбраны"
        options={services}
        value={value}
        onChange={setValue}
        clearable
        placeholder="Выберите услуги..."
      />
    );
  },
};

/**
 * С кастомным плейсхолдером поиска
 */
export const CustomSearchPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>([]);
    return (
      <AppMultiSelect
        label="Города с кастомным поиском"
        options={cities}
        value={value}
        onChange={setValue}
        searchPlaceholder="Введите название города..."
        placeholder="Выберите города..."
      />
    );
  },
};

/**
 * Интерактивный пример
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<SelectOption[]>([]);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AppMultiSelect
          label="Выберите города"
          options={cities}
          value={value}
          onChange={setValue}
          clearable
          required
          placeholder="Выберите города..."
          searchPlaceholder="Поиск городов..."
        />
        <div>
          <strong>Выбрано:</strong> {value.length === 0 ? 'ничего' : `${value.length} ${value.length === 1 ? 'город' : value.length < 5 ? 'города' : 'городов'} - ${value.map(v => v.label).join(', ')}`}
        </div>
      </div>
    );
  },
};
