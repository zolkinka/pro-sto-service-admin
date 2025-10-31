import type { Meta, StoryObj } from '@storybook/react';
import NotificationSettings from './NotificationSettings';

const meta: Meta<typeof NotificationSettings> = {
  title: 'Components/NotificationSettings',
  component: NotificationSettings,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Компонент для управления настройками push-уведомлений через Firebase Cloud Messaging.

## Особенности
- Запрос разрешения на уведомления у пользователя
- Управление типами уведомлений
- Интеграция с Firebase Messaging
- Отправка токена на сервер
- Тестовые уведомления
- Debug информация в режиме разработки

## Требования
- Firebase должен быть настроен в .env
- Service Worker должен быть зарегистрирован
- Браузер должен поддерживать Notification API
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовый пример компонента настроек уведомлений
 */
export const Default: Story = {
  args: {},
};

/**
 * Компонент в контейнере с определенной шириной
 */
export const InContainer: Story = {
  render: () => (
    <div style={{ width: '600px', padding: '20px', background: '#F9F8F5' }}>
      <NotificationSettings />
    </div>
  ),
};

/**
 * Компонент на мобильном экране
 */
export const Mobile: Story = {
  render: () => (
    <div style={{ width: '375px', padding: '16px', background: '#F9F8F5' }}>
      <NotificationSettings />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Пример использования в настройках профиля
 */
export const InProfileSettings: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '800px', 
      padding: '24px', 
      background: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #F4F3F0'
    }}>
      <h2 style={{ 
        margin: '0 0 24px 0',
        fontFamily: 'Onest, sans-serif',
        fontSize: '24px',
        fontWeight: 600,
        color: '#302F2D'
      }}>
        Настройки профиля
      </h2>
      
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontFamily: 'Onest, sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          color: '#302F2D'
        }}>
          Личные данные
        </h3>
        <div style={{
          padding: '16px',
          background: '#F9F8F5',
          borderRadius: '8px',
          fontFamily: 'Onest, sans-serif',
          fontSize: '14px',
          color: '#53514F'
        }}>
          Здесь могут быть другие настройки профиля...
        </div>
      </div>

      <NotificationSettings />
    </div>
  ),
};
