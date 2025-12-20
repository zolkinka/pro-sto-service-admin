import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ServicesStore } from '../ServicesStore';
import type { ServiceDto, CreateServiceDto, UpdateServiceDto } from '../../../services/api-client';
import * as apiClient from '../../../services/api-client';
import { toastStore } from '../ToastStore';

// Mock API client
vi.mock('../../../services/api-client', () => ({
  adminServicesGetAll: vi.fn(),
  adminServicesDelete: vi.fn(),
  adminServicesCreate: vi.fn(),
  adminServicesUpdate: vi.fn(),
}));

// Mock ToastStore
vi.mock('../ToastStore', () => ({
  toastStore: {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  },
}));

describe('ServicesStore', () => {
  let servicesStore: ServicesStore;

  const mockService: ServiceDto = {
    uuid: 'service-1',
    name: 'Комплексная мойка',
    description: 'Полная мойка автомобиля',
    duration_minutes: 60,
    category: 'standard',
    business_type: 'car_wash',
    service_type: 'main',
    servicePrices: [
      {
        parameter_type: 'simple_car_class',
        parameter_value: 'sedan',
        price: 1000,
        is_active: true,
      },
      {
        parameter_type: 'simple_car_class',
        parameter_value: 'crossover',
        price: 1200,
        is_active: true,
      },
      {
        parameter_type: 'simple_car_class',
        parameter_value: 'suv',
        price: 1500,
        is_active: true,
      },
      {
        parameter_type: 'simple_car_class',
        parameter_value: 'minivan',
        price: 1800,
        is_active: true,
      },
    ],
  } as ServiceDto;

  const mockAdditionalService: ServiceDto = {
    ...mockService,
    uuid: 'service-2',
    name: 'Полировка фар',
    service_type: 'additional',
  } as ServiceDto;

  beforeEach(() => {
    vi.clearAllMocks();
    servicesStore = new ServicesStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(servicesStore.services).toEqual([]);
      expect(servicesStore.activeCategory).toBe('car_wash');
      expect(servicesStore.isLoading).toBe(false);
      expect(servicesStore.error).toBe(null);
      expect(servicesStore.isSubmitting).toBe(false);
    });

    it('should initialize form data with empty values', () => {
      expect(servicesStore.formData).toEqual({
        name: '',
        description: '',
        duration: '',
        priceSedan: '',
        priceCrossover: '',
        priceSuv: '',
        priceMinivan: '',
      });
      expect(servicesStore.formErrors).toEqual({});
    });
  });

  describe('fetchServices', () => {
    it('should fetch services successfully', async () => {
      const mockServices = [mockService, mockAdditionalService];
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(mockServices as any);

      await servicesStore.fetchServices();

      expect(apiClient.adminServicesGetAll).toHaveBeenCalledWith({
        businessType: 'car_wash',
      });
      expect(servicesStore.services).toEqual(mockServices);
      expect(servicesStore.isLoading).toBe(false);
      expect(servicesStore.error).toBe(null);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.adminServicesGetAll).mockRejectedValue(error);

      await servicesStore.fetchServices();

      expect(servicesStore.error).toBe('Ошибка загрузки услуг');
      expect(servicesStore.isLoading).toBe(false);
      expect(toastStore.showError).toHaveBeenCalledWith('Не удалось загрузить услуги');
    });

    it('should set isLoading to true during fetch', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockImplementation((() => {
        expect(servicesStore.isLoading).toBe(true);
        return Promise.resolve([mockService]) as any;
      }) as any);

      await servicesStore.fetchServices();
    });
  });

  describe('setActiveCategory', () => {
    it('should change active category and fetch services', async () => {
      const fetchSpy = vi.spyOn(servicesStore, 'fetchServices');
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue([mockService] as any);

      servicesStore.setActiveCategory('tire_service');

      expect(servicesStore.activeCategory).toBe('tire_service');
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('deleteService', () => {
    it('should delete service successfully', async () => {
      servicesStore.services = [mockService, mockAdditionalService];
      vi.mocked(apiClient.adminServicesDelete).mockResolvedValue(undefined);

      const result = await servicesStore.deleteService('service-1');

      expect(apiClient.adminServicesDelete).toHaveBeenCalledWith({ uuid: 'service-1' });
      expect(servicesStore.services).toHaveLength(1);
      expect(servicesStore.services[0].uuid).toBe('service-2');
      expect(toastStore.showSuccess).toHaveBeenCalledWith('Услуга успешно удалена');
      expect(result).toBe(true);
    });

    it('should handle delete error', async () => {
      const error = new Error('Delete failed');
      vi.mocked(apiClient.adminServicesDelete).mockRejectedValue(error);

      const result = await servicesStore.deleteService('service-1');

      expect(toastStore.showError).toHaveBeenCalledWith('Не удалось удалить услугу');
      expect(result).toBe(false);
    });
  });

  describe('Computed properties', () => {
    beforeEach(() => {
      servicesStore.services = [mockService, mockAdditionalService];
    });

    it('should return available categories', () => {
      const categories = servicesStore.availableCategories;
      expect(categories).toContain('car_wash');
      expect(categories).toHaveLength(1);
    });

    it('should return main services for active category', () => {
      const mainServices = servicesStore.mainServices;
      expect(mainServices).toHaveLength(1);
      expect(mainServices[0].service_type).toBe('main');
      expect(mainServices[0].uuid).toBe('service-1');
    });

    it('should return additional services for active category', () => {
      const additionalServices = servicesStore.additionalServices;
      expect(additionalServices).toHaveLength(1);
      expect(additionalServices[0].service_type).toBe('additional');
      expect(additionalServices[0].uuid).toBe('service-2');
    });

    it('should filter services by active category', () => {
      const tireService: ServiceDto = {
        ...mockService,
        uuid: 'tire-1',
        business_type: 'tire_service',
      } as ServiceDto;
      servicesStore.services = [mockService, mockAdditionalService, tireService];

      expect(servicesStore.mainServices).toHaveLength(1);

      servicesStore.activeCategory = 'tire_service';
      expect(servicesStore.mainServices).toHaveLength(1);
      expect(servicesStore.mainServices[0].uuid).toBe('tire-1');
    });
  });

  describe('createService', () => {
    it('should create service successfully', async () => {
      const createData: CreateServiceDto = {
        name: 'Новая услуга',
        description: 'Описание',
        duration_minutes: 30,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        service_center_uuid: 'center-1',
        servicePrices: [],
      };

      vi.mocked(apiClient.adminServicesCreate).mockResolvedValue(mockService as any);

      const result = await servicesStore.createService(createData);

      expect(apiClient.adminServicesCreate).toHaveBeenCalledWith({
        requestBody: createData,
      });
      expect(servicesStore.services).toHaveLength(1);
      expect(servicesStore.services[0].uuid).toBe('service-1');
      expect(toastStore.showSuccess).toHaveBeenCalledWith('Услуга успешно создана');
      expect(result).toBe(true);
    });

    it('should handle create error', async () => {
      const createData: CreateServiceDto = {
        name: 'Новая услуга',
        duration_minutes: 30,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        service_center_uuid: 'center-1',
        servicePrices: [],
      };

      const error = new Error('Create failed');
      vi.mocked(apiClient.adminServicesCreate).mockRejectedValue(error);

      const result = await servicesStore.createService(createData);

      expect(toastStore.showError).toHaveBeenCalledWith('Не удалось создать услугу');
      expect(result).toBe(false);
    });
  });

  describe('updateService', () => {
    it('should update service successfully', async () => {
      servicesStore.services = [mockService];
      const updateData: UpdateServiceDto = {
        name: 'Обновленное название',
        duration_minutes: 45,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        servicePrices: [],
      };

      const updatedService = { ...mockService, name: 'Обновленное название' };
      vi.mocked(apiClient.adminServicesUpdate).mockResolvedValue(updatedService as any);

      const result = await servicesStore.updateService('service-1', updateData);

      expect(apiClient.adminServicesUpdate).toHaveBeenCalledWith({
        uuid: 'service-1',
        requestBody: updateData,
      });
      expect(servicesStore.services[0].name).toBe('Обновленное название');
      expect(toastStore.showSuccess).toHaveBeenCalledWith('Услуга успешно обновлена');
      expect(result).toBe(true);
    });

    it('should handle update error', async () => {
      const updateData: UpdateServiceDto = {
        name: 'Обновленное название',
        duration_minutes: 45,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        servicePrices: [],
      };

      const error = new Error('Update failed');
      vi.mocked(apiClient.adminServicesUpdate).mockRejectedValue(error);

      const result = await servicesStore.updateService('service-1', updateData);

      expect(toastStore.showError).toHaveBeenCalledWith('Не удалось обновить услугу');
      expect(result).toBe(false);
    });

    it('should not update if service not found in list', async () => {
      servicesStore.services = [mockService];
      const updateData: UpdateServiceDto = {
        name: 'Обновленное название',
        duration_minutes: 45,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        servicePrices: [],
      };

      vi.mocked(apiClient.adminServicesUpdate).mockResolvedValue(updateData as any);

      await servicesStore.updateService('non-existent', updateData);

      expect(servicesStore.services[0]).toStrictEqual(mockService);
    });
  });

  describe('serviceToFormData', () => {
    it('should convert service to form data', () => {
      const formData = servicesStore.serviceToFormData(mockService);

      expect(formData).toEqual({
        name: 'Комплексная мойка',
        description: 'Полная мойка автомобиля',
        duration: '60',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      });
    });

    it('should handle missing prices', () => {
      const serviceWithoutPrices: ServiceDto = {
        ...mockService,
        servicePrices: [],
      } as ServiceDto;

      const formData = servicesStore.serviceToFormData(serviceWithoutPrices);

      expect(formData.priceSedan).toBe('');
      expect(formData.priceCrossover).toBe('');
      expect(formData.priceSuv).toBe('');
      expect(formData.priceMinivan).toBe('');
    });

    it('should handle missing description', () => {
      const serviceWithoutDescription: ServiceDto = {
        ...mockService,
        description: null,
      };

      const formData = servicesStore.serviceToFormData(serviceWithoutDescription);

      expect(formData.description).toBe('');
    });
  });

  describe('formDataToServiceDto', () => {
    const formData = {
      name: 'Тестовая услуга',
      description: 'Описание услуги',
      duration: '45',
      priceSedan: '1000',
      priceCrossover: '1200',
      priceSuv: '1500',
      priceMinivan: '1800',
    };

    it('should convert form data to CreateServiceDto with service_center_uuid', () => {
      const result = servicesStore.formDataToServiceDto(
        formData,
        'main',
        'center-1'
      ) as CreateServiceDto;

      expect(result.name).toBe('Тестовая услуга');
      expect(result.description).toBe('Описание услуги');
      expect(result.duration_minutes).toBe(45);
      expect(result.category).toBe('standard');
      expect(result.business_type).toBe('car_wash');
      expect(result.service_type).toBe('main');
      expect(result.service_center_uuid).toBe('center-1');
      expect(result.servicePrices).toHaveLength(4);
    });

    it('should convert form data to UpdateServiceDto without service_center_uuid', () => {
      const result = servicesStore.formDataToServiceDto(
        formData,
        'additional'
      ) as UpdateServiceDto;

      expect(result.name).toBe('Тестовая услуга');
      expect(result.service_type).toBe('additional');
      expect(result).not.toHaveProperty('service_center_uuid');
    });

    it('should handle empty description', () => {
      const formDataWithEmptyDesc = {
        ...formData,
        description: '   ',
      };

      const result = servicesStore.formDataToServiceDto(
        formDataWithEmptyDesc,
        'main'
      );

      expect(result.description).toBeUndefined();
    });

    it('should create correct servicePrices array', () => {
      const result = servicesStore.formDataToServiceDto(formData, 'main');

      expect(result.servicePrices).toHaveLength(4);
      
      const sedanPrice = result.servicePrices?.find(p => p.parameter_value === 'sedan');
      expect(sedanPrice).toEqual({
        parameter_type: 'simple_car_class',
        parameter_value: 'sedan',
        price: 1000,
        is_active: true,
      });

      const minivanPrice = result.servicePrices?.find(p => p.parameter_value === 'minivan');
      expect(minivanPrice?.price).toBe(1800);
    });

    it('should trim whitespace from name', () => {
      const formDataWithSpaces = {
        ...formData,
        name: '  Услуга с пробелами  ',
      };

      const result = servicesStore.formDataToServiceDto(formDataWithSpaces, 'main');

      expect(result.name).toBe('Услуга с пробелами');
    });
  });

  describe('validateFormData', () => {
    it('should return no errors for valid data', () => {
      const validData = {
        name: 'Услуга',
        description: 'Описание',
        duration: '30',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      };

      const errors = servicesStore.validateFormData(validData);

      expect(errors).toEqual({});
    });

    it('should validate required name', () => {
      const invalidData = {
        name: '',
        description: '',
        duration: '30',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      };

      const errors = servicesStore.validateFormData(invalidData);

      expect(errors.name).toBe('Название обязательно');
    });

    it('should validate name with only whitespace', () => {
      const invalidData = {
        name: '   ',
        description: '',
        duration: '30',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      };

      const errors = servicesStore.validateFormData(invalidData);

      expect(errors.name).toBe('Название обязательно');
    });

    it('should validate duration is positive number', () => {
      const invalidData = {
        name: 'Услуга',
        description: '',
        duration: '0',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      };

      const errors = servicesStore.validateFormData(invalidData);

      expect(errors.duration).toBe('Укажите продолжительность (больше 0)');
    });

    it('should validate duration is not NaN', () => {
      const invalidData = {
        name: 'Услуга',
        description: '',
        duration: 'abc',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      };

      const errors = servicesStore.validateFormData(invalidData);

      expect(errors.duration).toBe('Укажите продолжительность (больше 0)');
    });

    it('should validate all price fields', () => {
      const invalidData = {
        name: 'Услуга',
        description: '',
        duration: '30',
        priceSedan: '-100',
        priceCrossover: 'abc',
        priceSuv: '',
        priceMinivan: '1800',
      };

      const errors = servicesStore.validateFormData(invalidData);

      expect(errors.priceSedan).toBe('Укажите корректную цену');
      expect(errors.priceCrossover).toBe('Укажите корректную цену');
      expect(errors.priceSuv).toBe('Укажите корректную цену');
      expect(errors.priceMinivan).toBeUndefined();
    });

    it('should accept price of 0', () => {
      const validData = {
        name: 'Бесплатная услуга',
        description: '',
        duration: '30',
        priceSedan: '0',
        priceCrossover: '0',
        priceSuv: '0',
        priceMinivan: '0',
      };

      const errors = servicesStore.validateFormData(validData);

      expect(errors.priceSedan).toBeUndefined();
      expect(errors.priceCrossover).toBeUndefined();
      expect(errors.priceSuv).toBeUndefined();
      expect(errors.priceMinivan).toBeUndefined();
    });

    it('should return multiple errors', () => {
      const invalidData = {
        name: '',
        description: '',
        duration: '',
        priceSedan: '',
        priceCrossover: '',
        priceSuv: '',
        priceMinivan: '',
      };

      const errors = servicesStore.validateFormData(invalidData);

      expect(Object.keys(errors).length).toBeGreaterThan(1);
      expect(errors.name).toBeTruthy();
      expect(errors.duration).toBeTruthy();
    });
  });

  describe('Form management', () => {
    it('should initialize create form', () => {
      servicesStore.formData.name = 'Test';
      servicesStore.formErrors.name = 'Error';
      servicesStore.isSubmitting = true;

      servicesStore.initCreateForm();

      expect(servicesStore.formData).toEqual({
        name: '',
        description: '',
        duration: '',
        priceSedan: '',
        priceCrossover: '',
        priceSuv: '',
        priceMinivan: '',
      });
      expect(servicesStore.formErrors).toEqual({});
      expect(servicesStore.isSubmitting).toBe(false);
    });

    it('should initialize edit form with service data', () => {
      servicesStore.initEditForm(mockService);

      expect(servicesStore.formData.name).toBe('Комплексная мойка');
      expect(servicesStore.formData.duration).toBe('60');
      expect(servicesStore.formData.priceSedan).toBe('1000');
      expect(servicesStore.formErrors).toEqual({});
      expect(servicesStore.isSubmitting).toBe(false);
    });

    it('should update form field', () => {
      servicesStore.updateFormField('name', 'Новое название');

      expect(servicesStore.formData.name).toBe('Новое название');
    });

    it('should clear error when updating field', () => {
      servicesStore.formErrors.name = 'Ошибка';

      servicesStore.updateFormField('name', 'Новое значение');

      expect(servicesStore.formErrors.name).toBeUndefined();
    });

    it('should validate current form', () => {
      servicesStore.formData = {
        name: '',
        description: '',
        duration: '',
        priceSedan: '',
        priceCrossover: '',
        priceSuv: '',
        priceMinivan: '',
      };

      const isValid = servicesStore.validateCurrentForm();

      expect(isValid).toBe(false);
      expect(Object.keys(servicesStore.formErrors).length).toBeGreaterThan(0);
    });

    it('should return true for valid form', () => {
      servicesStore.formData = {
        name: 'Услуга',
        description: 'Описание',
        duration: '30',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      };

      const isValid = servicesStore.validateCurrentForm();

      expect(isValid).toBe(true);
      expect(servicesStore.formErrors).toEqual({});
    });

    it('should reset form', () => {
      servicesStore.formData.name = 'Test';
      servicesStore.formErrors.name = 'Error';
      servicesStore.isSubmitting = true;

      servicesStore.resetForm();

      expect(servicesStore.formData).toEqual({
        name: '',
        description: '',
        duration: '',
        priceSedan: '',
        priceCrossover: '',
        priceSuv: '',
        priceMinivan: '',
      });
      expect(servicesStore.formErrors).toEqual({});
      expect(servicesStore.isSubmitting).toBe(false);
    });
  });

  describe('submitServiceForm', () => {
    beforeEach(() => {
      servicesStore.formData = {
        name: 'Новая услуга',
        description: 'Описание',
        duration: '45',
        priceSedan: '1000',
        priceCrossover: '1200',
        priceSuv: '1500',
        priceMinivan: '1800',
      };
    });

    it('should not submit if validation fails', async () => {
      servicesStore.formData.name = '';

      const result = await servicesStore.submitServiceForm(
        'create',
        'center-1',
        'main'
      );

      expect(result).toBe(false);
      expect(apiClient.adminServicesCreate).not.toHaveBeenCalled();
      expect(Object.keys(servicesStore.formErrors).length).toBeGreaterThan(0);
    });

    it('should create service in create mode', async () => {
      vi.mocked(apiClient.adminServicesCreate).mockResolvedValue(mockService as any);

      const result = await servicesStore.submitServiceForm(
        'create',
        'center-1',
        'main'
      );

      expect(apiClient.adminServicesCreate).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(servicesStore.formData.name).toBe(''); // Should reset form
    });

    it('should update service in edit mode', async () => {
      servicesStore.services = [mockService];
      vi.mocked(apiClient.adminServicesUpdate).mockResolvedValue(mockService as any);

      const result = await servicesStore.submitServiceForm(
        'edit',
        'center-1',
        'main',
        'service-1'
      );

      expect(apiClient.adminServicesUpdate).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(servicesStore.formData.name).toBe(''); // Should reset form
    });

    it('should not reset form on failure', async () => {
      vi.mocked(apiClient.adminServicesCreate).mockRejectedValue(new Error('Failed'));

      const originalName = servicesStore.formData.name;
      const result = await servicesStore.submitServiceForm(
        'create',
        'center-1',
        'main'
      );

      expect(result).toBe(false);
      expect(servicesStore.formData.name).toBe(originalName);
    });

    it('should set isSubmitting flag during submission', async () => {
      vi.mocked(apiClient.adminServicesCreate).mockImplementation((async () => {
        expect(servicesStore.isSubmitting).toBe(true);
        return mockService;
      }) as any);

      await servicesStore.submitServiceForm('create', 'center-1', 'main');

      expect(servicesStore.isSubmitting).toBe(false);
    });

    it('should reset isSubmitting even on error', async () => {
      vi.mocked(apiClient.adminServicesCreate).mockRejectedValue(new Error('Failed'));

      await servicesStore.submitServiceForm('create', 'center-1', 'main');

      expect(servicesStore.isSubmitting).toBe(false);
    });

    it('should pass correct serviceType to formDataToServiceDto', async () => {
      vi.mocked(apiClient.adminServicesCreate).mockResolvedValue(mockService as any);

      await servicesStore.submitServiceForm('create', 'center-1', 'additional');

      const callArgs = vi.mocked(apiClient.adminServicesCreate).mock.calls[0][0];
      expect(callArgs.requestBody.service_type).toBe('additional');
    });

    it('should not submit in edit mode without serviceUuid', async () => {
      const result = await servicesStore.submitServiceForm(
        'edit',
        'center-1',
        'main'
        // serviceUuid отсутствует
      );

      expect(result).toBe(false);
      expect(apiClient.adminServicesUpdate).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(apiClient.adminServicesCreate).mockRejectedValue(new Error('Unexpected error'));

      const result = await servicesStore.submitServiceForm('create', 'center-1', 'main');

      expect(result).toBe(false);
      expect(servicesStore.isSubmitting).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle service with no prices in servicePrices array', () => {
      const serviceNoPrices: ServiceDto = {
        ...mockService,
        servicePrices: undefined,
      } as ServiceDto;

      const formData = servicesStore.serviceToFormData(serviceNoPrices);

      expect(formData.priceSedan).toBe('');
      expect(formData.priceCrossover).toBe('');
      expect(formData.priceSuv).toBe('');
      expect(formData.priceMinivan).toBe('');
    });

    it('should handle service with partial prices', () => {
      const servicePartialPrices: ServiceDto = {
        ...mockService,
        servicePrices: [
          {
            parameter_type: 'simple_car_class',
            parameter_value: 'sedan',
            price: 1000,
            is_active: true,
          },
        ],
      } as ServiceDto;

      const formData = servicesStore.serviceToFormData(servicePartialPrices);

      expect(formData.priceSedan).toBe('1000');
      expect(formData.priceCrossover).toBe('');
      expect(formData.priceSuv).toBe('');
      expect(formData.priceMinivan).toBe('');
    });

    it('should not crash when deleting non-existent service', async () => {
      servicesStore.services = [mockService];
      vi.mocked(apiClient.adminServicesDelete).mockResolvedValue(undefined);

      await servicesStore.deleteService('non-existent-uuid');

      expect(servicesStore.services).toHaveLength(1);
    });

    it('should handle concurrent fetchServices calls', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue([mockService] as any);

      const promise1 = servicesStore.fetchServices();
      const promise2 = servicesStore.fetchServices();

      await Promise.all([promise1, promise2]);

      expect(servicesStore.services).toBeDefined();
      expect(servicesStore.isLoading).toBe(false);
    });

    it('should maintain data consistency after failed update', async () => {
      const originalService = { ...mockService };
      servicesStore.services = [originalService];
      
      vi.mocked(apiClient.adminServicesUpdate).mockRejectedValue(new Error('Update failed'));

      await servicesStore.updateService('service-1', {
        name: 'Updated name',
        duration_minutes: 90,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        servicePrices: [],
      });

      expect(servicesStore.services[0]).toEqual(originalService);
    });
  });

  describe('Integration scenarios', () => {
    it('should complete full create flow', async () => {
      vi.mocked(apiClient.adminServicesCreate).mockResolvedValue(mockService as any);

      // Initialize form
      servicesStore.initCreateForm();
      expect(servicesStore.formData.name).toBe('');

      // Fill form
      servicesStore.updateFormField('name', 'Новая услуга');
      servicesStore.updateFormField('duration', '30');
      servicesStore.updateFormField('priceSedan', '1000');
      servicesStore.updateFormField('priceCrossover', '1200');
      servicesStore.updateFormField('priceSuv', '1500');
      servicesStore.updateFormField('priceMinivan', '1800');

      // Submit
      const success = await servicesStore.submitServiceForm('create', 'center-1', 'main');

      expect(success).toBe(true);
      expect(servicesStore.formData.name).toBe('');
      expect(toastStore.showSuccess).toHaveBeenCalled();
    });

    it('should complete full edit flow', async () => {
      servicesStore.services = [mockService];
      vi.mocked(apiClient.adminServicesUpdate).mockResolvedValue({
        ...mockService,
        name: 'Обновленная услуга',
      } as any);

      // Initialize form with service
      servicesStore.initEditForm(mockService);
      expect(servicesStore.formData.name).toBe('Комплексная мойка');

      // Update name
      servicesStore.updateFormField('name', 'Обновленная услуга');

      // Submit
      const success = await servicesStore.submitServiceForm('edit', 'center-1', 'main', 'service-1');

      expect(success).toBe(true);
      expect(servicesStore.services[0].name).toBe('Обновленная услуга');
      expect(toastStore.showSuccess).toHaveBeenCalled();
    });

    it('should handle validation errors in edit flow', async () => {
      servicesStore.initEditForm(mockService);
      
      // Set invalid data
      servicesStore.updateFormField('name', '');
      servicesStore.updateFormField('duration', '-10');

      const success = await servicesStore.submitServiceForm('edit', 'center-1', 'main', 'service-1');

      expect(success).toBe(false);
      expect(servicesStore.formErrors.name).toBeTruthy();
      expect(servicesStore.formErrors.duration).toBeTruthy();
      expect(apiClient.adminServicesUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Race Condition Protection', () => {
    it('should ignore stale requests when category changes rapidly', async () => {
      let resolveFirstRequest: (value: any) => void;
      let resolveSecondRequest: (value: any) => void;

      const firstRequestPromise = new Promise((resolve) => {
        resolveFirstRequest = resolve;
      });
      const secondRequestPromise = new Promise((resolve) => {
        resolveSecondRequest = resolve;
      });

      vi.mocked(apiClient.adminServicesGetAll)
        .mockImplementationOnce(() => firstRequestPromise as any)
        .mockImplementationOnce(() => secondRequestPromise as any);

      // Запускаем первый запрос
      const firstFetch = servicesStore.fetchServices();
      expect(servicesStore.isLoading).toBe(true);

      // Сразу запускаем второй запрос
      const secondFetch = servicesStore.fetchServices();

      // Второй запрос завершается первым (быстрее)
      resolveSecondRequest!([mockService]);
      await secondFetch;

      expect(servicesStore.services).toEqual([mockService]);
      expect(servicesStore.isLoading).toBe(false);

      // Первый запрос завершается позже (медленнее)
      resolveFirstRequest!([{ ...mockService, uuid: 'old-service', name: 'Old Service' }]);
      await firstFetch;

      // Услуги должны остаться от второго запроса
      expect(servicesStore.services).toEqual([mockService]);
    });

    it('should handle errors in stale requests gracefully', async () => {
      let rejectFirstRequest: (error: any) => void;

      const firstRequestPromise = new Promise((_, reject) => {
        rejectFirstRequest = reject;
      });

      vi.mocked(apiClient.adminServicesGetAll)
        .mockImplementationOnce(() => firstRequestPromise as any)
        .mockResolvedValueOnce([mockService] as any);

      const firstFetch = servicesStore.fetchServices();
      const secondFetch = servicesStore.fetchServices();

      await secondFetch;
      expect(servicesStore.services).toEqual([mockService]);
      expect(servicesStore.error).toBeNull();

      rejectFirstRequest!(new Error('Network error'));
      await firstFetch.catch(() => {});

      // Ошибка от старого запроса не должна перезаписать состояние
      expect(servicesStore.services).toEqual([mockService]);
      expect(servicesStore.error).toBeNull();
    });
  });

  describe('Caching', () => {
    const carWashServices = [mockService];
    const tireServices = [{ ...mockService, uuid: 'tire-1', business_type: 'tire_service' as const }];

    it('should cache services by category', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(carWashServices as any);

      await servicesStore.fetchServices();
      
      // Второй вызов должен использовать кеш
      await servicesStore.fetchServices();

      // API вызван только один раз
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(1);
      expect(servicesStore.services).toEqual(carWashServices);
    });

    it('should bypass cache with forceRefresh option', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(carWashServices as any);

      await servicesStore.fetchServices();
      await servicesStore.fetchServices({ forceRefresh: true });

      // API вызван дважды
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(2);
    });

    it('should use cache in silent mode and not make API call', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(carWashServices as any);

      // Первый запрос - создаёт кеш
      await servicesStore.fetchServices();
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(1);

      // Silent запрос - использует кеш
      await servicesStore.fetchServices({ silent: true });
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(1); // Не увеличилось
      expect(servicesStore.services).toEqual(carWashServices);
    });

    it('should not show loader in silent mode when cache exists', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(carWashServices as any);

      await servicesStore.fetchServices();
      expect(servicesStore.isLoading).toBe(false);

      servicesStore.fetchServices({ silent: true });
      // isLoading не должен стать true
      expect(servicesStore.isLoading).toBe(false);
    });

    it('should not show loader in silent mode even without cache', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(carWashServices as any);

      // Запускаем silent загрузку БЕЗ кеша
      const promise = servicesStore.fetchServices({ silent: true });
      
      // isLoading никогда не должен стать true
      expect(servicesStore.isLoading).toBe(false);
      
      await promise;
      
      // После загрузки isLoading все еще false
      expect(servicesStore.isLoading).toBe(false);
      expect(servicesStore.services).toEqual(carWashServices);
    });

    it('should maintain separate cache for different categories', async () => {
      vi.mocked(apiClient.adminServicesGetAll)
        .mockResolvedValueOnce(carWashServices as any)
        .mockResolvedValueOnce(tireServices as any);

      servicesStore.activeCategory = 'car_wash';
      await servicesStore.fetchServices();
      expect(servicesStore.services).toEqual(carWashServices);

      servicesStore.activeCategory = 'tire_service';
      await servicesStore.fetchServices();
      expect(servicesStore.services).toEqual(tireServices);

      // Возвращаемся к car_wash - должен использовать кеш
      servicesStore.activeCategory = 'car_wash';
      await servicesStore.fetchServices();
      
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(2); // Не 3!
      expect(servicesStore.services).toEqual(carWashServices);
    });

    it('should implement LRU cache with MAX_CACHE_SIZE', async () => {
      const categories = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6'] as any[];
      
      for (const cat of categories) {
        servicesStore.activeCategory = cat;
        vi.mocked(apiClient.adminServicesGetAll).mockResolvedValueOnce([
          { ...mockService, uuid: cat, business_type: cat }
        ] as any);
        await servicesStore.fetchServices();
      }

      // Кеш должен содержать только последние 5 категорий
      servicesStore.activeCategory = 'cat1' as any;
      await servicesStore.fetchServices();
      
      // cat1 был вытеснен из кеша, поэтому будет новый запрос
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(7); // 6 + 1
    });

    it('should clear cache on clearCache()', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(carWashServices as any);

      await servicesStore.fetchServices();
      servicesStore.clearCache();
      await servicesStore.fetchServices();

      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache when creating service', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue(carWashServices as any);
      vi.mocked(apiClient.adminServicesCreate).mockResolvedValue(mockService as any);

      await servicesStore.fetchServices();
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(1);

      await servicesStore.createService({
        name: 'New Service',
        duration_minutes: 60,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        service_center_uuid: 'center-1',
        servicePrices: [],
      } as CreateServiceDto);

      // Следующий запрос должен обойти кеш
      await servicesStore.fetchServices();
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache when updating service', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue([mockService] as any);
      vi.mocked(apiClient.adminServicesUpdate).mockResolvedValue(mockService as any);

      await servicesStore.fetchServices();
      await servicesStore.updateService('service-1', {
        name: 'Updated',
        duration_minutes: 60,
        category: 'standard',
        business_type: 'car_wash',
        service_type: 'main',
        servicePrices: [],
      } as UpdateServiceDto);
      await servicesStore.fetchServices();

      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache when deleting service', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue([mockService] as any);
      vi.mocked(apiClient.adminServicesDelete).mockResolvedValue(undefined as any);

      await servicesStore.fetchServices();
      await servicesStore.deleteService('service-1');
      await servicesStore.fetchServices();

      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('Store Reset', () => {
    it('should reset all store state including cache', async () => {
      vi.mocked(apiClient.adminServicesGetAll).mockResolvedValue([mockService] as any);

      servicesStore.activeCategory = 'tire_service';
      await servicesStore.fetchServices();
      servicesStore.initCreateForm();
      servicesStore.updateFormField('name', 'Test');

      servicesStore.reset();

      expect(servicesStore.services).toEqual([]);
      expect(servicesStore.activeCategory).toBe('car_wash');
      expect(servicesStore.isLoading).toBe(false);
      expect(servicesStore.error).toBeNull();
      expect(servicesStore.formData.name).toBe('');
      expect(servicesStore.formErrors).toEqual({});

      // Кеш должен быть очищен
      await servicesStore.fetchServices();
      expect(apiClient.adminServicesGetAll).toHaveBeenCalledTimes(2); // 1 начальный + 1 после reset
    });
  });

  describe('Form Field Updates - No Direct Mutation', () => {
    it('should not directly mutate formErrors when clearing error', () => {
      servicesStore.formErrors = { name: 'Error' };
      const originalErrors = servicesStore.formErrors;

      servicesStore.updateFormField('name', 'New Value');

      // formErrors должен быть новым объектом
      expect(servicesStore.formErrors).not.toBe(originalErrors);
      expect(servicesStore.formErrors.name).toBeUndefined();
    });

    it('should keep other errors when clearing one field error', () => {
      servicesStore.formErrors = { name: 'Name error', duration: 'Duration error' };

      servicesStore.updateFormField('name', 'Valid Name');

      expect(servicesStore.formErrors.name).toBeUndefined();
      expect(servicesStore.formErrors.duration).toBe('Duration error');
    });
  });
});
