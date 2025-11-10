import type { Meta, StoryObj } from '@storybook/react';
import { TopServicesTable } from './';
import type { ServiceData } from './TopServicesTable.types';

// Тестовые данные
const mockServices: ServiceData[] = [
  { id: '1', name: 'Диагностика двигателя', bookingsCount: 45, revenue: 67500 },
  { id: '2', name: 'Замена масла', bookingsCount: 38, revenue: 45600 },
  { id: '3', name: 'Шиномонтаж', bookingsCount: 32, revenue: 38400 },
  { id: '4', name: 'Развал-схождение', bookingsCount: 28, revenue: 42000 },
  { id: '5', name: 'Замена тормозных колодок', bookingsCount: 25, revenue: 37500 },
];

const fewServices: ServiceData[] = [
  { id: '1', name: 'Диагностика двигателя', bookingsCount: 45, revenue: 67500 },
  { id: '2', name: 'Замена масла', bookingsCount: 38, revenue: 45600 },
];

const largeRevenueServices: ServiceData[] = [
  { id: '1', name: 'Капитальный ремонт двигателя', bookingsCount: 5, revenue: 1250000 },
  { id: '2', name: 'Замена коробки передач', bookingsCount: 8, revenue: 980000 },
  { id: '3', name: 'Покраска кузова', bookingsCount: 12, revenue: 756000 },
];

const meta: Meta<typeof TopServicesTable> = {
  title: 'Pages/AnalyticsPage/TopServicesTable',
  component: TopServicesTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Таблица топ услуг с отображением количества записей и выручки.

## Особенности
- 3 колонки: Услуга, Кол-во записей, Выручка
- Заголовок с фоном #F9F8F5 и высотой 65px
- Выручка отображается зелёным цветом (#0AB878)
- Состояние загрузки (Skeleton)
- Пустое состояние (нет данных)
- Hover эффект на строках
- Полностью адаптивная верстка
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    services: {
      control: 'object',
      description: 'Массив данных услуг для отображения',
    },
    loading: {
      control: 'boolean',
      description: 'Состояние загрузки',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS класс',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ========== Основные варианты ==========

/**
 * Таблица с данными
 */
export const Default: Story = {
  args: {
    services: mockServices,
    loading: false,
  },
};

/**
 * Состояние загрузки (Skeleton)
 */
export const Loading: Story = {
  args: {
    services: [],
    loading: true,
  },
};

/**
 * Пустое состояние (нет данных)
 */
export const Empty: Story = {
  args: {
    services: [],
    loading: false,
  },
};

/**
 * Мало услуг (2 записи)
 */
export const FewServices: Story = {
  args: {
    services: fewServices,
    loading: false,
  },
};

/**
 * Большие суммы выручки
 */
export const LargeRevenue: Story = {
  args: {
    services: largeRevenueServices,
    loading: false,
  },
};

// ========== Все состояния ==========

/**
 * Матрица всех состояний компонента
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          С данными
        </h3>
        <TopServicesTable services={mockServices} />
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Загрузка
        </h3>
        <TopServicesTable services={[]} loading />
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Пустое состояние
        </h3>
        <TopServicesTable services={[]} />
      </div>
    </div>
  ),
};

// ========== Примеры использования ==========

/**
 * В контексте аналитической панели
 */
export const InContext: Story = {
  render: () => (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      maxWidth: '800px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '20px', 
        fontWeight: 600,
        color: '#302F2D'
      }}>
        Топ услуг
      </h2>
      <TopServicesTable services={mockServices} />
    </div>
  ),
};

/**
 * Адаптивность на мобильных устройствах
 */
export const MobileView: Story = {
  render: () => (
    <div style={{ maxWidth: '375px' }}>
      <TopServicesTable services={mockServices} />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Адаптивность на планшетах
 */
export const TabletView: Story = {
  render: () => (
    <div style={{ maxWidth: '768px' }}>
      <TopServicesTable services={mockServices} />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Длинные названия услуг
 */
export const LongServiceNames: Story = {
  args: {
    services: [
      { 
        id: '1', 
        name: 'Комплексная диагностика двигателя с проверкой всех систем', 
        bookingsCount: 45, 
        revenue: 67500 
      },
      { 
        id: '2', 
        name: 'Замена масла и масляного фильтра с промывкой системы', 
        bookingsCount: 38, 
        revenue: 45600 
      },
      { 
        id: '3', 
        name: 'Шиномонтаж с балансировкой четырех колес', 
        bookingsCount: 32, 
        revenue: 38400 
      },
    ],
  },
};

/**
 * Одна услуга
 */
export const SingleService: Story = {
  args: {
    services: [
      { id: '1', name: 'Диагностика двигателя', bookingsCount: 45, revenue: 67500 },
    ],
  },
};

/**
 * Интерактивный playground
 */
export const Interactive: Story = {
  args: {
    services: mockServices,
    loading: false,
  },
};
