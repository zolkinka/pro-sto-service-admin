import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PeriodSelector } from './';
import type { Period } from './PeriodSelector.types';

const meta: Meta<typeof PeriodSelector> = {
  title: 'Pages/AnalyticsPage/PeriodSelector',
  component: PeriodSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Компонент переключателя периода для аналитики.

## Особенности
- Переключение между "День" и "Неделя"
- Серый фон (#F9F8F5), активная кнопка белая с тенью
- Поддержка состояния disabled
- Клавиатурная навигация (Enter, Space)
- Accessibility (ARIA атрибуты, aria-pressed)
- CSS module стили
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'select',
      options: ['day', 'week'],
      description: 'Текущий выбранный период',
    },
    onChange: {
      action: 'changed',
      description: 'Обработчик изменения периода',
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
 * Период "День" выбран
 */
export const DaySelected: Story = {
  args: {
    value: 'day',
  },
};

/**
 * Период "Неделя" выбран
 */
export const WeekSelected: Story = {
  args: {
    value: 'week',
  },
};

/**
 * Отключенное состояние (День)
 */
export const DisabledDay: Story = {
  args: {
    value: 'day',
    disabled: true,
  },
};

/**
 * Отключенное состояние (Неделя)
 */
export const DisabledWeek: Story = {
  args: {
    value: 'week',
    disabled: true,
  },
};

// ========== Controlled компонент ==========

/**
 * Контроллируемый компонент с интерактивным состоянием
 */
const ControlledExample = () => {
  const [period, setPeriod] = useState<Period>('day');
  
  return (
    <div>
      <PeriodSelector value={period} onChange={setPeriod} />
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Выбран период: <strong>{period === 'day' ? 'День' : 'Неделя'}</strong>
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
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
          День выбран
        </div>
        <PeriodSelector value="day" onChange={() => {}} />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Неделя выбрана
        </div>
        <PeriodSelector value="week" onChange={() => {}} />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Disabled (День)
        </div>
        <PeriodSelector value="day" onChange={() => {}} disabled />
      </div>
      
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Disabled (Неделя)
        </div>
        <PeriodSelector value="week" onChange={() => {}} disabled />
      </div>
    </div>
  ),
};

// ========== Интеграция с другими компонентами ==========

const InContextExample = () => {
  const [period, setPeriod] = useState<Period>('day');
  
  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          Аналитика
        </h2>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>
      
      <div style={{ 
        padding: '32px',
        backgroundColor: '#F9F8F5',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666'
      }}>
        Графики и статистика за {period === 'day' ? 'день' : 'неделю'}
      </div>
    </div>
  );
};

/**
 * Пример использования в контексте аналитики
 */
export const InContext: Story = {
  render: () => <InContextExample />,
};

// ========== Интерактивный playground ==========

/**
 * Интерактивный playground для тестирования
 */
export const Interactive: Story = {
  args: {
    value: 'day',
    disabled: false,
  },
};
