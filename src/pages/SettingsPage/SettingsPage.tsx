import React from 'react';
import { observer } from 'mobx-react-lite';
import NotificationSettings from '@/components/NotificationSettings';
import './SettingsPage.css';

/**
 * Страница настроек админ-панели
 */
const SettingsPage: React.FC = observer(() => {
  return (
    <div className="settings-page">
      <div className="settings-page__container">
        <header className="settings-page__header">
          <h1 className="settings-page__title">Настройки</h1>
          <p className="settings-page__description">
            Управление параметрами и настройками админ-панели
          </p>
        </header>

        <div className="settings-page__content">
          {/* Секция уведомлений */}
          <section className="settings-page__section">
            <NotificationSettings />
          </section>

          {/* Здесь можно добавить другие секции настроек в будущем */}
          {/* 
          <section className="settings-page__section">
            <ProfileSettings />
          </section>
          
          <section className="settings-page__section">
            <SecuritySettings />
          </section>
          */}
        </div>
      </div>
    </div>
  );
});

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;
