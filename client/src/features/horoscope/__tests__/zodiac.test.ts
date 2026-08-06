import { describe, it, expect } from 'vitest';
import { findZodiacSignByBirthdate } from '../data/zodiacData';

describe('findZodiacSignByBirthdate', () => {
  it('correctly maps Aries (Apr 13 - May 13)', () => {
    expect(findZodiacSignByBirthdate(4, 15).id).toBe('aries');
    expect(findZodiacSignByBirthdate(5, 10).id).toBe('aries');
  });

  it('correctly maps Leo (Aug 17 - Sep 16)', () => {
    expect(findZodiacSignByBirthdate(8, 20).id).toBe('leo');
  });

  it('correctly maps Capricorn across year end (Dec 16 - Jan 14)', () => {
    expect(findZodiacSignByBirthdate(12, 25).id).toBe('sagittarius');
    expect(findZodiacSignByBirthdate(1, 10).id).toBe('sagittarius');
  });

  it('fallback returns a valid ZodiacSign', () => {
    const sign = findZodiacSignByBirthdate(3, 20);
    expect(sign).toBeDefined();
    expect(sign.nameTh).toBeDefined();
  });
});
