import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import AppInput from './AppInput';

// Иконки для демонстрации (можно заменить на реальные)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
  </svg>
);

const meta: Meta<typeof AppInput> = {
  title: 'Components/UI/AppInput',
  component: AppInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Базовый компонент для ввода текста с поддержкой различных состояний, размеров и стилей.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['M', 'L'],
      description: 'Размер компонента',
    },
    background: {
      control: { type: 'radio' },
      options: ['muted', 'default'],
      description: 'Вариант фона',
    },
    error: {
      control: { type: 'text' },
      description: 'Сообщение об ошибке или boolean для показа ошибки',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Отключенное состояние',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Обязательное поле',
    },
    label: {
      control: { type: 'text' },
      description: 'Текст метки',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder текст',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Базовые варианты
export const Default: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    size: 'L',
    background: 'default',
  },
};

export const Muted: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    size: 'L',
    background: 'muted',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Label',
    value: 'Value',
    size: 'L',
    background: 'default',
  },
};

// Размеры
export const SizeM: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    size: 'M',
    background: 'default',
  },
};

export const SizeL: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    size: 'L',
    background: 'default',
  },
};

// Состояния
export const Required: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    required: true,
    size: 'L',
    background: 'default',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    disabled: true,
    size: 'L',
    background: 'default',
  },
};

export const DisabledWithValue: Story = {
  args: {
    label: 'Label',
    value: 'Value',
    disabled: true,
    size: 'L',
    background: 'default',
  },
};

export const WithError: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    error: 'Error text',
    size: 'L',
    background: 'default',
  },
};

export const WithErrorAndValue: Story = {
  args: {
    label: 'Label',
    value: 'Value',
    error: 'Error text',
    size: 'L',
    background: 'default',
  },
};

// С иконками
export const WithLeftIcon: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    iconLeft: <UserIcon />,
    size: 'L',
    background: 'default',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    iconRight: <SearchIcon />,
    size: 'L',
    background: 'default',
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    iconLeft: <UserIcon />,
    iconRight: <EyeIcon />,
    size: 'L',
    background: 'default',
  },
};

// Без label
export const WithoutLabel: Story = {
  args: {
    placeholder: 'Placeholder',
    size: 'L',
    background: 'default',
  },
};

// Различные комбинации
export const AllCombinations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <div>
        <h3>Size M</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AppInput label="Default" placeholder="Placeholder" size="M" background="default" />
          <AppInput label="Muted" placeholder="Placeholder" size="M" background="muted" />
          <AppInput label="With Value" value="Value" size="M" background="default" />
          <AppInput label="Required" placeholder="Placeholder" required size="M" background="default" />
          <AppInput label="Disabled" placeholder="Placeholder" disabled size="M" background="default" />
          <AppInput label="Error" placeholder="Placeholder" error="Error text" size="M" background="default" />
        </div>
      </div>
      
      <div>
        <h3>Size L</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AppInput label="Default" placeholder="Placeholder" size="L" background="default" />
          <AppInput label="Muted" placeholder="Placeholder" size="L" background="muted" />
          <AppInput label="With Value" value="Value" size="L" background="default" />
          <AppInput label="Required" placeholder="Placeholder" required size="L" background="default" />
          <AppInput label="Disabled" placeholder="Placeholder" disabled size="L" background="default" />
          <AppInput label="Error" placeholder="Placeholder" error="Error text" size="L" background="default" />
        </div>
      </div>
      
      <div>
        <h3>With Icons</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AppInput label="Left Icon" placeholder="Placeholder" iconLeft={<UserIcon />} size="L" background="default" />
          <AppInput label="Right Icon" placeholder="Placeholder" iconRight={<SearchIcon />} size="L" background="default" />
          <AppInput label="Both Icons" placeholder="Placeholder" iconLeft={<UserIcon />} iconRight={<EyeIcon />} size="L" background="default" />
        </div>
      </div>
    </div>
  ),
};

// Controlled компонент пример
export const ControlledExample: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
        <AppInput
          label="Controlled Input"
          placeholder="Type something..."
          value={value}
          onChange={(newValue) => setValue(newValue)}
          size="L"
          background="default"
        />
        <p>Current value: {value}</p>
      </div>
    );
  },
};