import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout';

const meta: Meta<typeof AppLayout> = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: '20px', maxWidth: '800px', width: '100%' }}>
        <h1>Услуги</h1>
        <p>Это контент страницы внутри AppLayout</p>
        <p>AppLayout обеспечивает:</p>
        <ul>
          <li>Фон #F9F8F5</li>
          <li>Минимальная высота 100vh</li>
          <li>Фиксированный хедер</li>
          <li>MainContent с отступом 129px сверху</li>
          <li>Центрирование контента по горизонтали</li>
        </ul>
      </div>
    ),
  },
};

export const WithLongContent: Story = {
  args: {
    children: (
      <div style={{ padding: '20px', maxWidth: '800px', width: '100%' }}>
        <h1>Длинный контент</h1>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i}>
            Параграф {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    ),
  },
};
