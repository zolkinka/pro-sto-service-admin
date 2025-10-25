import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { AppCodeInput } from './AppCodeInput';

const meta = {
  title: 'Components/UI/AppCodeInput',
  component: AppCodeInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Компонент для ввода кода подтверждения из SMS. Состоит из нескольких полей для ввода цифр с автоматическим переключением фокуса при вводе.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8 },
      description: 'Количество полей для ввода цифр',
    },
    label: {
      control: 'text',
      description: 'Текст метки над полями',
    },
    error: {
      control: 'boolean',
      description: 'Показать состояние ошибки',
    },
    errorText: {
      control: 'text',
      description: 'Текст сообщения об ошибке',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключенное состояние',
    },
    autoFocus: {
      control: 'boolean',
      description: 'Автофокус на первое поле при монтировании',
    },
    inputMode: {
      control: 'select',
      options: ['numeric', 'tel'],
      description: 'Тип клавиатуры на мобильных устройствах',
    },
    onComplete: {
      description: 'Callback при завершении ввода всех цифр',
    },
    onChange: {
      description: 'Callback при изменении значения',
    },
  },
} satisfies Meta<typeof AppCodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовый вариант компонента с меткой "Код из SMS".
 * При вводе цифры автоматически переключается на следующее поле.
 */
export const Default: Story = {
  args: {
    label: 'Код из SMS',
    onComplete: fn(),
    onChange: fn(),
  },
};

/**
 * Компонент с ошибкой валидации.
 * Все поля отображаются с красной рамкой и текстом ошибки под полями.
 */
export const WithError: Story = {
  args: {
    label: 'Код из SMS',
    error: true,
    errorText: 'Неверный код подтверждения',
    onComplete: fn(),
    onChange: fn(),
  },
};

/**
 * Отключенное состояние компонента.
 * Поля недоступны для ввода.
 */
export const Disabled: Story = {
  args: {
    label: 'Код из SMS',
    disabled: true,
  },
};

/**
 * Компонент с 6-значным кодом вместо стандартного 4-значного.
 * Полезно для различных систем аутентификации.
 */
export const CustomLength: Story = {
  args: {
    label: 'Код из SMS',
    length: 6,
    onComplete: fn(),
    onChange: fn(),
  },
};

/**
 * Компонент без метки над полями.
 * Минималистичный вариант для компактного размещения.
 */
export const WithoutLabel: Story = {
  args: {
    onComplete: fn(),
    onChange: fn(),
  },
};

/**
 * Компонент с типом клавиатуры "tel" для мобильных устройств.
 * Открывает телефонную клавиатуру вместо цифровой.
 */
export const TelInputMode: Story = {
  args: {
    label: 'Код из SMS',
    inputMode: 'tel',
    onComplete: fn(),
    onChange: fn(),
  },
};

/**
 * Компонент без автофокуса.
 * Пользователь должен кликнуть на поле для начала ввода.
 */
export const NoAutoFocus: Story = {
  args: {
    label: 'Код из SMS',
    autoFocus: false,
    onComplete: fn(),
    onChange: fn(),
  },
};

/**
 * Все состояния компонента в одном месте для визуального сравнения.
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#53514F' }}>
          Default
        </h3>
        <AppCodeInput label="Код из SMS" />
      </div>

      <div>
        <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#53514F' }}>
          With Error
        </h3>
        <AppCodeInput
          label="Код из SMS"
          error={true}
          errorText="Неверный код подтверждения"
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#53514F' }}>
          Disabled
        </h3>
        <AppCodeInput label="Код из SMS" disabled={true} />
      </div>

      <div>
        <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#53514F' }}>
          Custom Length (6 digits)
        </h3>
        <AppCodeInput label="Код из SMS" length={6} />
      </div>

      <div>
        <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#53514F' }}>
          Without Label
        </h3>
        <AppCodeInput />
      </div>
    </div>
  ),
};
