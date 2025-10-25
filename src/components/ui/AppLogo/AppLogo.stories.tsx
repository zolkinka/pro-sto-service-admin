import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import AppLogo from './AppLogo';

const meta: Meta<typeof AppLogo> = {
  title: 'UI/AppLogo',
  component: AppLogo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Компонент логотипа "просто" с тремя точками. Размер: 167x43px. При клике редиректит на главную страницу (/).',
      },
    },
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
type Story = StoryObj<typeof AppLogo>;

// Основной вариант
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Логотип по умолчанию. Кликабелен, при клике переходит на главную страницу.',
      },
    },
  },
};

// С кастомным обработчиком клика
export const CustomClickHandler: Story = {
  args: {
    onClick: () => alert('Логотип нажат!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Логотип с кастомным обработчиком клика вместо стандартной навигации.',
      },
    },
  },
};

// На тёмном фоне
export const OnDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#1a1a1a',
        borderRadius: '8px' 
      }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Логотип на тёмном фоне (для проверки контрастности).',
      },
    },
  },
};

// На светлом фоне
export const OnLightBackground: Story = {
  decorators: [
    (Story) => (
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#F9F8F5',
        borderRadius: '8px' 
      }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Логотип на светлом фоне (стандартный фон приложения).',
      },
    },
  },
};

// В разных контекстах (Header)
export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        width: '800px',
      }}>
        <Story />
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#6b7280' }}>Меню</span>
          <span style={{ color: '#6b7280' }}>Профиль</span>
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Логотип в контексте шапки приложения.',
      },
    },
  },
};

// Все состояния (hover, active)
export const InteractionStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', color: '#6b7280', fontSize: '14px' }}>Default:</p>
        <AppLogo />
      </div>
      <div>
        <p style={{ marginBottom: '8px', color: '#6b7280', fontSize: '14px' }}>Hover (наведите курсор):</p>
        <AppLogo />
      </div>
      <div>
        <p style={{ marginBottom: '8px', color: '#6b7280', fontSize: '14px' }}>Active (нажмите):</p>
        <AppLogo />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Различные состояния взаимодействия с логотипом. При наведении opacity: 0.8, при нажатии opacity: 0.6.',
      },
    },
  },
};

// Размеры и пропорции
export const Dimensions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ 
        border: '1px dashed #e5e7eb', 
        padding: '16px',
        display: 'inline-block',
        width: 'fit-content'
      }}>
        <AppLogo />
        <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '12px' }}>
          Размер: 167×43px
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Точные размеры логотипа согласно дизайн-системе: 167px × 43px.',
      },
    },
  },
};
