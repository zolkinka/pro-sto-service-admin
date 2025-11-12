# Исправление ошибки "property service_center_uuid should not exist"

## Описание проблемы

При сохранении услуги в мобильной версии возникала ошибка:
```
{
  "message": "property service_center_uuid should not exist",
  "error": "Bad Request",
  "statusCode": 400
}
```

## Причина

`service_center_uuid` передавался в body запроса как при **создании**, так и при **редактировании** услуги.

Однако API требует:
- ✅ **При создании** (`POST /admin/services`) - `service_center_uuid` обязателен
- ❌ **При редактировании** (`PATCH /admin/services/{uuid}`) - `service_center_uuid` НЕ должен передаваться

## Решение

### 1. Изменена сигнатура метода `formDataToServiceDto`

**Было:**
```typescript
formDataToServiceDto(
  formData: ServiceFormData, 
  serviceCenterUuid: string,
  serviceType: 'main' | 'additional'
): CreateServiceDto
```

**Стало:**
```typescript
formDataToServiceDto(
  formData: ServiceFormData, 
  serviceType: 'main' | 'additional',
  serviceCenterUuid?: string  // Теперь опциональный параметр
): CreateServiceDto | UpdateServiceDto
```

### 2. Условное добавление `service_center_uuid`

```typescript
formDataToServiceDto(formData, serviceType, serviceCenterUuid?) {
  const baseData = {
    name: formData.name.trim(),
    description: formData.description.trim() || undefined,
    duration_minutes: parseInt(formData.duration, 10),
    category: 'standard',
    business_type: this.activeCategory,
    service_type: serviceType,
    servicePrices: [/* ... */],
  };

  // Добавляем service_center_uuid только при создании
  if (serviceCenterUuid) {
    return {
      ...baseData,
      service_center_uuid: serviceCenterUuid,
    } as CreateServiceDto;
  }

  return baseData as UpdateServiceDto;
}
```

### 3. Обновлён метод `submitServiceForm`

```typescript
async submitServiceForm(mode, serviceCenterUuid, serviceType, serviceUuid?) {
  if (!this.validateCurrentForm()) {
    return false;
  }

  this.isSubmitting = true;

  try {
    let success = false;
    if (mode === 'create') {
      // При создании передаём serviceCenterUuid
      const serviceData = this.formDataToServiceDto(
        this.formData,
        serviceType,
        serviceCenterUuid
      ) as CreateServiceDto;
      success = await this.createService(serviceData);
    } else if (mode === 'edit' && serviceUuid) {
      // При редактировании НЕ передаём serviceCenterUuid
      const serviceData = this.formDataToServiceDto(
        this.formData,
        serviceType
      ) as UpdateServiceDto;
      success = await this.updateService(serviceUuid, serviceData);
    }

    if (success) {
      this.resetForm();
    }

    return success;
  } catch (error) {
    console.error('Error submitting service:', error);
    return false;
  } finally {
    runInAction(() => {
      this.isSubmitting = false;
    });
  }
}
```

## Соответствие десктопной версии

Десктопная версия (`ServiceModal.tsx`) уже реализовывала эту логику корректно:

```typescript
if (mode === 'create') {
  await servicesStore.createService({
    // ... остальные поля
    service_center_uuid: user.service_center_uuid, // Передаётся
  });
} else if (mode === 'edit' && service) {
  await servicesStore.updateService(service.uuid, {
    // ... остальные поля
    // service_center_uuid НЕ передаётся
  });
}
```

Теперь мобильная версия использует ту же логику через централизованный метод в store.

## Тестирование

✅ **Проверено:**
- Редактирование услуги "qwer" → "Супер мойка"
- Запрос успешно выполнен
- Услуга обновлена в списке
- Toast уведомление "Услуга успешно обновлена"
- Форма закрылась после сохранения

## Файлы изменены

- `src/stores/ServicesStore.ts` - изменена логика `formDataToServiceDto` и `submitServiceForm`
- `SERVICES_STORE_REFACTORING.md` - обновлена документация

## Дата исправления

11 ноября 2025 г.
