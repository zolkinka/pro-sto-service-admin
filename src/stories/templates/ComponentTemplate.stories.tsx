import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// Замените YourComponent на имя вашего компонента
// import { YourComponent } from './YourComponent';

// Заглушка для примера (в реальном проекте удалите)
const YourComponent = (props: any) => <div {...props} />;

// Пример для создания stories любого компонента
const meta: Meta<typeof YourComponent> = {
  title: 'Templates/ComponentTemplate',
  component: YourComponent,
  parameters: {
    // Дополнительные параметры для этого компонента
    layout: 'centered',
    docs: {
      description: {
        component: 'Описание компонента для документации',
      },
    },
  },
  // Определяем типы аргументов для Controls
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'Вариант отображения',
    },
    size: {
      control: 'select', 
      options: ['small', 'medium', 'large'],
      description: 'Размер компонента',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключенное состояние',
    },
    children: {
      control: 'text',
      description: 'Содержимое компонента',
    },
  },
  // Общие аргументы по умолчанию
  args: {
    onClick: () => console.log('clicked'),
  },
  // Теги для организации stories
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Базовая история
export const Default: Story = {
  args: {
    children: 'Default Component',
  },
};

// История с различными состояниями
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Component',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary', 
    children: 'Secondary Component',
  },
};

// История с интерактивными элементами
export const Interactive: Story = {
  args: {
    children: 'Interactive Component',
    onClick: () => console.log('interaction-clicked'),
  },
};

// История с различными размерами
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <YourComponent {...args} size="small">Small</YourComponent>
      <YourComponent {...args} size="medium">Medium</YourComponent>
      <YourComponent {...args} size="large">Large</YourComponent>
    </div>
  ),
};

// История для отключенного состояния
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Component',
  },
};