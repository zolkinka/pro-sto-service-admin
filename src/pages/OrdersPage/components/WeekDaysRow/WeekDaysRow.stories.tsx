import type { Meta, StoryObj } from '@storybook/react';
import { WeekDaysRow } from './WeekDaysRow';

const meta: Meta<typeof WeekDaysRow> = {
  title: 'Pages/Orders/WeekDaysRow',
  component: WeekDaysRow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    startDate: {
      control: 'date',
      description: 'Первый день недели для отображения',
    },
    currentDate: {
      control: 'date',
      description: 'Текущий день (будет выделен)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WeekDaysRow>;

// Вспомогательная функция для создания даты
const createDate = (year: number, month: number, day: number) => {
  return new Date(year, month, day);
};

// История с текущей датой в середине недели
export const Default: Story = {
  args: {
    startDate: createDate(2025, 9, 20), // 20 октября 2025 (понедельник)
    currentDate: createDate(2025, 9, 23), // 23 октября 2025 (четверг)
  },
};

// История с текущей датой в начале недели
export const CurrentDayAtStart: Story = {
  args: {
    startDate: createDate(2025, 9, 20), // 20 октября 2025
    currentDate: createDate(2025, 9, 20), // 20 октября 2025 (понедельник)
  },
};

// История с текущей датой в конце недели
export const CurrentDayAtEnd: Story = {
  args: {
    startDate: createDate(2025, 9, 20), // 20 октября 2025
    currentDate: createDate(2025, 9, 26), // 26 октября 2025 (воскресенье)
  },
};

// История с текущей реальной датой
export const Today: Story = {
  args: {
    startDate: (() => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      return monday;
    })(),
    currentDate: new Date(),
  },
};

// История с переходом через месяц
export const CrossMonth: Story = {
  args: {
    startDate: createDate(2025, 9, 27), // 27 октября 2025 (понедельник)
    currentDate: createDate(2025, 9, 30), // 30 октября 2025 (четверг)
  },
};

// Интерактивная история для тестирования
export const Interactive: Story = {
  args: {
    startDate: createDate(2025, 9, 20),
    currentDate: createDate(2025, 9, 23),
  },
  parameters: {
    docs: {
      description: {
        story: 'Интерактивная версия компонента для тестирования различных дат',
      },
    },
  },
};
