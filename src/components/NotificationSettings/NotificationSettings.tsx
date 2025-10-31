import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import AppSwitch from '@/components/ui/AppSwitch/AppSwitch';
import AppButton from '@/components/ui/AppButton/AppButton';
import { notificationService, NotificationType } from '@/services/notificationService';
import { toastStore } from '@/stores/ToastStore';
import type { NotificationSettingsProps } from './NotificationSettings.types';
import './NotificationSettings.css';

/**
 * Компонент для управления настройками уведомлений
 * Позволяет включать/выключать уведомления и настраивать типы уведомлений
 */
const NotificationSettings: React.FC<NotificationSettingsProps> = observer(({
  className,
  'data-testid': dataTestId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState(notificationService.getSettings());

  // Проверяем поддержку уведомлений при монтировании
  useEffect(() => {
    const checkSupport = async () => {
      const supported = await notificationService.isSupported();
      setIsSupported(supported);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Обновляем локальное состояние при изменении настроек в сервисе
  useEffect(() => {
    const updateSettings = () => {
      setSettings(notificationService.getSettings());
    };

    // Подписываемся на изменения
    const interval = setInterval(updateSettings, 1000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Обработчик включения/выключения уведомлений
   */
  const handleToggleNotifications = async (checked: boolean) => {
    setIsLoading(true);

    try {
      if (checked && permission !== 'granted') {
        // Запрашиваем разрешение
        const newPermission = await notificationService.requestPermission();
        setPermission(newPermission);

        if (newPermission !== 'granted') {
          toastStore.showWarning('Для включения уведомлений необходимо разрешение браузера');
          setIsLoading(false);
          return;
        }
      }

      // Обновляем настройки
      await notificationService.updateSettings({ enabled: checked });
      setSettings(notificationService.getSettings());

      if (checked) {
        // Инициализируем уведомления
        const initialized = await notificationService.initialize();
        if (initialized) {
          toastStore.showSuccess('Уведомления успешно включены');
        } else {
          toastStore.showError('Не удалось включить уведомления');
        }
      } else {
        toastStore.showInfo('Уведомления отключены');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toastStore.showError('Произошла ошибка при изменении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработчик изменения типа уведомления
   */
  const handleToggleNotificationType = async (type: NotificationType, checked: boolean) => {
    try {
      const updatedSettings = {
        ...settings,
        types: {
          ...settings.types,
          [type]: checked,
        },
      };

      await notificationService.updateSettings(updatedSettings);
      setSettings(notificationService.getSettings());
    } catch (error) {
      console.error('Error updating notification type:', error);
      toastStore.showError('Не удалось обновить настройки');
    }
  };

  /**
   * Получить читаемое название типа уведомления
   */
  const getNotificationTypeName = (type: NotificationType): string => {
    const names: Record<NotificationType, string> = {
      [NotificationType.NEW_BOOKING]: 'Новые бронирования',
      [NotificationType.STATUS_CHANGE]: 'Изменения статуса заказов',
      [NotificationType.REMINDERS]: 'Напоминания',
      [NotificationType.PROMOTIONS]: 'Промо-акции',
    };

    return names[type] || type;
  };

  /**
   * Обработчик тестового уведомления
   */
  const handleTestNotification = () => {
    if (permission === 'granted') {
      toastStore.showInfo('Тестовое уведомление отправлено', 'Уведомление');
    } else {
      toastStore.showWarning('Сначала разрешите уведомления');
    }
  };

  const containerClasses = classNames(
    'notification-settings',
    className
  );

  // Если уведомления не поддерживаются
  if (!isSupported) {
    return (
      <div className={containerClasses} data-testid={dataTestId}>
        <div className="notification-settings__unsupported">
          <p className="notification-settings__unsupported-text">
            Уведомления не поддерживаются в вашем браузере или Firebase не настроен
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} data-testid={dataTestId}>
      <div className="notification-settings__header">
        <h3 className="notification-settings__title">Настройки уведомлений</h3>
        <p className="notification-settings__description">
          Управляйте типами уведомлений, которые вы хотите получать
        </p>
      </div>

      {/* Главный переключатель */}
      <div className="notification-settings__section">
        <div className="notification-settings__main-toggle">
          <AppSwitch
            size="L"
            checked={settings.enabled}
            disabled={isLoading}
            onChange={handleToggleNotifications}
            label="Включить уведомления"
          />
        </div>

        {permission === 'denied' && (
          <div className="notification-settings__warning">
            <p className="notification-settings__warning-text">
              Уведомления заблокированы в настройках браузера. 
              Пожалуйста, разрешите уведомления для этого сайта.
            </p>
          </div>
        )}
      </div>

      {/* Типы уведомлений */}
      {settings.enabled && (
        <div className="notification-settings__section">
          <h4 className="notification-settings__subtitle">Типы уведомлений</h4>
          
          <div className="notification-settings__types">
            {Object.values(NotificationType).map((type) => (
              <div key={type} className="notification-settings__type-item">
                <AppSwitch
                  size="M"
                  checked={settings.types[type]}
                  disabled={isLoading || !settings.enabled}
                  onChange={(checked) => handleToggleNotificationType(type, checked)}
                  label={getNotificationTypeName(type)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Тестовая кнопка */}
      {settings.enabled && permission === 'granted' && (
        <div className="notification-settings__actions">
          <AppButton
            variant="secondary"
            size="M"
            onClick={handleTestNotification}
            disabled={isLoading}
          >
            Отправить тестовое уведомление
          </AppButton>
        </div>
      )}

      {/* Информация о токене (только для разработки) */}
      {import.meta.env.DEV && settings.enabled && (
        <div className="notification-settings__debug">
          <details>
            <summary className="notification-settings__debug-summary">
              Информация для разработки
            </summary>
            <div className="notification-settings__debug-content">
              <p><strong>Токен:</strong></p>
              <code className="notification-settings__debug-token">
                {notificationService.getCurrentToken() || 'Не получен'}
              </code>
              <p><strong>Разрешение:</strong> {permission}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
});

NotificationSettings.displayName = 'NotificationSettings';

export default NotificationSettings;
