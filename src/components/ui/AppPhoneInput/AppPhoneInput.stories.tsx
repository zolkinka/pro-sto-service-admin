import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import AppPhoneInput from './AppPhoneInput';

const meta: Meta<typeof AppPhoneInput> = {
  title: 'Components/UI/AppPhoneInput',
  component: AppPhoneInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Специализированный компонент для ввода номера телефона с автоматическим форматированием по маске +7 (XXX) XXX-XX-XX. Использует IMask для обработки ввода.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    validateOnBlur: {
      control: { type: 'boolean' },
      description: 'Автоматическая валидация при потере фокуса',
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Базовые варианты
export const Default: Story = {
  args: {
    label: 'Номер телефона',
    placeholder: '+7 (___) ___-__-__',
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Номер телефона',
    defaultValue: '9161234567',
  },
};

export const Required: Story = {
  args: {
    label: 'Номер телефона',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Номер телефона',
    defaultValue: '916123',
    error: 'Введите корректный номер телефона',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Номер телефона',
    defaultValue: '9161234567',
    disabled: true,
  },
};

export const DisabledEmpty: Story = {
  args: {
    label: 'Номер телефона',
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: '+7 (___) ___-__-__',
  },
};

// Интерактивный пример с валидацией
export const WithValidation: Story = {
  render: () => {
    const [phone, setPhone] = React.useState('');
    const [isValid, setIsValid] = React.useState<boolean | null>(null);
    const [error, setError] = React.useState<string>('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
        <AppPhoneInput
          label="Номер телефона"
          value={phone}
          onChange={(value) => {
            setPhone(value);
            setError('');
            setIsValid(null);
          }}
          onPhoneComplete={(phone) => {
            console.log('Phone complete:', phone);
            setIsValid(true);
          }}
          onValidate={(valid, phone) => {
            console.log('Validation:', valid, phone);
            setIsValid(valid);
            if (!valid && phone.length > 0) {
              setError('Введите корректный номер телефона');
            } else {
              setError('');
            }
          }}
          error={error}
          validateOnBlur={true}
        />
        {isValid !== null && (
          <div style={{ 
            fontSize: '14px', 
            color: isValid ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isValid ? '✓ Номер корректный' : '✗ Номер некорректный'}
          </div>
        )}
        {phone && (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <strong>Чистый номер:</strong> {phone || '(пусто)'}
          </div>
        )}
      </div>
    );
  },
};

// Controlled компонент пример
export const ControlledExample: Story = {
  render: () => {
    const [phone, setPhone] = React.useState('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
        <AppPhoneInput
          label="Номер телефона"
          value={phone}
          onChange={(value) => setPhone(value)}
          onPhoneComplete={(phone) => {
            console.log('Complete phone:', phone);
            alert(`Номер введен полностью: ${phone}`);
          }}
        />
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Текущее значение: <strong>{phone || '(пусто)'}</strong>
        </p>
        <button
          onClick={() => setPhone('')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Очистить
        </button>
      </div>
    );
  },
};

// Все состояния
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Default</h3>
        <AppPhoneInput label="Номер телефона" />
      </div>

      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>With Value</h3>
        <AppPhoneInput label="Номер телефона" defaultValue="9161234567" />
      </div>

      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Required</h3>
        <AppPhoneInput label="Номер телефона" required />
      </div>

      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>With Error</h3>
        <AppPhoneInput
          label="Номер телефона"
          defaultValue="916123"
          error="Введите корректный номер телефона"
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Disabled</h3>
        <AppPhoneInput label="Номер телефона" defaultValue="9161234567" disabled />
      </div>

      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Disabled Empty</h3>
        <AppPhoneInput label="Номер телефона" disabled />
      </div>
    </div>
  ),
};
