import { describe, expect, it } from 'vitest';

import {
  formatDaysRange,
  formatTime,
  groupDaysBySchedule,
  hasUniformSchedule,
  parseTime,
  validateTimeRange,
} from '../utils';
import type { OperatingHoursResponseDto } from '../../../../services/api-client/types.gen';

const createDay = (
  day: NonNullable<OperatingHoursResponseDto['day_of_week']>,
  open: { hour: number; minute: number } | null,
  close: { hour: number; minute: number } | null,
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
});

describe('SchedulePage utils', () => {
  describe('parseTime', () => {
    it('parses valid HH:mm strings', () => {
      expect(parseTime('09:30')).toEqual({ hour: 9, minute: 30 });
    });

    it('returns null for invalid inputs', () => {
      expect(parseTime('')).toBeNull();
      expect(parseTime('invalid')).toBeNull();
      expect(parseTime('09:xx')).toBeNull();
    });
  });

  describe('formatTime', () => {
    it('formats time objects with zero padding', () => {
      expect(formatTime({ hour: 9, minute: 5 })).toBe('09:05');
    });

    it('extracts hours and minutes from string inputs', () => {
      expect(formatTime('10:15:00')).toBe('10:15');
    });

    it('returns empty string for falsy values', () => {
      expect(formatTime(null)).toBe('');
      expect(formatTime(undefined)).toBe('');
    });
  });

  describe('validateTimeRange', () => {
    it('accepts ranges where close is later than open', () => {
      expect(validateTimeRange('09:00', '18:00')).toBe(true);
      expect(validateTimeRange('09:00', '09:30')).toBe(true);
    });

    it('rejects missing or equal/earlier ranges', () => {
      expect(validateTimeRange('', '18:00')).toBe(false);
      expect(validateTimeRange('18:00', '09:00')).toBe(false);
      expect(validateTimeRange('09:00', '09:00')).toBe(false);
    });
  });

  describe('groupDaysBySchedule', () => {
    it('groups days with identical schedules and preserves ordering', () => {
      const schedule: OperatingHoursResponseDto[] = [
        createDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }),
        createDay('tuesday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }),
        createDay('wednesday', { hour: 10, minute: 0 }, { hour: 17, minute: 0 }),
        createDay('thursday', null, null, true),
      ];

      expect(groupDaysBySchedule(schedule)).toEqual([
        {
          days: ['monday', 'tuesday'],
          openTime: '09:00',
          closeTime: '18:00',
          isClosed: false,
        },
        {
          days: ['wednesday'],
          openTime: '10:00',
          closeTime: '17:00',
          isClosed: false,
        },
        {
          days: ['thursday'],
          openTime: '',
          closeTime: '',
          isClosed: true,
        },
      ]);
    });
  });

  describe('formatDaysRange', () => {
    it('joins consecutive days into a range', () => {
      expect(formatDaysRange(['monday', 'tuesday', 'wednesday'])).toBe('Пн—Ср');
    });

    it('joins non-consecutive days with commas', () => {
      expect(formatDaysRange(['monday', 'wednesday', 'friday'])).toBe('Пн, Ср, Пт');
    });

    it('returns empty string for empty input', () => {
      expect(formatDaysRange([])).toBe('');
    });
  });

  describe('hasUniformSchedule', () => {
    it('detects equal schedule across days', () => {
      const schedule: OperatingHoursResponseDto[] = [
        createDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }),
        createDay('tuesday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }),
      ];

      expect(hasUniformSchedule(schedule)).toBe(true);
    });

    it('detects differing schedules or empty input', () => {
      const schedule: OperatingHoursResponseDto[] = [
        createDay('monday', { hour: 9, minute: 0 }, { hour: 18, minute: 0 }),
        createDay('tuesday', { hour: 10, minute: 0 }, { hour: 18, minute: 0 }),
      ];

      expect(hasUniformSchedule(schedule)).toBe(false);
      expect(hasUniformSchedule([])).toBe(false);
    });
  });
});