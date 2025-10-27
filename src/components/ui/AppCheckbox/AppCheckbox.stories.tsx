import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AppCheckbox } from './';

const meta: Meta<typeof AppCheckbox> = {
  title: 'Components/UI/AppCheckbox',
  component: AppCheckbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Компонент чекбокса с поддержкой различных размеров, вариантов и состояний.

## Особенности
- Два размера: S (20x20px) и M (24x24px)
- Два варианта: primary и secondary
- Поддержка состояния indeterminate для групповых чекбоксов
- Анимации появления галочки и линии
- Поддержка клавиатурной навигации (Space)
- Accessibility (ARIA атрибуты)
- Controlled и Uncontrolled режимы
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Состояние чекбокса (checked)',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Состояние indeterminate (частично выбран)',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключен ли чекбокс',
    },
    size: {
      control: 'select',
      options: ['S', 'M'],
      description: 'Размер чекбокса',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Вариант стиля чекбокса',
    },
    label: {
      control: 'text',
      description: 'Текст лейбла',
    },
    onChange: {
      action: 'changed',
      description: 'Обработчик изменения состояния',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ========== Основные варианты ==========

/**
 * Primary чекбокс размера M (по умолчанию)
 */
export const Default: Story = {
  args: {
    label: 'Checkbox label',
  },
};

/**
 * Primary чекбокс в состоянии checked
 */
export const Checked: Story = {
  args: {
    label: 'Checkbox label',
    checked: true,
  },
};

/**
 * Primary чекбокс в состоянии indeterminate (частично выбран)
 */
export const Indeterminate: Story = {
  args: {
    label: 'Select all items',
    indeterminate: true,
  },
};

/**
 * Primary чекбокс в состоянии disabled
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
};

/**
 * Primary чекбокс checked + disabled
 */
export const CheckedDisabled: Story = {
  args: {
    label: 'Disabled checked',
    checked: true,
    disabled: true,
  },
};

// ========== Размеры ==========

/**
 * Размер S (20x20px)
 */
export const SizeSmall: Story = {
  args: {
    label: 'Small checkbox',
    size: 'S',
  },
};

/**
 * Размер M (24x24px) - по умолчанию
 */
export const SizeMedium: Story = {
  args: {
    label: 'Medium checkbox',
    size: 'M',
  },
};

/**
 * Сравнение размеров
 */
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AppCheckbox size="S" label="Size S (20x20px)" checked />
      <AppCheckbox size="M" label="Size M (24x24px)" checked />
    </div>
  ),
};

// ========== Варианты (Primary / Secondary) ==========

/**
 * Primary вариант (темный фон при checked)
 */
export const VariantPrimary: Story = {
  args: {
    label: 'Primary checkbox',
    variant: 'primary',
    checked: true,
  },
};

/**
 * Secondary вариант (светлый фон при checked, для темных фонов)
 */
export const VariantSecondary: Story = {
  args: {
    label: 'Secondary checkbox',
    variant: 'secondary',
    checked: true,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#302F2D' },
      ],
    },
  },
};

/**
 * Сравнение вариантов Primary и Secondary
 */
export const VariantComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Primary</h3>
        <AppCheckbox variant="primary" label="Unchecked" />
        <AppCheckbox variant="primary" label="Checked" checked />
        <AppCheckbox variant="primary" label="Indeterminate" indeterminate />
        <AppCheckbox variant="primary" label="Disabled" disabled />
        <AppCheckbox variant="primary" label="Checked disabled" checked disabled />
      </div>
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          padding: '16px',
          backgroundColor: '#302F2D',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Secondary</h3>
        <AppCheckbox variant="secondary" label="Unchecked" />
        <AppCheckbox variant="secondary" label="Checked" checked />
        <AppCheckbox variant="secondary" label="Indeterminate" indeterminate />
        <AppCheckbox variant="secondary" label="Disabled" disabled />
        <AppCheckbox variant="secondary" label="Checked disabled" checked disabled />
      </div>
    </div>
  ),
};

// ========== Все состояния ==========

/**
 * Матрица всех состояний: Primary, размер M
 */
export const AllStatesPrimaryM: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
        Primary, Size M
      </div>
      <AppCheckbox variant="primary" size="M" label="Unchecked" />
      <AppCheckbox variant="primary" size="M" label="Checked" checked />
      <AppCheckbox variant="primary" size="M" label="Indeterminate" indeterminate />
      <AppCheckbox variant="primary" size="M" label="Disabled unchecked" disabled />
      <AppCheckbox variant="primary" size="M" label="Disabled checked" checked disabled />
      <AppCheckbox variant="primary" size="M" label="Disabled indeterminate" indeterminate disabled />
    </div>
  ),
};

/**
 * Матрица всех состояний: Primary, размер S
 */
export const AllStatesPrimaryS: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
        Primary, Size S
      </div>
      <AppCheckbox variant="primary" size="S" label="Unchecked" />
      <AppCheckbox variant="primary" size="S" label="Checked" checked />
      <AppCheckbox variant="primary" size="S" label="Indeterminate" indeterminate />
      <AppCheckbox variant="primary" size="S" label="Disabled unchecked" disabled />
      <AppCheckbox variant="primary" size="S" label="Disabled checked" checked disabled />
      <AppCheckbox variant="primary" size="S" label="Disabled indeterminate" indeterminate disabled />
    </div>
  ),
};

/**
 * Матрица всех состояний: Secondary, размер M (на темном фоне)
 */
export const AllStatesSecondaryM: Story = {
  render: () => (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        padding: '24px',
        backgroundColor: '#302F2D',
        borderRadius: '8px',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#FFFFFF' }}>
        Secondary, Size M
      </div>
      <AppCheckbox variant="secondary" size="M" label="Unchecked" />
      <AppCheckbox variant="secondary" size="M" label="Checked" checked />
      <AppCheckbox variant="secondary" size="M" label="Indeterminate" indeterminate />
      <AppCheckbox variant="secondary" size="M" label="Disabled unchecked" disabled />
      <AppCheckbox variant="secondary" size="M" label="Disabled checked" checked disabled />
      <AppCheckbox variant="secondary" size="M" label="Disabled indeterminate" indeterminate disabled />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1A1A1A' },
      ],
    },
  },
};

/**
 * Матрица всех состояний: Secondary, размер S (на темном фоне)
 */
export const AllStatesSecondaryS: Story = {
  render: () => (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        padding: '24px',
        backgroundColor: '#302F2D',
        borderRadius: '8px',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#FFFFFF' }}>
        Secondary, Size S
      </div>
      <AppCheckbox variant="secondary" size="S" label="Unchecked" />
      <AppCheckbox variant="secondary" size="S" label="Checked" checked />
      <AppCheckbox variant="secondary" size="S" label="Indeterminate" indeterminate />
      <AppCheckbox variant="secondary" size="S" label="Disabled unchecked" disabled />
      <AppCheckbox variant="secondary" size="S" label="Disabled checked" checked disabled />
      <AppCheckbox variant="secondary" size="S" label="Disabled indeterminate" indeterminate disabled />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1A1A1A' },
      ],
    },
  },
};

// ========== Без лейбла ==========

/**
 * Чекбокс без лейбла
 */
export const WithoutLabel: Story = {
  args: {
    checked: true,
  },
};

// ========== Controlled компонент ==========

/**
 * Controlled компонент - вспомогательный компонент для истории
 */
const ControlledExample = () => {
  const [checked, setChecked] = useState(false);
  
  return (
    <div>
      <AppCheckbox
        label="Controlled checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Current state: {checked ? 'checked' : 'unchecked'}
      </div>
    </div>
  );
};

/**
 * Пример controlled компонента с интерактивным состоянием
 */
export const Controlled: Story = {
  render: () => <ControlledExample />,
};

// ========== Группа чекбоксов ==========

/**
 * Группа чекбоксов - вспомогательный компонент для истории
 */
const CheckboxGroupExample = () => {
  const [items, setItems] = useState([
    { id: 1, label: 'Item 1', checked: false },
    { id: 2, label: 'Item 2', checked: true },
    { id: 3, label: 'Item 3', checked: false },
  ]);
  
  const allChecked = items.every(item => item.checked);
  const someChecked = items.some(item => item.checked);
  const indeterminate = someChecked && !allChecked;
  
  const handleParentChange = () => {
    const newChecked = !allChecked;
    setItems(items.map(item => ({ ...item, checked: newChecked })));
  };
  
  const handleChildChange = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <AppCheckbox
        label="Select all"
        checked={allChecked}
        indeterminate={indeterminate}
        onChange={handleParentChange}
      />
      <div style={{ 
        marginLeft: '32px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      }}>
        {items.map(item => (
          <AppCheckbox
            key={item.id}
            label={item.label}
            checked={item.checked}
            onChange={() => handleChildChange(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Пример группы чекбоксов с parent checkbox (indeterminate состояние)
 */
export const CheckboxGroup: Story = {
  render: () => <CheckboxGroupExample />,
};

// ========== Список с чекбоксами ==========

/**
 * Список с чекбоксами - вспомогательный компонент для истории
 */
const ListWithCheckboxesExample = () => {
  const [selected, setSelected] = useState<number[]>([]);
  
  const options = [
    { id: 1, label: 'React' },
    { id: 2, label: 'Vue' },
    { id: 3, label: 'Angular' },
    { id: 4, label: 'Svelte' },
  ];
  
  const handleChange = (id: number) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };
  
  return (
    <div>
      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
        Select frameworks:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map(option => (
          <AppCheckbox
            key={option.id}
            label={option.label}
            checked={selected.includes(option.id)}
            onChange={() => handleChange(option.id)}
          />
        ))}
      </div>
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Selected: {selected.length > 0 ? selected.length : 'none'}
      </div>
    </div>
  );
};

/**
 * Пример списка с чекбоксами
 */
export const ListWithCheckboxes: Story = {
  render: () => <ListWithCheckboxesExample />,
};

// ========== Интерактивное состояние ==========

/**
 * Интерактивный playground для тестирования
 */
export const Interactive: Story = {
  args: {
    label: 'Interactive checkbox',
    size: 'M',
    variant: 'primary',
    checked: false,
    indeterminate: false,
    disabled: false,
  },
};
