import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { servicesStore } from '@/stores';
import type { ServiceDto } from '../../../services/api-client';
import ServicesSection from './ServicesSection';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ServiceModal from './ServiceModal';
import { PageContainer, MainContainer } from './ServicesPage.styles';

const ServicesPage = observer(() => {
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
  const handleCategoryChange = (category: 'car_wash' | 'tire_service') => {
    servicesStore.setActiveCategory(category);
  };

  if (servicesStore.isLoading) {
    return (
      <PageContainer>
        <MainContainer>
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#888684',
              fontFamily: 'Onest, sans-serif',
            }}
          >
            Загрузка услуг...
          </div>
        </MainContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <MainContainer>
        {/* Секция основных услуг */}
        <ServicesSection
          title="Услуги"
          serviceType="main"
          services={servicesStore.mainServices}
          activeCategory={servicesStore.activeCategory}
          onCategoryChange={handleCategoryChange}
          onAddService={handleAddService}
          onEditService={handleEditService}
          onDeleteService={handleDeleteService}
        />

        {/* Секция дополнительных услуг */}
        <ServicesSection
          title="Дополнительные услуги"
          serviceType="additional"
          services={servicesStore.additionalServices}
          activeCategory={servicesStore.activeCategory}
          onAddService={handleAddService}
          onEditService={handleEditService}
          onDeleteService={handleDeleteService}
        />

        {/* Модальное окно подтверждения удаления */}
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          serviceName={serviceToDelete?.name || ''}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />

        {/* Модальное окно создания/редактирования услуги */}
        <ServiceModal
          isOpen={serviceModalOpen}
          onClose={handleCloseServiceModal}
          mode={serviceModalMode}
          service={serviceToEdit}
          serviceType={serviceModalType}
        />
      </MainContainer>
    </PageContainer>
  );
});

ServicesPage.displayName = 'ServicesPage';

export default ServicesPage;
