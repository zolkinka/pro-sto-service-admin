import { describe, expect, it } from 'vitest';

import {
  cleanPhoneForSubmit,
  extractPhoneDigits,
  formatPhone,
  isPhoneComplete,
  validatePhone,
} from '../../components/ui/AppPhoneInput/utils/phoneHelpers';

describe('phoneHelpers', () => {
  it('extracts digits and removes country code', () => {
    expect(extractPhoneDigits('+7 (916) 123-45-67')).toBe('9161234567');
    expect(extractPhoneDigits('79991234567')).toBe('9991234567');
  });

  it('validates phone numbers by digit count', () => {
    expect(validatePhone('9161234567')).toBe(true);
    expect(validatePhone('916-123-4567')).toBe(true);
    expect(validatePhone('123')).toBe(false);
  });

  it('formats phone numbers progressively with mask', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('916')).toBe('+7 (916');
    expect(formatPhone('9161234567')).toBe('+7 (916) 123-45-67');
  });

  it('checks completeness using extracted digits', () => {
    expect(isPhoneComplete('+7 (916) 123-45-67')).toBe(true);
    expect(isPhoneComplete('+7 (916) 123-45')).toBe(false);
  });

  it('cleans phone numbers for submit', () => {
    expect(cleanPhoneForSubmit('+7 (916) 123-45-67')).toBe('9161234567');
  });
});