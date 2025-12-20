import { describe, expect, it } from 'vitest';

import {
  getWorkingHoursForDate,
  getWorkingHoursRangeForWeek,
  getWorkingTimeSlots,
  isSpecialDateClosed,
  isTimeInWorkingHours,
} from '../scheduleHelpers';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';

const createRegularDay = (
  day: NonNullable<OperatingHoursResponseDto['day_of_week']>,
  open: { hour: number; minute: number },
  close: { hour: number; minute: number },
  isClosed = false
): OperatingHoursResponseDto => ({
  uuid: `${day}-uuid`,
  service_center_uuid: 'sc-1',
  timezone: 'Europe/Moscow',
  day_of_week: day,
  specific_date: null,
  open_time: open,
  close_time: close,
  is_closed: isClosed,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
});

const createSpecialDate = (
  date: string,
  isClosed: boolean,
  open?: { hour: number; minute: number } | null,
  close?: { hour: number; minute: number } | null
): OperatingHoursResponseDto => ({
  uuid: `${date}-uuid`,
  service_center_uuid: 'sc-1',
  timezone: 'Europe/Moscow',
  day_of_week: null,
  specific_date: date,
  open_time: open ?? null,
  close_time: close ?? null,
  is_closed: isClosed,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
});

const monday = new Date(Date.UTC(2023, 0, 2, 12, 0, 0));

describe('scheduleHelpers', () => {
  it('detects closed special dates', () => {
    const special = [createSpecialDate('2023-01-02', true)];

    expect(isSpecialDateClosed(monday, special)).toBe(true);
    expect(isSpecialDateClosed(new Date(Date.UTC(2023, 0, 3, 12, 0, 0)), special)).toBe(false);
  });

  it('prioritizes special dates over regular schedule', () => {
    const regular = [createRegularDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 })];
    const special = [createSpecialDate('2023-01-02', false, { hour: 11, minute: 0 }, { hour: 16, minute: 0 })];

    expect(getWorkingHoursForDate(monday, regular, special)).toEqual({ open: '11:00', close: '16:00' });
  });

  it('returns null for closed special dates even when regular hours exist', () => {
    const regular = [createRegularDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 })];
    const special = [createSpecialDate('2023-01-02', true, { hour: 0, minute: 0 }, { hour: 0, minute: 0 })];

    expect(getWorkingHoursForDate(monday, regular, special)).toBeNull();
  });

  it('checks whether a time is within working hours', () => {
    const workingHours = { open: '09:00', close: '18:00' };

    expect(isTimeInWorkingHours('09:00', workingHours)).toBe(true);
    expect(isTimeInWorkingHours('17:59', workingHours)).toBe(true);
    expect(isTimeInWorkingHours('18:00', workingHours)).toBe(false);
    expect(isTimeInWorkingHours('08:59', workingHours)).toBe(false);
  });

  it('builds hourly slots for a working day', () => {
    const regular = [createRegularDay('monday', { hour: 9, minute: 0 }, { hour: 12, minute: 0 })];

    expect(getWorkingTimeSlots(monday, regular, [])).toEqual(['09:00', '10:00', '11:00']);
  });

  it('returns empty slots for closed days', () => {
    const regular = [createRegularDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }, true)];

    expect(getWorkingTimeSlots(monday, regular, [])).toEqual([]);
  });

  it('calculates min and max hours for a week including specials', () => {
    const regular: OperatingHoursResponseDto[] = [
      createRegularDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }),
      createRegularDay('tuesday', { hour: 10, minute: 0 }, { hour: 20, minute: 0 }),
    ];
    const special = [createSpecialDate('2023-01-03', false, { hour: 8, minute: 0 }, { hour: 22, minute: 0 })];

    expect(getWorkingHoursRangeForWeek(monday, regular, special)).toEqual({ start: 8, end: 22 });
  });

  it('falls back to default range when there are no working days', () => {
    const regular: OperatingHoursResponseDto[] = [createRegularDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }, true)];

    expect(getWorkingHoursRangeForWeek(monday, regular, [])).toEqual({ start: 9, end: 18 });
  });
});