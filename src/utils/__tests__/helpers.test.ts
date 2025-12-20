import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDate, formatPrice } from '../helpers';

const normalizeSpaces = (value: string): string => value.replace(/\u00a0|\u202f/g, ' ');

describe('helpers', () => {
  describe('formatDate', () => {
    it('formats Date instances with ru locale by default', () => {
      const date = new Date(Date.UTC(2023, 0, 15, 12, 0, 0));

      expect(formatDate(date)).toBe('15.01.2023');
    });

    it('formats date strings with custom locale', () => {
      const dateString = '2023-07-01T12:00:00Z';

      expect(formatDate(dateString, 'en-US')).toBe('7/1/2023');
    });
  });

  describe('formatCurrency', () => {
    it('renders rubles with non-breaking spaces', () => {
      const formatted = formatCurrency(1234.5, 'RUB', 'ru-RU');

      expect(normalizeSpaces(formatted)).toBe('1 234,50 \u20bd');
    });

    it('renders other currencies with provided locale', () => {
      expect(formatCurrency(99.99, 'USD', 'en-US')).toBe('$99.99');
    });
  });

  describe('formatPrice', () => {
    it('formats numbers with ru spacing and comma delimiter', () => {
      const formatted = formatPrice(1234.56);

      expect(normalizeSpaces(formatted)).toBe('1 234,56');
    });

    it('omits fractional part when not needed', () => {
      const formatted = formatPrice(1000);

      expect(normalizeSpaces(formatted)).toBe('1 000');
    });
  });
});