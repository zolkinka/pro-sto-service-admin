import { describe, it, expect } from 'vitest';
import type { SchedulePayload } from '../types';
import { validateSchedulePayload } from '../validation';

const baseValidPayload: SchedulePayload = {
  monday: { open_time: '09:00', close_time: '18:00', is_closed: false },
  tuesday: { open_time: '09:00', close_time: '18:00', is_closed: false },
  wednesday: { open_time: '09:00', close_time: '18:00', is_closed: false },
  thursday: { open_time: '09:00', close_time: '18:00', is_closed: false },
  friday: { open_time: '09:00', close_time: '18:00', is_closed: false },
  saturday: { open_time: '09:00', close_time: '18:00', is_closed: false },
  sunday: { open_time: '09:00', close_time: '18:00', is_closed: false },
  timezone: 'Europe/Moscow',
};

describe('validateSchedulePayload', () => {
  it('returns errors for both empty times (both controls invalid)', () => {
    const payload: SchedulePayload = {
      ...baseValidPayload,
      monday: { open_time: undefined, close_time: undefined, is_closed: false },
    };

    const errors = validateSchedulePayload(payload);

    expect(errors.monday).toBeDefined();
    expect(errors.monday?.open).toBe('Укажите время открытия и закрытия');
    expect(errors.monday?.close).toBe('Укажите время открытия и закрытия');
  });

  it('returns error only for open time when close is set', () => {
    const payload: SchedulePayload = {
      ...baseValidPayload,
      monday: { open_time: undefined, close_time: '18:00', is_closed: false },
    };

    const errors = validateSchedulePayload(payload);

    expect(errors.monday).toBeDefined();
    expect(errors.monday?.open).toBe('Укажите время открытия');
    expect(errors.monday?.close).toBeUndefined();
  });

  it('returns error only for close time when open is set', () => {
    const payload: SchedulePayload = {
      ...baseValidPayload,
      monday: { open_time: '09:00', close_time: undefined, is_closed: false },
    };

    const errors = validateSchedulePayload(payload);

    expect(errors.monday).toBeDefined();
    expect(errors.monday?.close).toBe('Укажите время закрытия');
    expect(errors.monday?.open).toBeUndefined();
  });

  it('returns error only for close time when open >= close', () => {
    const payload: SchedulePayload = {
      ...baseValidPayload,
      monday: { open_time: '19:00', close_time: '18:00', is_closed: false },
    };

    const errors = validateSchedulePayload(payload);

    expect(errors.monday).toBeDefined();
    expect(errors.monday?.close).toBe('Время открытия должно быть раньше времени закрытия');
    expect(errors.monday?.open).toBeUndefined();
  });

  it('ignores closed days even if times are empty', () => {
    const payload: SchedulePayload = {
      ...baseValidPayload,
      monday: { open_time: undefined, close_time: undefined, is_closed: true },
    };

    const errors = validateSchedulePayload(payload);

    expect(errors.monday).toBeUndefined();
  });
});
