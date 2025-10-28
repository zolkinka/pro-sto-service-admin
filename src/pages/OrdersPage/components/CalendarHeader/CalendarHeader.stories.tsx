import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';

const meta: Meta<typeof CalendarHeader> = {
  title: 'Pages/Orders/CalendarHeader',
  component: CalendarHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarHeader>;

// Wrapper component for interactive story
const CalendarHeaderWithState = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <CalendarHeaderWithState />,
};

export const WeekView: Story = {
  args: {
    currentDate: new Date(),
    viewMode: 'week',
    onDateChange: (date) => console.log('Date changed:', date),
    onViewModeChange: (mode) => console.log('View mode changed:', mode),
  },
};

export const DayView: Story = {
  args: {
    currentDate: new Date(),
    viewMode: 'day',
    onDateChange: (date) => console.log('Date changed:', date),
    onViewModeChange: (mode) => console.log('View mode changed:', mode),
  },
};
