import { describe, it, expect } from 'vitest';
import { cleanAiResponse, getSessionId } from '../aiClient';

describe('cleanAiResponse', () => {
  it('returns empty string when input is empty', () => {
    expect(cleanAiResponse('')).toBe('');
  });

  it('strips <think> tags correctly', () => {
    const raw = '<think>I should analyze this card</think>\n## ภาพรวมพลังงาน\nดวงของคุณสดใส';
    expect(cleanAiResponse(raw)).toBe('## ภาพรวมพลังงาน\nดวงของคุณสดใส');
  });

  it('anchors on ## headings (site standard)', () => {
    const raw = 'Some preamble noise\n\n## การงานและการเรียน\nงานไปได้ดี';
    expect(cleanAiResponse(raw)).toBe('## การงานและการเรียน\nงานไปได้ดี');
  });

  it('strips prompt leakage prefix sentences', () => {
    const raw =
      "We need to analyze this tarot spread.\n\nดวงชะตาของคุณกำลังจะเปลี่ยนแปลงไปในทางที่ดีขึ้น";
    expect(cleanAiResponse(raw)).toBe('ดวงชะตาของคุณกำลังจะเปลี่ยนแปลงไปในทางที่ดีขึ้น');
  });

  it('preserves clean markdown content', () => {
    const raw = '### การเงิน\nคุณจะได้รับโชคลาภจากการทำงาน';
    expect(cleanAiResponse(raw)).toBe('### การเงิน\nคุณจะได้รับโชคลาภจากการทำงาน');
  });
});

describe('getSessionId', () => {
  it('returns a valid string session id', () => {
    const id = getSessionId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});
