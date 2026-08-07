import { describe, it, expect, beforeEach } from 'vitest';
import { readingsDb } from '../../db.js';
import { saveAiHistoryEntry } from '../saveReading.js';
import { isAiModuleId } from '../types.js';
import { planCreditSettlement, CREDIT_RATES } from '../../constants/creditRates.js';

describe('saveAiHistoryEntry', () => {
  const id = `test_reading_${Date.now()}`;

  beforeEach(() => {
    try {
      readingsDb.delete(id);
    } catch {
      // ignore
    }
  });

  it('saves main reading resultText', () => {
    saveAiHistoryEntry({
      moduleId: 'tarot',
      historyEntry: {
        id,
        question: 'งานจะดีไหม',
        spreadMode: 'three',
        title: 'ไพ่ทดสอบ',
      },
      fullText: '## ภาพรวม\nดี',
      creditsUsed: 3,
    });

    const row = readingsDb.getById(id);
    expect(row).toBeTruthy();
    const data = JSON.parse(row!.data);
    expect(data.resultText).toContain('ภาพรวม');
    expect(data.creditsUsed).toBe(3);
    expect(data.question).toBe('งานจะดีไหม');
  });

  it('merges follow-up into chatHistory without replacing resultText', () => {
    saveAiHistoryEntry({
      moduleId: 'tarot',
      historyEntry: {
        id,
        question: 'งานจะดีไหม',
        spreadMode: 'three',
        resultText: '## ผลเดิม\nต้นฉบับ',
      },
      fullText: '## ผลเดิม\nต้นฉบับ',
      creditsUsed: 2,
    });

    saveAiHistoryEntry({
      moduleId: 'tarot_followup',
      historyEntry: {
        id,
        question: 'งานจะดีไหม',
        spreadMode: 'three',
        resultText: '## ผลเดิม\nต้นฉบับ',
        chatHistory: [{ role: 'user', content: 'แล้วเรื่องเงินล่ะ', id: 'u1' }],
      },
      fullText: '## สรุปคำตอบ\nเงินโอเค',
      creditsUsed: 1,
    });

    const data = JSON.parse(readingsDb.getById(id)!.data);
    expect(data.resultText).toBe('## ผลเดิม\nต้นฉบับ');
    expect(Array.isArray(data.chatHistory)).toBe(true);
    expect(data.chatHistory.some((m: { content: string }) => m.content.includes('เงินล่ะ'))).toBe(
      true
    );
    expect(data.chatHistory.some((m: { content: string }) => m.content.includes('เงินโอเค'))).toBe(
      true
    );
    expect(data.creditsUsed).toBe(3);
  });
});

describe('isAiModuleId', () => {
  it('accepts known modules only', () => {
    expect(isAiModuleId('tarot')).toBe(true);
    expect(isAiModuleId('tarot_followup')).toBe(true);
    expect(isAiModuleId('freeform')).toBe(false);
    expect(isAiModuleId('')).toBe(false);
    expect(isAiModuleId(null)).toBe(false);
  });
});

describe('reserve settlement policy', () => {
  it('reserve 2 settles correctly for typical costs', () => {
    const reserve = CREDIT_RATES.RESERVE_CREDITS_PER_REQUEST;
    expect(planCreditSettlement(reserve, 1)).toMatchObject({ refund: 1, netCharged: 1 });
    expect(planCreditSettlement(reserve, 2)).toMatchObject({ refund: 0, extraDeduct: 0, netCharged: 2 });
    expect(planCreditSettlement(reserve, 10)).toMatchObject({ extraDeduct: 8, netCharged: 10 });
  });
});
