import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { AppHeaderMenu } from './index';

const meta = {
  title: 'Layout/AppHeaderMenu',
  component: AppHeaderMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ padding: '100px' }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof AppHeaderMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div style={{ 
        background: '#f9f8f5', 
        padding: '24px',
        minHeight: '300px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          alignItems: 'center'
        }}>
          <Story />
        </div>
      </div>
    ),
  ],
};
