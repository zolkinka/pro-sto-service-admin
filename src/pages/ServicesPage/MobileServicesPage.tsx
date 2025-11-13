import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { servicesStore } from '@/stores';
import type { ServiceDto } from '../../../services/api-client';
import MobileCategoryTabs from '../../mobile-components/MobileCategoryTabs/MobileCategoryTabs';
import MobileServiceCard from '../../mobile-components/MobileServiceCard/MobileServiceCard';
import MobileServiceModal from '../../mobile-components/MobileServiceModal/MobileServiceModal';
import MobileConfirmDeleteModal from '../../mobile-components/MobileConfirmDeleteModal/MobileConfirmDeleteModal';
import './MobileServicesPage.css';

// Иконка документа для empty state
const NotesIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 14C8 11.7909 9.79086 10 12 10H22L28 16V36C28 38.2091 26.2091 40 24 40H12C9.79086 40 8 38.2091 8 36V14Z" fill="#F4F3F0"/>
    <path d="M22 10L28 16H24C22.8954 16 22 15.1046 22 14V10Z" fill="#DFDFDF"/>
    <path d="M14 22H22M14 26H22M14 30H18" stroke="#888684" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Иконка плюса для кнопки добавить
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 5V15M5 10H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MobileServicesPage = observer(() => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{
    uuid: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Состояние для модала создания/редактирования услуги
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<'create' | 'edit'>('create');
  const [serviceToEdit, setServiceToEdit] = useState<ServiceDto | undefined>(undefined);
  const [serviceModalType, setServiceModalType] = useState<'main' | 'additional'>('main');

  // Загрузка услуг при монтировании компонента
  useEffect(() => {
    servicesStore.fetchServices();
  }, []);

  // Обработчик добавления услуги
  const handleAddService = (serviceType: 'main' | 'additional') => {
    setServiceModalMode('create');
    setServiceModalType(serviceType);
    setServiceToEdit(undefined);
    setServiceModalOpen(true);
  };

  // Обработчик редактирования услуги
  const handleEditService = (uuid: string) => {
    const service = servicesStore.services.find((s: ServiceDto) => s.uuid === uuid);
    if (service) {
      setServiceModalMode('edit');
      setServiceModalType(service.service_type);
      setServiceToEdit(service);
      setServiceModalOpen(true);
    }
  };

  // Обработчик закрытия модала редактирования
  const handleCloseServiceModal = () => {
    setServiceModalOpen(false);
    setServiceToEdit(undefined);
  };

  // Обработчик открытия модального окна удаления
  const handleDeleteService = (uuid: string) => {
    const service = servicesStore.services.find((s: ServiceDto) => s.uuid === uuid);
    if (service) {
      setServiceToDelete({ uuid: service.uuid, name: service.name });
      setDeleteModalOpen(true);
    }
  };

  // Обработчик подтверждения удаления
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    const success = await servicesStore.deleteService(serviceToDelete.uuid);
    setIsDeleting(false);

    if (success) {
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    }
  };

  // Обработчик отмены удаления
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  // Обработчик изменения категории
  const handleCategoryChange = (category: 'car_wash' | 'tire_service' | 'auto_service') => {
    // Для auto_service пока не меняем категорию в стор, так как API не поддерживает
    if (category !== 'auto_service') {
      servicesStore.setActiveCategory(category);
    }
  };

  // Компонент пустого состояния
  const EmptyState = ({ text }: { text: string }) => (
    <div className="mobile-services-page__empty-state">
      <p className="mobile-services-page__empty-text">{text}</p>
      <NotesIcon />
    </div>
  );

  if (servicesStore.isLoading) {
    return (
      <div className="mobile-services-page">
        <div className="mobile-services-page__loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="mobile-services-page">
      {/* Сегментный контроль */}
      <MobileCategoryTabs
        activeCategory={servicesStore.activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Секция основных услуг */}
      <div className="mobile-services-page__section">
        <div className="mobile-services-page__header">
          <h2 className="mobile-services-page__title">Услуги</h2>
          <button
            className="mobile-services-page__add-button-group"
            onClick={() => handleAddService('main')}
            type="button"
          >
            <span className="mobile-services-page__add-text">Добавить</span>
            <div className="mobile-services-page__add-icon">
              <PlusIcon />
            </div>
          </button>
        </div>

        {servicesStore.mainServices.length === 0 ? (
          <EmptyState text="Добавьте услуги, чтобы завершить создание вашего сервиса." />
        ) : (
          <div className="mobile-services-page__services">
            {servicesStore.mainServices.map((service) => (
              <MobileServiceCard
                key={service.uuid}
                service={service}
                onEdit={handleEditService}
                onDelete={handleDeleteService}
              />
            ))}
          </div>
        )}
      </div>

      {/* Секция дополнительных услуг */}
      <div className="mobile-services-page__section">
        <div className="mobile-services-page__header">
          <h2 className="mobile-services-page__title">Доп. услуги</h2>
          <button
            className="mobile-services-page__add-button-group"
            onClick={() => handleAddService('additional')}
            type="button"
          >
            <span className="mobile-services-page__add-text">Добавить</span>
            <div className="mobile-services-page__add-icon">
              <PlusIcon />
            </div>
          </button>
        </div>

        {servicesStore.additionalServices.length === 0 ? (
          <EmptyState text="Добавьте услуги, чтобы завершить создание вашего сервиса." />
        ) : (
          <div className="mobile-services-page__services">
            {servicesStore.additionalServices.map((service) => (
              <MobileServiceCard
                key={service.uuid}
                service={service}
                onEdit={handleEditService}
                onDelete={handleDeleteService}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно подтверждения удаления */}
      <MobileConfirmDeleteModal
        isOpen={deleteModalOpen}
        serviceName={serviceToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      {/* Модальное окно создания/редактирования услуги */}
      <MobileServiceModal
        isOpen={serviceModalOpen}
        onClose={handleCloseServiceModal}
        mode={serviceModalMode}
        service={serviceToEdit}
        serviceType={serviceModalType}
      />
    </div>
  );
});

MobileServicesPage.displayName = 'MobileServicesPage';

export default MobileServicesPage;
