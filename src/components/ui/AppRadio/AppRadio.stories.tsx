import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import AppRadio from './AppRadio';

const meta: Meta<typeof AppRadio> = {
  title: 'UI/AppRadio',
  component: AppRadio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Компонент радио-кнопки для выбора одного варианта из группы.

## Особенности
- Два размера: M (20px) и L (28px)
- Состояния: выбрано/не выбрано, активно/неактивно
- Поддержка клавиатурной навигации
- Accessibility атрибуты (ARIA)
- Controlled и uncontrolled режимы
- Группировка через атрибут name

## Использование
\`\`\`tsx
const [value, setValue] = useState('option1');

<AppRadio
  name="group"
  value="option1"
  checked={value === 'option1'}
  onChange={(e) => setValue(e.target.value)}
  label="Вариант 1"
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['M', 'L'],
      description: 'Размер радио-кнопки',
      table: {
        type: { summary: "'M' | 'L'" },
        defaultValue: { summary: 'L' },
      },
    },
    checked: {
      control: 'boolean',
      description: 'Состояние выбора',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Состояние неактивности',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      control: 'text',
      description: 'Текст лейбла',
      table: {
        type: { summary: 'string' },
      },
    },
    name: {
      control: 'text',
      description: 'Имя группы (для группировки радио-кнопок)',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      control: 'text',
      description: 'Значение радио-кнопки',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppRadio>;

/**
 * Базовый вариант радио-кнопки с лейблом размера L
 */
export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    size: 'L',
    label: 'Вариант выбора',
    value: 'option1',
  },
};

/**
 * Выбранная радио-кнопка размера L
 */
export const Selected: Story = {
  args: {
    checked: true,
    disabled: false,
    size: 'L',
    label: 'Выбранный вариант',
    value: 'option1',
  },
};

/**
 * Неактивная невыбранная радио-кнопка размера L
 */
export const DisabledUnchecked: Story = {
  args: {
    checked: false,
    disabled: true,
    size: 'L',
    label: 'Неактивный вариант',
    value: 'option1',
  },
};

/**
 * Неактивная выбранная радио-кнопка размера L
 */
export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    size: 'L',
    label: 'Неактивный выбранный',
    value: 'option1',
  },
};

/**
 * Радио-кнопка размера M
 */
export const SizeM: Story = {
  args: {
    checked: false,
    disabled: false,
    size: 'M',
    label: 'Маленькая кнопка',
    value: 'option1',
  },
};

/**
 * Выбранная радио-кнопка размера M
 */
export const SizeMSelected: Story = {
  args: {
    checked: true,
    disabled: false,
    size: 'M',
    label: 'Маленькая выбранная',
    value: 'option1',
  },
};

/**
 * Неактивная радио-кнопка размера M
 */
export const SizeMDisabled: Story = {
  args: {
    checked: false,
    disabled: true,
    size: 'M',
    label: 'Маленькая неактивная',
    value: 'option1',
  },
};

/**
 * Неактивная выбранная радио-кнопка размера M
 */
export const SizeMDisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    size: 'M',
    label: 'Маленькая неактивная выбранная',
    value: 'option1',
  },
};

/**
 * Радио-кнопка без лейбла размера L
 */
export const WithoutLabel: Story = {
  args: {
    checked: false,
    disabled: false,
    size: 'L',
    value: 'option1',
  },
};

/**
 * Выбранная радио-кнопка без лейбла размера L
 */
export const WithoutLabelSelected: Story = {
  args: {
    checked: true,
    disabled: false,
    size: 'L',
    value: 'option1',
  },
};

/**
 * Группа радио-кнопок размера L
 */
export const RadioGroup: Story = {
  render: function RadioGroupComponent() {
    const [selected, setSelected] = useState('option1');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AppRadio
          name="demo-group"
          value="option1"
          checked={selected === 'option1'}
          onChange={(e) => setSelected(e.target.value)}
          label="Первый вариант"
          size="L"
        />
        <AppRadio
          name="demo-group"
          value="option2"
          checked={selected === 'option2'}
          onChange={(e) => setSelected(e.target.value)}
          label="Второй вариант"
          size="L"
        />
        <AppRadio
          name="demo-group"
          value="option3"
          checked={selected === 'option3'}
          onChange={(e) => setSelected(e.target.value)}
          label="Третий вариант"
          size="L"
        />
        <AppRadio
          name="demo-group"
          value="option4"
          checked={selected === 'option4'}
          disabled
          label="Неактивный вариант"
          size="L"
        />
      </div>
    );
  },
};

/**
 * Группа радио-кнопок размера M
 */
export const RadioGroupSizeM: Story = {
  render: function RadioGroupSizeMComponent() {
    const [selected, setSelected] = useState('small1');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AppRadio
          name="small-group"
          value="small1"
          checked={selected === 'small1'}
          onChange={(e) => setSelected(e.target.value)}
          label="Маленький вариант 1"
          size="M"
        />
        <AppRadio
          name="small-group"
          value="small2"
          checked={selected === 'small2'}
          onChange={(e) => setSelected(e.target.value)}
          label="Маленький вариант 2"
          size="M"
        />
        <AppRadio
          name="small-group"
          value="small3"
          checked={selected === 'small3'}
          onChange={(e) => setSelected(e.target.value)}
          label="Маленький вариант 3"
          size="M"
        />
      </div>
    );
  },
};

/**
 * Все состояния размера L
 */
export const AllStatesL: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <AppRadio checked={false} disabled={false} size="L" label="Не выбрано" />
        <AppRadio checked={true} disabled={false} size="L" label="Выбрано" />
        <AppRadio checked={false} disabled={true} size="L" label="Неактивно не выбрано" />
        <AppRadio checked={true} disabled={true} size="L" label="Неактивно выбрано" />
      </div>
    </div>
  ),
};

/**
 * Все состояния размера M
 */
export const AllStatesM: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <AppRadio checked={false} disabled={false} size="M" label="Не выбрано" />
        <AppRadio checked={true} disabled={false} size="M" label="Выбрано" />
        <AppRadio checked={false} disabled={true} size="M" label="Неактивно не выбрано" />
        <AppRadio checked={true} disabled={true} size="M" label="Неактивно выбрано" />
      </div>
    </div>
  ),
};

/**
 * Controlled компонент с внешним состоянием
 */
export const Controlled: Story = {
  render: function ControlledComponent() {
    const [value, setValue] = useState('');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>Выбранное значение: <strong>{value || 'не выбрано'}</strong></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AppRadio
            name="controlled"
            value="first"
            checked={value === 'first'}
            onChange={(e) => setValue(e.target.value)}
            label="Первый"
            size="L"
          />
          <AppRadio
            name="controlled"
            value="second"
            checked={value === 'second'}
            onChange={(e) => setValue(e.target.value)}
            label="Второй"
            size="L"
          />
          <AppRadio
            name="controlled"
            value="third"
            checked={value === 'third'}
            onChange={(e) => setValue(e.target.value)}
            label="Третий"
            size="L"
          />
        </div>
        <button
          onClick={() => setValue('')}
          style={{
            padding: '8px 16px',
            background: '#302F2D',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          Сбросить выбор
        </button>
      </div>
    );
  },
};
