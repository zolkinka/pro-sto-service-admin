import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateNavigation } from './';
import type { Period } from '../PeriodSelector/PeriodSelector.types';

const meta: Meta<typeof DateNavigation> = {
  title: 'Pages/AnalyticsPage/DateNavigation',
  component: DateNavigation,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Компонент навигации по датам для аналитики.

## Особенности
- Кнопки навигации (стрелки влево/вправо)
- Отображение текущей даты
- Форматирование зависит от периода:
  - День: "25 октября"
  - Неделя: "20-26 октября" или "28 октября - 3 ноября"
- Поддержка состояния disabled
- Клавиатурная навигация (Enter, Space)
- Accessibility (ARIA атрибуты, aria-live)
- CSS module стили
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    date: {
      control: 'date',
      description: 'Текущая дата',
    },
    period: {
      control: 'select',
      options: ['day', 'week'],
      description: 'Период отображения',
    },
    onPrevious: {
      action: 'previous',
      description: 'Обработчик перехода к предыдущему периоду',
    },
    onNext: {
      action: 'next',
      description: 'Обработчик перехода к следующему периоду',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключен ли компонент',
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
 * Режим "День"
 */
export const Day: Story = {
  args: {
    date: new Date(2024, 9, 25), // 25 октября 2024
    period: 'day',
  },
};

/**
 * Режим "Неделя" (один месяц)
 */
export const WeekSameMonth: Story = {
  args: {
    date: new Date(2024, 9, 23), // неделя 21-27 октября 2024
    period: 'week',
  },
};

/**
 * Режим "Неделя" (два месяца)
 */
export const WeekDifferentMonths: Story = {
  args: {
    date: new Date(2024, 9, 30), // неделя 28 октября - 3 ноября 2024
    period: 'week',
  },
};

/**
 * Отключенное состояние
 */
export const Disabled: Story = {
  args: {
    date: new Date(2024, 9, 25),
    period: 'day',
    disabled: true,
  },
};

// ========== Controlled компонент ==========

/**
 * Контроллируемый компонент с навигацией по дням
 */
const ControlledDayExample = () => {
  const [date, setDate] = useState(new Date(2024, 9, 25));
  
  const handlePrevious = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  };
  
  return (
    <div>
      <DateNavigation 
        date={date} 
        period="day" 
        onPrevious={handlePrevious} 
        onNext={handleNext} 
      />
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Полная дата: {date.toLocaleDateString('ru-RU')}
      </div>
    </div>
  );
};

export const ControlledDay: Story = {
  render: () => <ControlledDayExample />,
};

/**
 * Контроллируемый компонент с навигацией по неделям
 */
const ControlledWeekExample = () => {
  const [date, setDate] = useState(new Date(2024, 9, 25));
  
  const handlePrevious = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 7);
    setDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 7);
    setDate(newDate);
  };
  
  return (
    <div>
      <DateNavigation 
        date={date} 
        period="week" 
        onPrevious={handlePrevious} 
        onNext={handleNext} 
      />
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
        Полная дата: {date.toLocaleDateString('ru-RU')}
      </div>
    </div>
  );
};

export const ControlledWeek: Story = {
  render: () => <ControlledWeekExample />,
};

// ========== Все состояния ==========

/**
 * Матрица всех состояний компонента
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          День
        </div>
        <DateNavigation 
          date={new Date(2024, 9, 25)} 
          period="day" 
          onPrevious={() => {}} 
          onNext={() => {}} 
        />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Неделя (один месяц)
        </div>
        <DateNavigation 
          date={new Date(2024, 9, 23)} 
          period="week" 
          onPrevious={() => {}} 
          onNext={() => {}} 
        />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Неделя (два месяца)
        </div>
        <DateNavigation 
          date={new Date(2024, 9, 30)} 
          period="week" 
          onPrevious={() => {}} 
          onNext={() => {}} 
        />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Disabled
        </div>
        <DateNavigation 
          date={new Date(2024, 9, 25)} 
          period="day" 
          onPrevious={() => {}} 
          onNext={() => {}} 
          disabled 
        />
      </div>
    </div>
  ),
};

// ========== Интеграция с другими компонентами ==========

const IntegratedExample = () => {
  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(new Date(2024, 9, 25));
  
  const handlePrevious = () => {
    const newDate = new Date(date);
    if (period === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(date);
    if (period === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setDate(newDate);
  };
  
  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      minWidth: '400px',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px',
      }}>
        <div style={{ 
          display: 'inline-flex',
          background: '#F9F8F5',
          borderRadius: '8px',
          padding: '4px',
          gap: '4px',
        }}>
          <button
            style={{
              padding: '8px 16px',
              border: 'none',
              background: period === 'day' ? '#FFFFFF' : 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              boxShadow: period === 'day' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
            onClick={() => setPeriod('day')}
          >
            День
          </button>
          <button
            style={{
              padding: '8px 16px',
              border: 'none',
              background: period === 'week' ? '#FFFFFF' : 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              boxShadow: period === 'week' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
            onClick={() => setPeriod('week')}
          >
            Неделя
          </button>
        </div>
        
        <DateNavigation 
          date={date} 
          period={period} 
          onPrevious={handlePrevious} 
          onNext={handleNext} 
        />
      </div>
      
      <div style={{ 
        padding: '32px',
        backgroundColor: '#F9F8F5',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666'
      }}>
        Данные за выбранный период
      </div>
    </div>
  );
};

/**
 * Пример интеграции с PeriodSelector
 */
export const IntegratedWithPeriodSelector: Story = {
  render: () => <IntegratedExample />,
};

// ========== Различные даты ==========

/**
 * Различные примеры дат в течение года
 */
export const DifferentDates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Начало года
        </div>
        <DateNavigation 
          date={new Date(2024, 0, 5)} 
          period="day" 
          onPrevious={() => {}} 
          onNext={() => {}} 
        />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Середина года
        </div>
        <DateNavigation 
          date={new Date(2024, 5, 15)} 
          period="day" 
          onPrevious={() => {}} 
          onNext={() => {}} 
        />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Конец года
        </div>
        <DateNavigation 
          date={new Date(2024, 11, 25)} 
          period="day" 
          onPrevious={() => {}} 
          onNext={() => {}} 
        />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Неделя на границе месяцев
        </div>
        <DateNavigation 
          date={new Date(2024, 6, 31)} 
          period="week" 
          onPrevious={() => {}} 
          onNext={() => {}} 
        />
      </div>
    </div>
  ),
};

// ========== Интерактивный playground ==========

/**
 * Интерактивный playground для тестирования
 */
export const Interactive: Story = {
  args: {
    date: new Date(2024, 9, 25),
    period: 'day',
    disabled: false,
  },
};
