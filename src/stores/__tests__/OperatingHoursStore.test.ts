import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OperatingHoursStore } from '../OperatingHoursStore';
import type { RootStore } from '../RootStore';
import { 
  operatingHoursGetAll, 
  operatingHoursUpdateRegular,
  operatingHoursCreateSpecial,
  operatingHoursDelete,
  ApiError
} from '../../../services/api-client';
import type { 
  OperatingHoursResponseDto, 
  UpdateRegularScheduleDto,
  CreateSpecialDateDto 
} from '../../../services/api-client/types.gen';

// Mock API client
vi.mock('../../../services/api-client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    operatingHoursGetAll: vi.fn(),
    operatingHoursUpdateRegular: vi.fn(),
    operatingHoursCreateSpecial: vi.fn(),
    operatingHoursDelete: vi.fn(),
  };
});

const TEST_SERVICE_CENTER_UUID = 'test-service-center-uuid';

const createMockOperatingHoursData = () => ({
  regular: [
    {
      uuid: 'reg-1',
      service_center_uuid: TEST_SERVICE_CENTER_UUID,
      day_of_week: 'monday',
      is_working: true,
      open_time: '06:00',
      close_time: '18:00',
      timezone: 'Europe/Moscow',
      date: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ] as OperatingHoursResponseDto[],
  special: [
    {
      uuid: 'spec-1',
      service_center_uuid: TEST_SERVICE_CENTER_UUID,
      day_of_week: null,
      is_working: false,
      open_time: null,
      close_time: null,
      timezone: 'Europe/Moscow',
      date: '2024-12-31',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ] as OperatingHoursResponseDto[]
});

describe('OperatingHoursStore', () => {
  let store: OperatingHoursStore;
  let mockToastStore: any;
  let mockRootStore: Partial<RootStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockToastStore = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };

    mockRootStore = {
      toastStore: mockToastStore
    };

    store = new OperatingHoursStore(mockRootStore as RootStore);
  });

  describe('loadOperatingHours', () => {
    it('загружает расписание успешно', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);

      expect(store.regularSchedule).toEqual(mockData.regular);
      expect(store.specialDates).toEqual(mockData.special);
      expect(store.timezone).toBe('Europe/Moscow');
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('использует кеш при повторном запросе', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      // Первый запрос
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1);

      // Второй запрос - должен использовать кеш
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1); // Не увеличилось
      
      expect(store.regularSchedule).toEqual(mockData.regular);
      expect(store.specialDates).toEqual(mockData.special);
    });

    it('игнорирует кеш при forceRefresh=true', async () => {
      const mockData1 = createMockOperatingHoursData();
      const mockData2 = {
        ...createMockOperatingHoursData(),
        regular: [
          { ...mockData1.regular[0], day_of_week: 'tuesday' }
        ]
      };
      
      vi.mocked(operatingHoursGetAll)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      // Первый запрос - заполняет кеш
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(store.regularSchedule[0].day_of_week).toBe('monday');

      // Второй запрос с forceRefresh - игнорирует кеш
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID, { forceRefresh: true });
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
      expect(store.regularSchedule[0].day_of_week).toBe('tuesday');
    });

    it('работает в silent режиме без изменения loading', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      store.loading = false;
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID, { silent: true, forceRefresh: true });

      expect(store.loading).toBe(false); // Не изменился
      expect(store.regularSchedule).toEqual(mockData.regular);
    });

    it('LRU кеш удаляет старый элемент при превышении MAX_CACHE_SIZE', async () => {
      const mockData1 = createMockOperatingHoursData();
      const mockData2 = {
        ...createMockOperatingHoursData(),
        regular: [
          { ...mockData1.regular[0], day_of_week: 'tuesday' }
        ]
      };
      
      vi.mocked(operatingHoursGetAll)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2)
        .mockResolvedValueOnce(mockData1);

      // Заполняем кеш первым элементом
      await store.loadOperatingHours('uuid-1');
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1);
      
      // Добавляем второй элемент - должен удалить первый (MAX_CACHE_SIZE=1)
      await store.loadOperatingHours('uuid-2');
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
      
      // Пытаемся загрузить первый элемент снова - должен сделать новый запрос (кеш очищен)
      await store.loadOperatingHours('uuid-1');
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(3); // Новый запрос вместо кеша
    });

    it('защищает от race condition - игнорирует старые запросы', async () => {
      const mockData1 = createMockOperatingHoursData();
      const mockData2 = {
        ...createMockOperatingHoursData(),
        regular: [
          { ...mockData1.regular[0], day_of_week: 'friday' }
        ]
      };

      let resolveFirst: (value: any) => void;
      let resolveSecond: (value: any) => void;
      
      const firstPromise = new Promise((resolve) => { resolveFirst = resolve; });
      const secondPromise = new Promise((resolve) => { resolveSecond = resolve; });

      vi.mocked(operatingHoursGetAll)
        .mockReturnValueOnce(firstPromise as any)
        .mockReturnValueOnce(secondPromise as any);

      // Запускаем два запроса параллельно
      const request1 = store.loadOperatingHours('uuid-1', { forceRefresh: true });
      const request2 = store.loadOperatingHours('uuid-2', { forceRefresh: true });

      // Завершаем второй запрос первым
      resolveSecond!(mockData2);
      await request2;

      // Затем завершаем первый запрос
      resolveFirst!(mockData1);
      await request1;

      // Должны быть данные из второго запроса (более нового)
      expect(store.regularSchedule[0].day_of_week).toBe('friday');
    });

    it('обрабатывает ошибку загрузки', async () => {
      vi.mocked(operatingHoursGetAll).mockRejectedValueOnce(new Error('Network error'));

      await expect(store.loadOperatingHours(TEST_SERVICE_CENTER_UUID, { forceRefresh: true })).rejects.toThrow();

      expect(store.error).toBe('Ошибка загрузки расписания');
      expect(store.loading).toBe(false);
    });

    it('не обновляет состояние при ошибке в старом запросе', async () => {
      const mockData = createMockOperatingHoursData();
      
      let rejectFirst: (error: any) => void;
      const firstPromise = new Promise((_, reject) => { rejectFirst = reject; });

      vi.mocked(operatingHoursGetAll)
        .mockReturnValueOnce(firstPromise as any)
        .mockResolvedValueOnce(mockData);

      // Запускаем два запроса параллельно
      const request1 = store.loadOperatingHours('uuid-1', { forceRefresh: true });
      const request2 = store.loadOperatingHours('uuid-2', { forceRefresh: true });

      // Завершаем второй запрос успешно
      await request2;
      expect(store.error).toBeNull();

      // Завершаем первый запрос с ошибкой
      rejectFirst!(new Error('Network error'));
      await request1.catch(() => {}); // Игнорируем ошибку

      // Ошибка из старого запроса не должна перезаписать состояние
      expect(store.error).toBeNull();
    });
  });

  describe('updateRegularSchedule', () => {
    const updateData: UpdateRegularScheduleDto = {
      schedule: [
        { day_of_week: 'monday', is_working: true, open_time: '09:00', close_time: '18:00' }
      ]
    };

    it('обновляет расписание успешно', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursUpdateRegular).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      await store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData, { 
        showSuccessToast: false 
      });

      expect(operatingHoursUpdateRegular).toHaveBeenCalledWith({
        serviceCenterUuid: TEST_SERVICE_CENTER_UUID,
        requestBody: updateData
      });
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('показывает toast успеха по умолчанию', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursUpdateRegular).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      await store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData);

      expect(mockToastStore.showSuccess).toHaveBeenCalledWith('Расписание успешно обновлено');
    });

    it('инвалидирует кеш после обновления', async () => {
      const mockData = createMockOperatingHoursData();
      
      // Заполняем кеш
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1);

      // Обновляем расписание - должен инвалидировать кеш и перезагрузить
      vi.mocked(operatingHoursUpdateRegular).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      
      await store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData, { 
        showSuccessToast: false 
      });

      // Должен быть вызван повторно (кеш инвалидирован)
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
    });

    it('использует forceRefresh при перезагрузке', async () => {
      const mockData = createMockOperatingHoursData();
      
      // Заполняем кеш
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);

      // Обновляем расписание
      vi.mocked(operatingHoursUpdateRegular).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      
      await store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData, { 
        showSuccessToast: false 
      });

      // После обновления должен быть вызван API (не кеш)
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
    });

    it('не падает, если перезагрузка после обновления завершилась ошибкой', async () => {
      vi.mocked(operatingHoursUpdateRegular).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockRejectedValueOnce(new Error('Reload failed'));

      // Не должно бросить ошибку
      await expect(
        store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData, { 
          showSuccessToast: false 
        })
      ).resolves.toBeUndefined();

      expect(store.loading).toBe(false);
    });

    it('обрабатывает ошибку обновления', async () => {
      const apiError = new ApiError(
        { method: 'POST', url: '' } as any,
        { ok: false, status: 400, body: { message: 'Validation error' } } as any,
        'Bad request'
      );
      vi.mocked(operatingHoursUpdateRegular).mockRejectedValueOnce(apiError);

      await expect(
        store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData, { 
          showSuccessToast: false 
        })
      ).rejects.toThrow();

      expect(store.error).toBe('Validation error');
      expect(store.loading).toBe(false);
    });

    it('показывает toast ошибки по умолчанию', async () => {
      const apiError = new ApiError(
        { method: 'POST', url: '' } as any,
        { ok: false, status: 400, body: { message: 'Test error' } } as any,
        'Bad request'
      );
      vi.mocked(operatingHoursUpdateRegular).mockRejectedValueOnce(apiError);

      await expect(
        store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData)
      ).rejects.toThrow();

      expect(mockToastStore.showError).toHaveBeenCalledWith('Test error');
    });

    it('не показывает toast если showErrorToast=false', async () => {
      vi.mocked(operatingHoursUpdateRegular).mockRejectedValueOnce(new Error('Error'));

      await expect(
        store.updateRegularSchedule(TEST_SERVICE_CENTER_UUID, updateData, { 
          showErrorToast: false 
        })
      ).rejects.toThrow();

      expect(mockToastStore.showError).not.toHaveBeenCalled();
    });
  });

  describe('createSpecialDate', () => {
    const createData: CreateSpecialDateDto = {
      date: '2024-12-31',
      is_working: false
    };

    it('создает специальную дату успешно', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursCreateSpecial).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      await store.createSpecialDate(TEST_SERVICE_CENTER_UUID, createData, { 
        showSuccessToast: false 
      });

      expect(operatingHoursCreateSpecial).toHaveBeenCalledWith({
        serviceCenterUuid: TEST_SERVICE_CENTER_UUID,
        requestBody: createData
      });
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('показывает toast успеха по умолчанию', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursCreateSpecial).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      await store.createSpecialDate(TEST_SERVICE_CENTER_UUID, createData);

      expect(mockToastStore.showSuccess).toHaveBeenCalledWith('Выходной день добавлен');
    });

    it('инвалидирует кеш после создания', async () => {
      const mockData = createMockOperatingHoursData();
      
      // Заполняем кеш
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1);

      // Создаем специальную дату
      vi.mocked(operatingHoursCreateSpecial).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      
      await store.createSpecialDate(TEST_SERVICE_CENTER_UUID, createData, { 
        showSuccessToast: false 
      });

      // Должен быть вызван повторно (кеш инвалидирован)
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
    });

    it('не падает, если перезагрузка после создания завершилась ошибкой', async () => {
      vi.mocked(operatingHoursCreateSpecial).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockRejectedValueOnce(new Error('Reload failed'));

      // Не должно бросить ошибку
      await expect(
        store.createSpecialDate(TEST_SERVICE_CENTER_UUID, createData, { 
          showSuccessToast: false 
        })
      ).resolves.toBeUndefined();

      expect(store.loading).toBe(false);
    });

    it('обрабатывает ошибку создания', async () => {
      const apiError = new ApiError(
        { method: 'POST', url: '' } as any,
        { ok: false, status: 400, body: { message: 'Date already exists' } } as any,
        'Bad request'
      );
      vi.mocked(operatingHoursCreateSpecial).mockRejectedValueOnce(apiError);

      await expect(
        store.createSpecialDate(TEST_SERVICE_CENTER_UUID, createData, { 
          showSuccessToast: false 
        })
      ).rejects.toThrow();

      expect(store.error).toBe('Date already exists');
      expect(store.loading).toBe(false);
    });

    it('показывает toast ошибки по умолчанию', async () => {
      const apiError = new ApiError(
        { method: 'POST', url: '' } as any,
        { ok: false, status: 400, body: { message: 'Test error' } } as any,
        'Bad request'
      );
      vi.mocked(operatingHoursCreateSpecial).mockRejectedValueOnce(apiError);

      await expect(
        store.createSpecialDate(TEST_SERVICE_CENTER_UUID, createData)
      ).rejects.toThrow();

      expect(mockToastStore.showError).toHaveBeenCalledWith('Test error');
    });

    it('не показывает toast если showErrorToast=false', async () => {
      vi.mocked(operatingHoursCreateSpecial).mockRejectedValueOnce(new Error('Error'));

      await expect(
        store.createSpecialDate(TEST_SERVICE_CENTER_UUID, createData, { 
          showErrorToast: false 
        })
      ).rejects.toThrow();

      expect(mockToastStore.showError).not.toHaveBeenCalled();
    });
  });

  describe('deleteSpecialDate', () => {
    const specialDateUuid = 'special-date-uuid';

    it('удаляет специальную дату успешно', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursDelete).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      await store.deleteSpecialDate(TEST_SERVICE_CENTER_UUID, specialDateUuid, { 
        showSuccessToast: false 
      });

      expect(operatingHoursDelete).toHaveBeenCalledWith({
        serviceCenterUuid: TEST_SERVICE_CENTER_UUID,
        uuid: specialDateUuid
      });
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('показывает toast успеха по умолчанию', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursDelete).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      await store.deleteSpecialDate(TEST_SERVICE_CENTER_UUID, specialDateUuid);

      expect(mockToastStore.showSuccess).toHaveBeenCalledWith('Выходной день удален');
    });

    it('инвалидирует кеш после удаления', async () => {
      const mockData = createMockOperatingHoursData();
      
      // Заполняем кеш
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1);

      // Удаляем специальную дату
      vi.mocked(operatingHoursDelete).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      
      await store.deleteSpecialDate(TEST_SERVICE_CENTER_UUID, specialDateUuid, { 
        showSuccessToast: false 
      });

      // Должен быть вызван повторно (кеш инвалидирован)
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
    });

    it('не падает, если перезагрузка после удаления завершилась ошибкой', async () => {
      vi.mocked(operatingHoursDelete).mockResolvedValueOnce(undefined as any);
      vi.mocked(operatingHoursGetAll).mockRejectedValueOnce(new Error('Reload failed'));

      // Не должно бросить ошибку
      await expect(
        store.deleteSpecialDate(TEST_SERVICE_CENTER_UUID, specialDateUuid, { 
          showSuccessToast: false 
        })
      ).resolves.toBeUndefined();

      expect(store.loading).toBe(false);
    });

    it('обрабатывает ошибку удаления', async () => {
      const apiError = new ApiError(
        { method: 'DELETE', url: '' } as any,
        { ok: false, status: 404, body: { message: 'Date not found' } } as any,
        'Not found'
      );
      vi.mocked(operatingHoursDelete).mockRejectedValueOnce(apiError);

      await expect(
        store.deleteSpecialDate(TEST_SERVICE_CENTER_UUID, specialDateUuid, { 
          showSuccessToast: false 
        })
      ).rejects.toThrow();

      expect(store.error).toBe('Date not found');
      expect(store.loading).toBe(false);
    });

    it('показывает toast ошибки по умолчанию', async () => {
      const apiError = new ApiError(
        { method: 'DELETE', url: '' } as any,
        { ok: false, status: 404, body: { message: 'Test error' } } as any,
        'Not found'
      );
      vi.mocked(operatingHoursDelete).mockRejectedValueOnce(apiError);

      await expect(
        store.deleteSpecialDate(TEST_SERVICE_CENTER_UUID, specialDateUuid)
      ).rejects.toThrow();

      expect(mockToastStore.showError).toHaveBeenCalledWith('Test error');
    });

    it('не показывает toast если showErrorToast=false', async () => {
      vi.mocked(operatingHoursDelete).mockRejectedValueOnce(new Error('Error'));

      await expect(
        store.deleteSpecialDate(TEST_SERVICE_CENTER_UUID, specialDateUuid, { 
          showErrorToast: false 
        })
      ).rejects.toThrow();

      expect(mockToastStore.showError).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('сбрасывает состояние store в начальное', async () => {
      const mockData = createMockOperatingHoursData();
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);

      // Загружаем данные
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      store.error = 'Some error';
      
      expect(store.regularSchedule.length).toBeGreaterThan(0);
      expect(store.specialDates.length).toBeGreaterThan(0);

      // Сбрасываем
      store.reset();

      expect(store.regularSchedule).toEqual([]);
      expect(store.specialDates).toEqual([]);
      expect(store.timezone).toBe('Europe/Moscow');
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('очищает кеш при reset', async () => {
      const mockData = createMockOperatingHoursData();
      
      // Заполняем кеш
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1);

      // Сбрасываем store
      store.reset();

      // После reset кеш должен быть очищен
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      
      // Должен вызваться API снова (кеш очищен)
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearCache', () => {
    it('очищает кеш', async () => {
      const mockData = createMockOperatingHoursData();
      
      // Заполняем кеш
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(1);

      // Очищаем кеш
      store.clearCache();

      // После очистки кеша должен выполниться новый запрос
      vi.mocked(operatingHoursGetAll).mockResolvedValueOnce(mockData);
      await store.loadOperatingHours(TEST_SERVICE_CENTER_UUID);
      
      expect(operatingHoursGetAll).toHaveBeenCalledTimes(2);
    });
  });
});
