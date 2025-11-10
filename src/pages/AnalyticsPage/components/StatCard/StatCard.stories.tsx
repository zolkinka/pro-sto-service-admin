import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './';

// Простая иконка для примеров
const SampleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#4169E3" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#0AB878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 6H23V12" stroke="#0AB878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#4169E3" strokeWidth="2" />
    <path d="M12 6V18M15 9C15 7.89543 13.6569 7 12 7C10.3431 7 9 7.89543 9 9C9 10.1046 10.3431 11 12 11C13.6569 11 15 11.8954 15 13C15 14.1046 13.6569 15 12 15C10.3431 15 9 14.1046 9 13" stroke="#4169E3" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof StatCard> = {
  title: 'Pages/AnalyticsPage/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Карточка статистики для отображения ключевых показателей.

## Особенности
- Заголовок, значение и процент изменения
- Иконка в белом контейнере (40x40px)
- Фон #F9F8F5, border-radius 16px
- Зелёный цвет (#0AB878) для положительных изменений
- Красный цвет (#D8182E) для отрицательных изменений
- Состояние загрузки (Skeleton)
- Полностью адаптивная верстка
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Заголовок карточки',
    },
    value: {
      control: 'text',
      description: 'Числовое значение или текст',
    },
    change: {
      control: 'number',
      description: 'Процент изменения (может быть положительным или отрицательным)',
    },
    icon: {
      control: false,
      description: 'React элемент иконки',
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
 * Карточка с положительным изменением
 */
export const Positive: Story = {
  args: {
    title: 'Общая выручка',
    value: '₽125,000',
    change: 12.5,
    icon: <MoneyIcon />,
  },
};

/**
 * Карточка с отрицательным изменением
 */
export const Negative: Story = {
  args: {
    title: 'Количество записей',
    value: '48',
    change: -8.3,
    icon: <TrendUpIcon />,
  },
};

/**
 * Карточка без изменения
 */
export const NoChange: Story = {
  args: {
    title: 'Средний чек',
    value: '₽2,600',
    icon: <SampleIcon />,
  },
};

/**
 * Состояние загрузки (Skeleton)
 */
export const Loading: Story = {
  args: {
    title: 'Загрузка',
    value: '0',
    icon: <SampleIcon />,
    loading: true,
  },
};

/**
 * Большое значение
 */
export const LargeValue: Story = {
  args: {
    title: 'Общий доход за год',
    value: '₽1,234,567',
    change: 45.2,
    icon: <MoneyIcon />,
  },
};

/**
 * Нулевое изменение
 */
export const ZeroChange: Story = {
  args: {
    title: 'Новые клиенты',
    value: '23',
    change: 0,
    icon: <SampleIcon />,
  },
};

// ========== Все состояния ==========

/**
 * Матрица всех состояний компонента
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', maxWidth: '1000px' }}>
      <StatCard
        title="Положительное изменение"
        value="₽125,000"
        change={12.5}
        icon={<MoneyIcon />}
      />
      
      <StatCard
        title="Отрицательное изменение"
        value="48"
        change={-8.3}
        icon={<TrendUpIcon />}
      />
      
      <StatCard
        title="Без изменения"
        value="₽2,600"
        icon={<SampleIcon />}
      />
      
      <StatCard
        title="Загрузка..."
        value="0"
        icon={<SampleIcon />}
        loading
      />
    </div>
  ),
};

// ========== Примеры использования ==========

/**
 * Пример реальных данных для дашборда
 */
export const DashboardExample: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '20px',
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
    }}>
      <StatCard
        title="Общая выручка"
        value="₽125,000"
        change={12.5}
        icon={<MoneyIcon />}
      />
      
      <StatCard
        title="Записей"
        value="156"
        change={8.2}
        icon={<TrendUpIcon />}
      />
      
      <StatCard
        title="Средний чек"
        value="₽2,800"
        change={-3.1}
        icon={<SampleIcon />}
      />
      
      <StatCard
        title="Новых клиентов"
        value="42"
        change={15.7}
        icon={<SampleIcon />}
      />
    </div>
  ),
};

/**
 * Адаптивная сетка на мобильных устройствах
 */
export const MobileView: Story = {
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '375px',
      padding: '16px',
    }}>
      <StatCard
        title="Общая выручка"
        value="₽125,000"
        change={12.5}
        icon={<MoneyIcon />}
      />
      
      <StatCard
        title="Записей"
        value="156"
        change={8.2}
        icon={<TrendUpIcon />}
      />
      
      <StatCard
        title="Средний чек"
        value="₽2,800"
        icon={<SampleIcon />}
      />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Интерактивный playground
 */
export const Interactive: Story = {
  args: {
    title: 'Редактируемая карточка',
    value: '₽50,000',
    change: 5.5,
    icon: <SampleIcon />,
    loading: false,
  },
};
