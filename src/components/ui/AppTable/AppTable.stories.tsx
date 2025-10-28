import type { Meta, StoryObj } from '@storybook/react';
import { AppTable } from './AppTable';
import { EditIcon, DeleteIcon } from './icons';
import { ActionButtons, ActionButton } from './AppTableActions';

const meta: Meta<typeof AppTable> = {
  title: 'UI/AppTable',
  component: AppTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof AppTable>;

// Типы для данных сервисов
interface Service {
  id: number;
  name: string;
  description: string;
  time: string;
  sedan: string;
  crossover: string;
  suv: string;
  minivan: string;
}

// Sample data - мойки из макета
const services: Service[] = [
  {
    id: 1,
    name: 'Эконом мойка',
    description: 'Быстрая мойка кузова и стекол',
    time: '40 мин',
    sedan: '600₽',
    crossover: '700₽',
    suv: '800₽',
    minivan: '900₽',
  },
  {
    id: 2,
    name: 'Стандартная мойка',
    description: 'Кузов, стекла, коврики',
    time: '60 мин',
    sedan: '600₽',
    crossover: '700₽',
    suv: '800₽',
    minivan: '900₽',
  },
  {
    id: 3,
    name: 'Комплекс',
    description: 'Мойка кузова, салона, стекол',
    time: '30 мин',
    sedan: '600₽',
    crossover: '700₽',
    suv: '800₽',
    minivan: '900₽',
  },
  {
    id: 4,
    name: 'Мойка премиум',
    description: 'Полная мойка и уход за кузовом',
    time: '40 мин',
    sedan: '600₽',
    crossover: '700₽',
    suv: '800₽',
    minivan: '900₽',
  },
];

/**
 * Основной пример таблицы услуг из макета Figma.
 * Показывает типичное использование с данными сервисов автомойки.
 */
export const ServicesTable: Story = {
  args: {
    columns: [
      {
        label: 'Название',
        field: 'name',
        width: 155,
        variant: 'primary',
      },
      {
        label: 'Описание',
        field: 'description',
        width: 265,
        variant: 'secondary',
      },
      {
        label: 'Время',
        field: 'time',
        width: 90,
        variant: 'secondary',
      },
      {
        label: 'Легковой',
        field: 'sedan',
        width: 110,
        variant: 'primary',
      },
      {
        label: 'Кросовер',
        field: 'crossover',
        width: 110,
        variant: 'primary',
      },
      {
        label: 'Внедорожник',
        field: 'suv',
        width: 110,
        variant: 'primary',
      },
      {
        label: 'Минивен',
        field: 'minivan',
        width: 110,
        variant: 'primary',
      },
      {
        label: '',
        render: () => (
          <ActionButtons>
            <ActionButton type="button" aria-label="Редактировать">
              <EditIcon />
            </ActionButton>
            <ActionButton type="button" aria-label="Удалить">
              <DeleteIcon />
            </ActionButton>
          </ActionButtons>
        ),
      },
    ],
    rows: services as unknown as Record<string, unknown>[],
    getRowKey: (row) => (row as unknown as Service).id,
  },
};

/**
 * Пример пустой таблицы с placeholder.
 */
export const Empty: Story = {
  args: {
    columns: [
      { label: 'Название', field: 'name' },
      { label: 'Описание', field: 'description' },
    ],
    rows: [],
    emptyPlaceholder: 'Нет данных',
  },
};

/**
 * Пример таблицы с кликабельными строками.
 */
export const Clickable: Story = {
  args: {
    columns: [
      { label: 'Название', field: 'name', variant: 'primary' },
      { label: 'Описание', field: 'description', variant: 'secondary' },
      { label: 'Время', field: 'time', variant: 'secondary' },
    ],
    rows: services.slice(0, 3) as unknown as Record<string, unknown>[],
    onRowClick: (row) => {
      alert(`Clicked: ${(row as unknown as Service).name}`);
    },
    getRowKey: (row) => (row as unknown as Service).id,
  },
};

/**
 * Пример с кастомными ширинами колонок.
 */
export const CustomWidth: Story = {
  args: {
    columns: [
      { label: 'ID', field: 'id', width: 60, variant: 'primary' },
      { label: 'Название', field: 'name', width: 200, variant: 'primary' },
      { label: 'Описание', field: 'description', variant: 'secondary' },
    ],
    rows: services as unknown as Record<string, unknown>[],
    getRowKey: (row) => (row as unknown as Service).id,
  },
};

/**
 * Пример с выравниванием колонок.
 */
export const WithAlignment: Story = {
  args: {
    columns: [
      { label: 'Название', field: 'name', align: 'left', variant: 'primary' },
      { label: 'Время', field: 'time', align: 'center', variant: 'secondary' },
      { label: 'Цена', field: 'sedan', align: 'right', variant: 'primary' },
    ],
    rows: services as unknown as Record<string, unknown>[],
    getRowKey: (row) => (row as unknown as Service).id,
  },
};

/**
 * Минималистичная таблица с минимальным набором колонок.
 */
export const Minimal: Story = {
  args: {
    columns: [
      { label: 'Название', field: 'name', variant: 'primary' },
      { label: 'Цена', field: 'sedan', variant: 'primary' },
    ],
    rows: services as unknown as Record<string, unknown>[],
    getRowKey: (row) => (row as unknown as Service).id,
  },
};
