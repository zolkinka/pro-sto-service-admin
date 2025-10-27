import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import type { ServiceDto } from '../../../services/api-client';
import { servicesStore, authStore, toastStore } from '@/stores';
import AppInput from '@/components/ui/AppInput';
import AppNumberInput from '@/components/ui/AppNumberInput';

import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalContent,
  Section,
  SectionTitle,
  InputsContainer,
  PricesGrid,
  PriceRow,
  PriceInputWrapper,
  ModalFooter,
  ModalButton,
  TextArea,
  TextAreaLabel,
  TextAreaWrapper,
} from './ServiceModal.styles';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  service?: ServiceDto;
  serviceType: 'main' | 'additional';
}

interface FormData {
  name: string;
  description: string;
  duration_minutes: string;
  prices: {
    sedan: string;
    crossover: string;
    suv: string;
    minivan: string;
  };
}

interface ValidationErrors {
  name?: string;
  duration_minutes?: string;
  sedan?: string;
  crossover?: string;
  suv?: string;
  minivan?: string;
}

const ServiceModal: React.FC<ServiceModalProps> = observer(({
  isOpen,
  onClose,
  mode,
  service,
  serviceType,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    duration_minutes: '',
    prices: {
      sedan: '',
      crossover: '',
      suv: '',
      minivan: '',
    },
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Блокируем скролл страницы когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущее значение overflow
      const originalOverflow = document.body.style.overflow;
      // Блокируем скролл
      document.body.style.overflow = 'hidden';
      
      // Восстанавливаем скролл при закрытии
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Инициализация данных формы при открытии модала
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && service) {
        // Заполняем форму данными существующей услуги
        const priceMap = {
          sedan: '',
          crossover: '',
          suv: '',
          minivan: '',
        };

        // Извлекаем цены из servicePrices (округляем до целых рублей)
        service.servicePrices?.forEach((sp) => {
          const paramValue = sp.parameter_value as keyof typeof priceMap;
          if (paramValue && sp.price !== undefined) {
            // Используем Math.round для округления до целых рублей
            priceMap[paramValue] = Math.round(sp.price).toString();
          }
        });

        setFormData({
          name: service.name || '',
          description: service.description || '',
          duration_minutes: service.duration_minutes?.toString() || '',
          prices: priceMap,
        });
      } else {
        // Сброс формы для создания новой услуги
        setFormData({
          name: '',
          description: '',
          duration_minutes: '',
          prices: {
            sedan: '',
            crossover: '',
            suv: '',
            minivan: '',
          },
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, service]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Очищаем ошибку при изменении поля
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handlePriceChange = (carClass: keyof FormData['prices'], value: string) => {
    // AppNumberInput уже фильтрует ввод, оставляя только целые числа
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [carClass]: value,
      },
    }));
    // Очищаем ошибку при изменении поля
    if (errors[carClass]) {
      setErrors((prev) => ({
        ...prev,
        [carClass]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Валидация названия
    if (!formData.name.trim()) {
      newErrors.name = 'Обязательное поле';
    }

    // Валидация продолжительности
    const duration = parseInt(formData.duration_minutes);
    if (!formData.duration_minutes.trim()) {
      newErrors.duration_minutes = 'Обязательное поле';
    } else if (isNaN(duration) || duration <= 0) {
      newErrors.duration_minutes = 'Должно быть больше 0';
    }

    // Валидация цен (используем parseInt для целых рублей)
    const carClasses: Array<keyof FormData['prices']> = ['sedan', 'crossover', 'suv', 'minivan'];
    carClasses.forEach((carClass) => {
      const price = parseInt(formData.prices[carClass]);
      if (!formData.prices[carClass].trim()) {
        newErrors[carClass] = 'Обязательное поле';
      } else if (isNaN(price) || price < 0) {
        newErrors[carClass] = 'Должно быть >= 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const user = authStore.user;
    
    if (!user?.service_center_uuid) {
      console.error('service_center_uuid не найден в user объекте');
      toastStore.showError('Ошибка: не указан сервисный центр');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Формируем массив цен (используем parseInt для целых рублей)
      const servicePrices = [
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'sedan',
          price: parseInt(formData.prices.sedan),
          is_active: true,
        },
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'crossover',
          price: parseInt(formData.prices.crossover),
          is_active: true,
        },
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'suv',
          price: parseInt(formData.prices.suv),
          is_active: true,
        },
        {
          parameter_type: 'simple_car_class' as const,
          parameter_value: 'minivan',
          price: parseInt(formData.prices.minivan),
          is_active: true,
        },
      ];

      if (mode === 'create') {
        // Создание новой услуги
        await servicesStore.createService({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          duration_minutes: parseInt(formData.duration_minutes),
          category: '', // Пока не используется
          business_type: servicesStore.activeCategory,
          service_type: serviceType,
          servicePrices,
          service_center_uuid: user.service_center_uuid,
        });
      } else if (mode === 'edit' && service) {
        // Обновление существующей услуги
        await servicesStore.updateService(service.uuid, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          duration_minutes: parseInt(formData.duration_minutes),
          category: '', // Пока не используется
          business_type: servicesStore.activeCategory,
          service_type: serviceType,
          servicePrices,
        });
      }

      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении услуги:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        {/* Заголовок */}
        <ModalHeader>
          <ModalTitle>Услуги</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CloseButton>
        </ModalHeader>

        {/* Контент */}
        <ModalContent>
          {/* Секция: Основное */}
          <Section>
            <SectionTitle>Основное</SectionTitle>
            <InputsContainer>
              {/* Название услуги */}
              <AppInput
                label="Название услуги"
                placeholder="Эконом мойка"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                error={errors.name}
                disabled={isSubmitting}
              />

              {/* Описание */}
              <TextAreaWrapper>
                <TextAreaLabel>Описание</TextAreaLabel>
                <TextArea
                  placeholder="Быстрая мойка кузова и стекол"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isSubmitting}
                  rows={2}
                />
              </TextAreaWrapper>

              {/* Продолжительность */}
              <AppNumberInput
                label="Продолжительность"
                placeholder="40"
                value={formData.duration_minutes}
                onChange={(value) => handleInputChange('duration_minutes', value)}
                error={errors.duration_minutes}
                disabled={isSubmitting}
                min={1}
                suffix="мин"
              />
            </InputsContainer>
          </Section>

          {/* Секция: Цены */}
          <Section>
            <SectionTitle>Цены</SectionTitle>
            <PricesGrid>
              {/* Первая строка: Легковой и Кроссовер */}
              <PriceRow>
                <PriceInputWrapper>
                  <AppNumberInput
                    label="Легковой"
                    placeholder="600"
                    value={formData.prices.sedan}
                    onChange={(value) => handlePriceChange('sedan', value)}
                    error={errors.sedan}
                    disabled={isSubmitting}
                    min={0}
                    suffix="₽"
                  />
                </PriceInputWrapper>
                <PriceInputWrapper>
                  <AppNumberInput
                    label="Кроссовер"
                    placeholder="600"
                    value={formData.prices.crossover}
                    onChange={(value) => handlePriceChange('crossover', value)}
                    error={errors.crossover}
                    disabled={isSubmitting}
                    min={0}
                    suffix="₽"
                  />
                </PriceInputWrapper>
              </PriceRow>

              {/* Вторая строка: Внедорожник и Минивен */}
              <PriceRow>
                <PriceInputWrapper>
                  <AppNumberInput
                    label="Внедорожник"
                    placeholder="600"
                    value={formData.prices.suv}
                    onChange={(value) => handlePriceChange('suv', value)}
                    error={errors.suv}
                    disabled={isSubmitting}
                    min={0}
                    suffix="₽"
                  />
                </PriceInputWrapper>
                <PriceInputWrapper>
                  <AppNumberInput
                    label="Минивен"
                    placeholder="600"
                    value={formData.prices.minivan}
                    onChange={(value) => handlePriceChange('minivan', value)}
                    error={errors.minivan}
                    disabled={isSubmitting}
                    min={0}
                    suffix="₽"
                  />
                </PriceInputWrapper>
              </PriceRow>
            </PricesGrid>
          </Section>
        </ModalContent>

        {/* Футер с кнопками */}
        <ModalFooter>
          <ModalButton onClick={onClose} disabled={isSubmitting}>
            Отмена
          </ModalButton>
          <ModalButton $variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? 'Сохранение...'
              : mode === 'create'
              ? 'Добавить'
              : 'Сохранить'}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
});

ServiceModal.displayName = 'ServiceModal';

export default ServiceModal;
