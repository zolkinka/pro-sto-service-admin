import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AppDatePicker } from './AppDatePicker';

const meta: Meta<typeof AppDatePicker> = {
  title: 'UI/AppDatePicker',
  component: AppDatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Компонент для выбора даты с календарным интерфейсом. Использует AppBaseDropdown и AppInput.',
      },
    },
  },
  argTypes: {
    value: {
      description: 'Выбранная дата (Date, string или null)',
      control: { type: 'date' },
    },
    label: {
      description: 'Label над полем',
      control: { type: 'text' },
    },
    placeholder: {
      description: 'Плейсхолдер',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Отключение компонента',
      control: { type: 'boolean' },
    },
    error: {
      description: 'Сообщение об ошибке',
      control: { type: 'text' },
    },
    required: {
      description: 'Обязательное поле',
      control: { type: 'boolean' },
    },
    locale: {
      description: 'Локаль для отображения (ru или en)',
      control: { type: 'radio' },
      options: ['ru', 'en'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppDatePicker>;

/**
 * Базовый пример использования компонента
 */
export const Default: Story = {
  args: {
    label: 'Время и дата',
    placeholder: 'Выберите дату',
  },
};

/**
 * Компонент с выбранной датой
 */
export const WithValue: Story = {
  render: function WithValueStory() {
    const [value, setValue] = useState<Date | null>(new Date(2022, 0, 16));
    return (
      <div style={{ width: '400px' }}>
        <AppDatePicker
          label="Время и дата"
          value={value}
          onChange={setValue}
        />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Выбранная дата:</strong>
          <pre>{value ? value.toLocaleDateString('ru-RU') : 'Не выбрано'}</pre>
        </div>
      </div>
    );
  },
};

/**
 * Компонент с сегодняшней датой
 */
export const WithTodayValue: Story = {
  render: function WithTodayValueStory() {
    const [value, setValue] = useState<Date | null>(new Date());
    return (
      <div style={{ width: '400px' }}>
        <AppDatePicker
          label="Дата"
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

/**
 * Обязательное поле
 */
export const Required: Story = {
  args: {
    label: 'Дата рождения',
    placeholder: 'Выберите дату',
    required: true,
  },
};

/**
 * С сообщением об ошибке
 */
export const WithError: Story = {
  args: {
    label: 'Дата записи',
    placeholder: 'Выберите дату',
    error: 'Пожалуйста, выберите дату',
    required: true,
  },
};

/**
 * Отключенное состояние
 */
export const Disabled: Story = {
  args: {
    label: 'Дата',
    value: new Date(2022, 0, 16),
    disabled: true,
  },
};

/**
 * С ограничением минимальной даты (только будущие даты)
 */
export const WithMinDate: Story = {
  render: function WithMinDateStory() {
    const [value, setValue] = useState<Date | null>(null);
    const today = new Date();
    
    return (
      <div style={{ width: '400px' }}>
        <AppDatePicker
          label="Дата записи"
          placeholder="Выберите дату"
          value={value}
          onChange={setValue}
          minDate={today}
        />
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Можно выбрать только даты начиная с сегодняшнего дня
        </div>
      </div>
    );
  },
};

/**
 * С ограничением максимальной даты (только прошлые даты)
 */
export const WithMaxDate: Story = {
  render: function WithMaxDateStory() {
    const [value, setValue] = useState<Date | null>(null);
    const today = new Date();
    
    return (
      <div style={{ width: '400px' }}>
        <AppDatePicker
          label="Дата рождения"
          placeholder="Выберите дату"
          value={value}
          onChange={setValue}
          maxDate={today}
        />
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Можно выбрать только даты до сегодняшнего дня
        </div>
      </div>
    );
  },
};

/**
 * С диапазоном дат (минимум и максимум)
 */
export const WithDateRange: Story = {
  render: function WithDateRangeStory() {
    const [value, setValue] = useState<Date | null>(null);
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    return (
      <div style={{ width: '400px' }}>
        <AppDatePicker
          label="Дата визита"
          placeholder="Выберите дату"
          value={value}
          onChange={setValue}
          minDate={minDate}
          maxDate={maxDate}
        />
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Доступны даты в течение следующего месяца
        </div>
      </div>
    );
  },
};

/**
 * С отключенными конкретными датами
 */
export const WithDisabledDates: Story = {
  render: function WithDisabledDatesStory() {
    const [value, setValue] = useState<Date | null>(null);
    const today = new Date();
    
    // Отключаем выходные дни текущей недели
    const disabledDates = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    ];
    
    return (
      <div style={{ width: '400px' }}>
        <AppDatePicker
          label="Дата встречи"
          placeholder="Выберите дату"
          value={value}
          onChange={setValue}
          disabledDates={disabledDates}
        />
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
          Некоторые даты отключены (например, выходные)
        </div>
      </div>
    );
  },
};

/**
 * Английская локализация
 */
export const EnglishLocale: Story = {
  render: function EnglishLocaleStory() {
    const [value, setValue] = useState<Date | null>(new Date());
    return (
      <div style={{ width: '400px' }}>
        <AppDatePicker
          label="Date"
          placeholder="Select date"
          value={value}
          onChange={setValue}
          locale="en"
        />
      </div>
    );
  },
};

/**
 * Интерактивный пример для полного тестирования
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [value, setValue] = useState<Date | null>(null);
    const [withRestrictions, setWithRestrictions] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [showError, setShowError] = useState(false);
    const [locale, setLocale] = useState<'ru' | 'en'>('ru');
    
    const today = new Date();
    const minDate = withRestrictions ? today : undefined;
    const maxDate = withRestrictions 
      ? new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
      : undefined;
    
    return (
      <div style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <AppDatePicker
          label="Выберите дату"
          placeholder="Выберите дату"
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            setShowError(false);
          }}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          error={showError ? 'Пожалуйста, выберите дату' : undefined}
          required
          locale={locale}
        />
        
        <div style={{ 
          padding: '16px', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <strong>Выбранная дата:</strong>
            <div>{value ? value.toLocaleDateString('ru-RU', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            }) : 'Не выбрано'}</div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #ddd'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={withRestrictions}
                onChange={(e) => setWithRestrictions(e.target.checked)}
              />
              Включить ограничения дат (только след. месяц)
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              Отключить компонент
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={showError}
                onChange={(e) => setShowError(e.target.checked)}
              />
              Показать ошибку
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Локаль:</span>
              <select 
                value={locale} 
                onChange={(e) => setLocale(e.target.value as 'ru' | 'en')}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Несколько DatePicker на одной странице
 */
export const MultipleDatePickers: Story = {
  render: function MultipleDatePickersStory() {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    
    const today = new Date();
    
    return (
      <div style={{ 
        width: '500px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px' 
      }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-onest)' }}>Форма бронирования</h3>
        
        <AppDatePicker
          label="Дата начала"
          placeholder="Выберите дату начала"
          value={startDate}
          onChange={(date) => {
            setStartDate(date);
            if (endDate && date && date > endDate) {
              setEndDate(null);
            }
          }}
          minDate={today}
          required
        />
        
        <AppDatePicker
          label="Дата окончания"
          placeholder="Выберите дату окончания"
          value={endDate}
          onChange={setEndDate}
          minDate={startDate || today}
          required
          disabled={!startDate}
        />
        
        <AppDatePicker
          label="Дата рождения"
          placeholder="Выберите дату рождения"
          value={birthDate}
          onChange={setBirthDate}
          maxDate={today}
        />
        
        <div style={{ 
          padding: '16px', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <strong>Выбранные даты:</strong>
          <div>Начало: {startDate ? startDate.toLocaleDateString('ru-RU') : '-'}</div>
          <div>Окончание: {endDate ? endDate.toLocaleDateString('ru-RU') : '-'}</div>
          <div>День рождения: {birthDate ? birthDate.toLocaleDateString('ru-RU') : '-'}</div>
        </div>
      </div>
    );
  },
};
