import type { Meta, StoryObj } from '@storybook/react';
import { LoadChart } from './';
import type { ChartDataPoint } from './LoadChart.types';

// Тестовые данные для дней недели
const weekDaysData: ChartDataPoint[] = [
  { label: 'Пн', value: 25 },
  { label: 'Вт', value: 38 },
  { label: 'Ср', value: 42 },
  { label: 'Чт', value: 35 },
  { label: 'Пт', value: 48 },
  { label: 'Сб', value: 32 },
  { label: 'Вс', value: 18 },
];

// Тестовые данные для часов (выборка)
const hoursData: ChartDataPoint[] = [
  { label: '0', value: 2 },
  { label: '3', value: 1 },
  { label: '6', value: 3 },
  { label: '9', value: 15 },
  { label: '12', value: 28 },
  { label: '15', value: 35 },
  { label: '18', value: 42 },
  { label: '21', value: 22 },
];

// Полный день (24 часа)
const fullDayData: ChartDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
  label: i.toString(),
  value: Math.floor(Math.random() * 50),
}));

// Низкая загрузка
const lowLoadData: ChartDataPoint[] = [
  { label: 'Пн', value: 5 },
  { label: 'Вт', value: 8 },
  { label: 'Ср', value: 6 },
  { label: 'Чт', value: 7 },
  { label: 'Пт', value: 10 },
  { label: 'Сб', value: 4 },
  { label: 'Вс', value: 3 },
];

// Высокая загрузка
const highLoadData: ChartDataPoint[] = [
  { label: 'Пн', value: 45 },
  { label: 'Вт', value: 48 },
  { label: 'Ср', value: 50 },
  { label: 'Чт', value: 47 },
  { label: 'Пт', value: 50 },
  { label: 'Сб', value: 42 },
  { label: 'Вс', value: 38 },
];

const meta: Meta<typeof LoadChart> = {
  title: 'Pages/AnalyticsPage/LoadChart',
  component: LoadChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Столбчатый график загрузки для аналитики.

## Особенности
- Y-ось с автоматическими значениями (0-50 по умолчанию)
- X-ось для дней недели (Пн-Вс) или часов (0-23)
- Столбцы: цвет #8C9DEF, border-radius 8px сверху, ширина 35px
- Высота графика: 309px
- Анимация появления столбцов с задержкой
- Hover эффект с отображением значения
- Состояние загрузки (Skeleton)
- Пустое состояние
- Полностью адаптивная верстка
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Массив данных для отображения на графике',
    },
    maxCount: {
      control: 'number',
      description: 'Максимальное значение для шкалы Y (автоматически вычисляется если не указано)',
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
 * График по дням недели
 */
export const WeekDays: Story = {
  args: {
    data: weekDaysData,
    loading: false,
  },
};

/**
 * График по часам
 */
export const HourlyData: Story = {
  args: {
    data: hoursData,
    loading: false,
  },
};

/**
 * Полный день (24 часа)
 */
export const FullDay: Story = {
  args: {
    data: fullDayData,
    maxCount: 50,
    loading: false,
  },
};

/**
 * Низкая загрузка
 */
export const LowLoad: Story = {
  args: {
    data: lowLoadData,
    loading: false,
  },
};

/**
 * Высокая загрузка
 */
export const HighLoad: Story = {
  args: {
    data: highLoadData,
    maxCount: 50,
    loading: false,
  },
};

/**
 * Состояние загрузки (Skeleton)
 */
export const Loading: Story = {
  args: {
    data: [],
    loading: true,
  },
};

/**
 * Пустое состояние
 */
export const Empty: Story = {
  args: {
    data: [],
    loading: false,
  },
};

/**
 * Кастомный максимум для Y-оси
 */
export const CustomMaxCount: Story = {
  args: {
    data: weekDaysData,
    maxCount: 100,
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
          Дни недели
        </h3>
        <LoadChart data={weekDaysData} />
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Часы
        </h3>
        <LoadChart data={hoursData} />
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Загрузка
        </h3>
        <LoadChart data={[]} loading />
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          Пустое состояние
        </h3>
        <LoadChart data={[]} />
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
      maxWidth: '900px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: 600,
          color: '#302F2D'
        }}>
          Загруженность
        </h2>
        <div style={{
          fontSize: '14px',
          color: '#888684',
        }}>
          По дням недели
        </div>
      </div>
      <LoadChart data={weekDaysData} />
    </div>
  ),
};

/**
 * Сравнение разных периодов
 */
export const Comparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          Низкая загрузка
        </h3>
        <LoadChart data={lowLoadData} />
      </div>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
          Высокая загрузка
        </h3>
        <LoadChart data={highLoadData} />
      </div>
    </div>
  ),
};

/**
 * Адаптивность на мобильных устройствах
 */
export const MobileView: Story = {
  render: () => (
    <div style={{ maxWidth: '375px' }}>
      <LoadChart data={weekDaysData} />
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
      <LoadChart data={weekDaysData} />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Интерактивный playground
 */
export const Interactive: Story = {
  args: {
    data: weekDaysData,
    maxCount: 50,
    loading: false,
  },
};
