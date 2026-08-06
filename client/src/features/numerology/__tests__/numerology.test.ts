import { describe, it, expect } from 'vitest';
import { analyzeNumerologyInput } from '../data/numerologyData';

describe('analyzeNumerologyInput', () => {
  it('returns null for empty input', () => {
    expect(analyzeNumerologyInput('')).toBeNull();
  });

  it('correctly calculates digit sum for phone number', () => {
    // 0 + 9 + 5 + 8 + 8 + 8 + 8 + 9 + 9 + 9 = 73
    const result = analyzeNumerologyInput('0958888999');
    expect(result).not.toBeNull();
    expect(result?.cleanDigits).toBe('0958888999');
    expect(result?.sumValue).toBe(73);
  });

  it('converts Thai license plate characters to numbers and sums correctly', () => {
    // 9 + ก (1) + ข (2) + 3 + 6 + 5 + 4 = 30
    const result = analyzeNumerologyInput('9กข3654');
    expect(result).not.toBeNull();
    expect(result?.sumValue).toBe(30);
  });

  it('generates pair analyses for digit transitions', () => {
    const result = analyzeNumerologyInput('3654');
    expect(result).not.toBeNull();
    expect(result?.pairAnalyses.length).toBeGreaterThan(0);
  });
});
