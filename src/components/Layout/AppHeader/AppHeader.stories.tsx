import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import AppHeader from './AppHeader';

const meta = {
  title: 'Layout/AppHeader',
  component: AppHeader,
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
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Services: Story = {
  args: {
    activeTab: 'services',
  },
};

export const Orders: Story = {
  args: {
    activeTab: 'orders',
  },
};

export const Analytics: Story = {
  args: {
    activeTab: 'analytics',
  },
};

export const Schedule: Story = {
  args: {
    activeTab: 'schedule',
  },
};
