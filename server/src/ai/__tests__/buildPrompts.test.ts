import { describe, it, expect } from 'vitest';
import { buildModulePrompts } from '../buildPrompts.js';
import { planCreditSettlement, CREDIT_RATES, calculateCreditsFromTokens } from '../../constants/creditRates.js';

describe('buildModulePrompts', () => {
  it('builds tarot prompts from structured payload', () => {
    const { systemPrompt, userPrompt } = buildModulePrompts('tarot', {
      question: 'งานจะดีไหม',
      spreadMode: 'three',
      deckFilter: 'all',
      drawnCards: [
        {
          position: 'อดีต',
          isReversed: false,
          card: {
            nameTh: 'เดอะฟูล',
            nameEn: 'The Fool',
            keywords: ['เริ่มต้น'],
            uprightMeaning: 'เริ่มต้นใหม่',
            reversedMeaning: 'ลังเล',
            element: 'ลม',
            arcana: 'major',
          },
        },
      ],
    });
    expect(systemPrompt).toContain('หมอดูไพ่ยิปซี');
    expect(systemPrompt).toContain('## รูปแบบผลลัพธ์');
    expect(userPrompt).toContain('งานจะดีไหม');
    expect(userPrompt).toContain('เดอะฟูล');
  });

  it('rejects tarot without cards', () => {
    expect(() => buildModulePrompts('tarot', { drawnCards: [] })).toThrow(/drawnCards/);
  });

  it('builds tarot_followup prompts without main reading directives', () => {
    const { systemPrompt, userPrompt } = buildModulePrompts('tarot_followup', {
      question: 'งานจะดีไหม',
      spreadMode: 'three',
      initialResult: '## ภาพรวมดวงชะตา\nงานราบรื่นดี',
      newQuestion: 'แล้วมีโอกาสย้ายงานไหม?',
      chatHistory: [
        { role: 'user', content: 'แล้วมีโอกาสย้ายงานไหม?' }
      ],
      drawnCards: [
        {
          position: 'อดีต',
          isReversed: false,
          card: {
            nameTh: 'เดอะฟูล',
            nameEn: 'The Fool',
            keywords: ['เริ่มต้น'],
            uprightMeaning: 'เริ่มต้นใหม่',
            reversedMeaning: 'ลังเล',
            element: 'ลม',
            arcana: 'major',
          },
        },
      ],
    });

    expect(systemPrompt).toContain('Follow-up Question Directives');
    expect(systemPrompt).toContain('## สรุปคำตอบ');
    expect(userPrompt).not.toContain('โปรดทำนายอย่างละเอียด ลึกซึ้ง ตามหัวข้อมาตรฐาน');
    expect(userPrompt).toContain('[คำถามเพิ่มเติมรอบนี้ที่ต้องตอบ]');
    expect(userPrompt).toContain('แล้วมีโอกาสย้ายงานไหม?');
  });

  it('builds horoscope prompts', () => {
    const { systemPrompt, userPrompt } = buildModulePrompts('horoscope', {
      signNameTh: 'เมษ',
      elementTh: 'ไฟ',
      timeframe: 'daily',
    });
    expect(systemPrompt).toContain('ราศี');
    expect(userPrompt).toContain('เมษ');
  });

  it('builds numerology prompts', () => {
    const { userPrompt } = buildModulePrompts('numerology', {
      digitsStr: '0958889999',
      sumValue: 75,
      sumTitle: 'เลขทดสอบ',
      pairsSummary: '88 (คู่ดี)',
    });
    expect(userPrompt).toContain('0958889999');
    expect(userPrompt).toContain('75');
  });

  it('builds feng_shui and thai_astrology prompts', () => {
    const fs = buildModulePrompts('feng_shui', {
      dayNameTh: 'จันทร์',
      luckyWork: 'เขียว',
      luckyWealth: 'ทอง',
      luckyLove: 'ชมพู',
      unluckyForbidden: 'ดำ',
      selectedSpace: 'โต๊ะทำงาน',
    });
    expect(fs.systemPrompt).toContain('ฮวงจุ้ย');
    expect(fs.userPrompt).toContain('โต๊ะทำงาน');

    const th = buildModulePrompts('thai_astrology', {
      birthDate: '1995-06-15',
      dayOfWeekTh: 'พฤหัสบดี',
      elementTh: 'ไม้',
      peakAgeRange: '28-35',
      summaryGuidance: 'พื้นดวงมั่นคง',
    });
    expect(th.systemPrompt).toContain('กราฟชีวิต');
    expect(th.userPrompt).toContain('1995-06-15');
  });
});

describe('planCreditSettlement', () => {
  it('refunds when actual < reserved', () => {
    expect(planCreditSettlement(2, 1)).toEqual({
      extraDeduct: 0,
      refund: 1,
      netCharged: 1,
    });
  });

  it('extra deducts when actual > reserved', () => {
    expect(planCreditSettlement(2, 5)).toEqual({
      extraDeduct: 3,
      refund: 0,
      netCharged: 5,
    });
  });

  it('full refund when actual is 0 (failed request)', () => {
    expect(planCreditSettlement(CREDIT_RATES.RESERVE_CREDITS_PER_REQUEST, 0)).toEqual({
      extraDeduct: 0,
      refund: CREDIT_RATES.RESERVE_CREDITS_PER_REQUEST,
      netCharged: 0,
    });
  });
});

describe('calculateCreditsFromTokens', () => {
  it('weights output higher than input', () => {
    expect(calculateCreditsFromTokens({ prompt_tokens: 1000, completion_tokens: 0 })).toBe(1);
    expect(calculateCreditsFromTokens({ prompt_tokens: 0, completion_tokens: 1000 })).toBe(4);
  });

  it('floors fractional total so customers are not rounded up', () => {
    // 4517*1/1000 + 1153*4/1000 = 4.517 + 4.612 = 9.129 → floor 9
    expect(
      calculateCreditsFromTokens({ prompt_tokens: 4517, completion_tokens: 1153 })
    ).toBe(9);
  });

  it('still charges at least 1 credit for tiny usage', () => {
    expect(calculateCreditsFromTokens({ prompt_tokens: 10, completion_tokens: 5 })).toBe(1);
  });
});
