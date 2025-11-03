import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import AppTimePicker from './AppTimePicker';

const meta = {
  title: 'UI/AppTimePicker',
  component: AppTimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const DefaultStory = () => {
  const [value, setValue] = useState('09:00');
  
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <AppTimePicker
        label="Время начала"
        value={value}
        onChange={setValue}
        placeholder="00:00"
      />
      <div style={{ marginTop: '20px', color: '#666' }}>
        Выбранное время: {value || 'не выбрано'}
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultStory />,
};

const WithoutLabelStory = () => {
  const [value, setValue] = useState('14:30');
  
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <AppTimePicker
        value={value}
        onChange={setValue}
        placeholder="Выберите время"
      />
    </div>
  );
};

export const WithoutLabel: Story = {
  render: () => <WithoutLabelStory />,
};

const EmptyStory = () => {
  const [value, setValue] = useState('');
  
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <AppTimePicker
        label="Время"
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export const Empty: Story = {
  render: () => <EmptyStory />,
};

export const Disabled: Story = {
  render: () => {
    return (
      <div style={{ width: '300px', padding: '20px' }}>
        <AppTimePicker
          label="Время (disabled)"
          value="10:00"
          onChange={() => {}}
          disabled
        />
      </div>
    );
  },
};

const WithCustomSlotsStory = () => {
  const [value, setValue] = useState('10:00');
  const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <AppTimePicker
        label="Доступное время"
        value={value}
        onChange={setValue}
        availableSlots={slots}
      />
      <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
        Доступны только определенные слоты
      </div>
    </div>
  );
};

export const WithCustomSlots: Story = {
  render: () => <WithCustomSlotsStory />,
};

const ManualInputStory = () => {
  const [value, setValue] = useState('12:45');
  
  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <AppTimePicker
        label="Введите время вручную"
        value={value}
        onChange={setValue}
      />
      <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
        Попробуйте ввести время вручную с клавиатуры
      </div>
    </div>
  );
};

export const ManualInput: Story = {
  render: () => <ManualInputStory />,
};
