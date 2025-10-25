import type { Meta, StoryObj } from '@storybook/react';
import AppButton from './AppButton';

// Простые иконки для демонстрации
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 14L10.344 10.344M11.8889 6.44444C11.8889 9.42813 9.42813 11.8889 6.44444 11.8889C3.46076 11.8889 1 9.42813 1 6.44444C1 3.46076 3.46076 1 6.44444 1C9.42813 1 11.8889 3.46076 11.8889 6.44444Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const meta: Meta<typeof AppButton> = {
  title: 'UI/AppButton',
  component: AppButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'invisible', 'default']
    },
    size: {
      control: { type: 'select' },
      options: ['M', 'L']
    },
    disabled: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    onlyIcon: {
      control: { type: 'boolean' }
    },
    children: {
      control: { type: 'text' }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppButton>;

// Основная story с контролами
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'L',
  },
};

// Все варианты
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <AppButton variant="primary">Primary</AppButton>
      <AppButton variant="secondary">Secondary</AppButton>
      <AppButton variant="danger">Danger</AppButton>
      <AppButton variant="invisible">Invisible</AppButton>
      <AppButton variant="default">Default</AppButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Все варианты кнопок в соответствии с дизайн-системой.',
      },
    },
  },
};

// Все размеры
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <AppButton size="M">Medium</AppButton>
      <AppButton size="L">Large</AppButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Размеры кнопок: M (40px) и L (50px).',
      },
    },
  },
};

// Состояния
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <AppButton>Default</AppButton>
      <AppButton disabled>Disabled</AppButton>
      <AppButton loading>Loading</AppButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Различные состояния кнопки: обычное, отключенное и загрузка.',
      },
    },
  },
};

// С иконками
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <AppButton iconLeft={<SearchIcon />}>Search</AppButton>
      <AppButton iconRight={<ArrowIcon />}>Continue</AppButton>
      <AppButton onlyIcon iconLeft={<MenuIcon />} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Кнопки с иконками: слева, справа и только иконка.',
      },
    },
  },
};

// Комбинация размеров и вариантов
export const SizeVariantMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>Size L</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <AppButton size="L" variant="primary">Primary L</AppButton>
          <AppButton size="L" variant="secondary">Secondary L</AppButton>
          <AppButton size="L" variant="danger">Danger L</AppButton>
          <AppButton size="L" variant="invisible">Invisible L</AppButton>
          <AppButton size="L" variant="default">Default L</AppButton>
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>Size M</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <AppButton size="M" variant="primary">Primary M</AppButton>
          <AppButton size="M" variant="secondary">Secondary M</AppButton>
          <AppButton size="M" variant="danger">Danger M</AppButton>
          <AppButton size="M" variant="invisible">Invisible M</AppButton>
          <AppButton size="M" variant="default">Default M</AppButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Матрица всех комбинаций размеров и вариантов.',
      },
    },
  },
};

// Состояния для каждого варианта
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['primary', 'secondary', 'danger', 'invisible', 'default'] as const).map((variant) => (
        <div key={variant}>
          <h3 style={{ marginBottom: '16px', color: '#374151', textTransform: 'capitalize' }}>
            {variant}
          </h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <AppButton variant={variant}>Default</AppButton>
            <AppButton variant={variant} disabled>Disabled</AppButton>
            <AppButton variant={variant} loading>Loading</AppButton>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Все состояния для каждого варианта кнопки.',
      },
    },
  },
};

// Только иконки для всех вариантов
export const OnlyIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <AppButton variant="primary" onlyIcon iconLeft={<MenuIcon />} />
      <AppButton variant="secondary" onlyIcon iconLeft={<SearchIcon />} />
      <AppButton variant="danger" onlyIcon iconLeft={<ArrowIcon />} />
      <AppButton variant="invisible" onlyIcon iconLeft={<MenuIcon />} />
      <AppButton variant="default" onlyIcon iconLeft={<SearchIcon />} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Кнопки только с иконками для всех вариантов.',
      },
    },
  },
};

// Интерактивный пример
export const Interactive: Story = {
  args: {
    children: 'Click me!',
    variant: 'primary',
    size: 'L',
    onClick: () => alert('Button clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Интерактивная кнопка с обработчиком клика.',
      },
    },
  },
};