import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import type { ServiceDto } from '../../../services/api-client';
import { servicesStore, authStore } from '@/stores';
import MobileButton from '../MobileButton/MobileButton';
import MobileInput from '../MobileInput/MobileInput';
import './MobileServiceModal.css';

export interface MobileServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  service?: ServiceDto;
  serviceType: 'main' | 'additional';
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 7L14 12L10 17" transform="rotate(180 12 12)" stroke="#302F2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MobileServiceModal: React.FC<MobileServiceModalProps> = observer(({
  isOpen,
  onClose,
  mode,
  service,
  serviceType,
}) => {
  // Инициализация формы при открытии
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && service) {
        servicesStore.initEditForm(service);
      } else {
        servicesStore.initCreateForm();
      }
    }
  }, [mode, service, isOpen]);

  // Блокируем скролл при открытии модала
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceCenterUuid = authStore.user?.service_center_uuid;
    if (!serviceCenterUuid) {
      console.error('Service center UUID not found');
      return;
    }

    const success = await servicesStore.submitServiceForm(
      mode,
      serviceCenterUuid,
      serviceType,
      service?.uuid
    );

    if (success) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-service-modal">
      <div className="mobile-service-modal__header">
        <button
          className="mobile-service-modal__back-button"
          onClick={onClose}
          type="button"
          aria-label="Назад"
        >
          <BackIcon />
        </button>
        <h1 className="mobile-service-modal__title">Услуги</h1>
      </div>

      <form className="mobile-service-modal__form" onSubmit={handleSubmit}>
        <div className="mobile-service-modal__content">
          {/* Секция Основное */}
          <div className="mobile-service-modal__section">
            <h2 className="mobile-service-modal__section-title">Основное</h2>
            <div className="mobile-service-modal__fields">
              <MobileInput
                label="Название услуги"
                value={servicesStore.formData.name}
                onChange={(value) => servicesStore.updateFormField('name', value)}
                placeholder="Эконом мойка"
                error={servicesStore.formErrors.name}
              />
              <MobileInput
                label="Описание"
                value={servicesStore.formData.description}
                onChange={(value) => servicesStore.updateFormField('description', value)}
                placeholder="Быстрая мойка кузова и стекол"
              />
              <MobileInput
                label="Продолжительность (мин)"
                value={servicesStore.formData.duration}
                onChange={(value) => servicesStore.updateFormField('duration', value)}
                placeholder="40"
                type="number"
                inputMode="numeric"
                error={servicesStore.formErrors.duration}
              />
            </div>
          </div>

          {/* Секция Цены */}
          <div className="mobile-service-modal__section">
            <h2 className="mobile-service-modal__section-title">Цены</h2>
            <div className="mobile-service-modal__fields">
              <div className="mobile-service-modal__price-row">
                <MobileInput
                  label="Легковой (₽)"
                  value={servicesStore.formData.priceSedan}
                  onChange={(value) => servicesStore.updateFormField('priceSedan', value)}
                  placeholder="600"
                  type="number"
                  inputMode="numeric"
                  error={servicesStore.formErrors.priceSedan}
                />
                <MobileInput
                  label="Кроссовер (₽)"
                  value={servicesStore.formData.priceCrossover}
                  onChange={(value) => servicesStore.updateFormField('priceCrossover', value)}
                  placeholder="700"
                  type="number"
                  inputMode="numeric"
                  error={servicesStore.formErrors.priceCrossover}
                />
              </div>
              <div className="mobile-service-modal__price-row">
                <MobileInput
                  label="Внедорожник (₽)"
                  value={servicesStore.formData.priceSuv}
                  onChange={(value) => servicesStore.updateFormField('priceSuv', value)}
                  placeholder="800"
                  type="number"
                  inputMode="numeric"
                  error={servicesStore.formErrors.priceSuv}
                />
                <MobileInput
                  label="Минивен (₽)"
                  value={servicesStore.formData.priceMinivan}
                  onChange={(value) => servicesStore.updateFormField('priceMinivan', value)}
                  placeholder="900"
                  type="number"
                  inputMode="numeric"
                  error={servicesStore.formErrors.priceMinivan}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Футер с кнопками */}
        <div className="mobile-service-modal__footer">
          <MobileButton
            variant="secondary"
            onClick={onClose}
            type="button"
            disabled={servicesStore.isSubmitting}
          >
            Отмена
          </MobileButton>
          <MobileButton
            variant="primary"
            type="submit"
            loading={servicesStore.isSubmitting}
            disabled={servicesStore.isSubmitting}
          >
            {mode === 'create' ? 'Добавить' : 'Сохранить'}
          </MobileButton>
        </div>
      </form>
    </div>
  );
});

MobileServiceModal.displayName = 'MobileServiceModal';

export default MobileServiceModal;
