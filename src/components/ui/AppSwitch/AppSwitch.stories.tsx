import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import AppSwitch from './AppSwitch';

const meta: Meta<typeof AppSwitch> = {
  title: 'UI/AppSwitch',
  component: AppSwitch,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['M', 'L'],
      description: 'Размер переключателя',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Состояние переключателя (включено/выключено)',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Состояние доступности',
    },
    label: {
      control: { type: 'text' },
      description: 'Текстовая метка',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AppSwitch>;

// Основная story с контролами
export const Default: Story = {
  args: {
    size: 'L',
    checked: false,
    disabled: false,
  },
};

// Все размеры
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#888684' }}>Size L (44x24px)</span>
        <AppSwitch size="L" checked={true} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#888684' }}>Size M (36x20px)</span>
        <AppSwitch size="M" checked={true} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Два доступных размера переключателя: L (44x24px) и M (36x20px).',
      },
    },
  },
};

// Все состояния On/Off
export const OnOffStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#374151' }}>Size L</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <AppSwitch size="L" checked={true} />
          <AppSwitch size="L" checked={false} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#374151' }}>Size M</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <AppSwitch size="M" checked={true} />
          <AppSwitch size="M" checked={false} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Переключатели в состояниях On (включено) и Off (выключено) для обоих размеров.',
      },
    },
  },
};

// Disabled состояния
export const DisabledStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#374151' }}>Size L</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <AppSwitch size="L" checked={true} disabled />
            <span style={{ fontSize: '12px', color: '#888684' }}>On Disabled</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <AppSwitch size="L" checked={false} disabled />
            <span style={{ fontSize: '12px', color: '#888684' }}>Off Disabled</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', color: '#374151' }}>Size M</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <AppSwitch size="M" checked={true} disabled />
            <span style={{ fontSize: '12px', color: '#888684' }}>On Disabled</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <AppSwitch size="M" checked={false} disabled />
            <span style={{ fontSize: '12px', color: '#888684' }}>Off Disabled</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Неактивные (disabled) переключатели во всех состояниях и размерах.',
      },
    },
  },
};

// С лейблами
export const WithLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AppSwitch size="L" checked={true} label="Получать уведомления" />
      <AppSwitch size="L" checked={false} label="Автоматическое обновление" />
      <AppSwitch size="M" checked={true} label="Темная тема" />
      <AppSwitch size="M" checked={false} label="Звуковые оповещения" />
      <AppSwitch size="L" checked={true} disabled label="Включено (недоступно)" />
      <AppSwitch size="L" checked={false} disabled label="Выключено (недоступно)" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Переключатели с текстовыми метками в различных состояниях.',
      },
    },
  },
};

// Матрица всех комбинаций
export const AllCombinations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ marginBottom: '24px', fontSize: '16px', color: '#302F2D' }}>Size L (44x24px)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>On - Default</div>
            <AppSwitch size="L" checked={true} />
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>Off - Default</div>
            <AppSwitch size="L" checked={false} />
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>On - Disabled</div>
            <AppSwitch size="L" checked={true} disabled />
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>Off - Disabled</div>
            <AppSwitch size="L" checked={false} disabled />
          </div>
        </div>
      </div>
      
      <div>
        <h2 style={{ marginBottom: '24px', fontSize: '16px', color: '#302F2D' }}>Size M (36x20px)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>On - Default</div>
            <AppSwitch size="M" checked={true} />
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>Off - Default</div>
            <AppSwitch size="M" checked={false} />
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>On - Disabled</div>
            <AppSwitch size="M" checked={true} disabled />
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '120px', fontSize: '14px', color: '#53514F' }}>Off - Disabled</div>
            <AppSwitch size="M" checked={false} disabled />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Полная матрица всех комбинаций размеров и состояний переключателя.',
      },
    },
  },
};

// Интерактивный пример с контролируемым состоянием
const InteractiveComponent = () => {
  const [checked, setChecked] = useState(false);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <AppSwitch 
        size="L" 
        checked={checked} 
        onChange={setChecked}
        label="Интерактивный переключатель"
      />
      <div style={{ 
        padding: '12px 16px', 
        background: '#F9F8F5', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#302F2D'
      }}>
        Текущее состояние: <strong>{checked ? 'Включено' : 'Выключено'}</strong>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Полностью интерактивный переключатель с отображением текущего состояния.',
      },
    },
  },
};

// Пример использования в форме
const FormExampleComponent = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoUpdate: false,
    darkMode: true,
    sounds: false,
  });
  
  const handleChange = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  };
  
  return (
    <div style={{ 
      padding: '24px', 
      background: '#FFFFFF', 
      borderRadius: '12px',
      border: '1px solid #F4F3F0',
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#302F2D' }}>
        Настройки приложения
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AppSwitch 
          size="L" 
          checked={settings.notifications} 
          onChange={handleChange('notifications')}
          label="Получать уведомления"
        />
        <AppSwitch 
          size="L" 
          checked={settings.autoUpdate} 
          onChange={handleChange('autoUpdate')}
          label="Автоматическое обновление"
        />
        <AppSwitch 
          size="L" 
          checked={settings.darkMode} 
          onChange={handleChange('darkMode')}
          label="Темная тема"
        />
        <AppSwitch 
          size="L" 
          checked={settings.sounds} 
          onChange={handleChange('sounds')}
          label="Звуковые оповещения"
        />
      </div>
    </div>
  );
};

export const FormExample: Story = {
  render: () => <FormExampleComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Пример использования переключателя в форме настроек с несколькими опциями.',
      },
    },
  },
};

// Демонстрация клавиатурной навигации
export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <div style={{ 
        padding: '12px 16px', 
        background: '#F9F8F5', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#302F2D',
        marginBottom: '8px'
      }}>
        Используйте Tab для навигации и Space/Enter для переключения
      </div>
      <AppSwitch size="L" label="Первый переключатель" />
      <AppSwitch size="L" label="Второй переключатель" />
      <AppSwitch size="L" label="Третий переключатель" />
      <AppSwitch size="L" disabled label="Недоступный переключатель" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Демонстрация клавиатурной навигации. Используйте Tab для перехода между переключателями и Space/Enter для изменения состояния.',
      },
    },
  },
};
