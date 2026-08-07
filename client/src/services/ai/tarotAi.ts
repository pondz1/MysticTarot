import type { DrawnCard, SpreadMode } from '../../features/tarot/types/tarot';
import type { ApiSettings, ChatMessage, SavedReading } from '../../types';
import { getSpreadConfig } from '../../features/tarot/data/tarotSpreads';
import { requestAiCompletion } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildFallbackMarkdown,
} from './markdownFormat';

export async function analyzeTarotReading(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  settings: ApiSettings,
  deckFilter: 'all' | 'major' | 'minor' = 'all',
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const spreadConfig = getSpreadConfig(spreadMode);

  const spreadGuidelineSection = spreadConfig.aiGuideline
    ? `\n\nแนวทางเฉพาะสเปรดนี้ (${spreadConfig.titleTh}): ${spreadConfig.aiGuideline}`
    : '';

  const structure = buildStructureBlock([
    {
      heading: `ภาพรวมดวงชะตา (${spreadConfig.titleTh})`,
      guide: 'สรุปพลังงานรวม สัดส่วน Major/Minor Arcana และโทนเรื่องราว 2–4 ประโยค',
    },
    {
      heading: 'วิเคราะห์ไพ่ตามตำแหน่ง',
      guide: 'ใช้ ### ทีละใบ: ตำแหน่ง + ชื่อไพ่ + ตั้งหัว/กลับหัว แล้วอธิบายสั้น เชื่อมโยงคำถาม',
    },
    {
      heading: 'สรุปคำตอบตรงประเด็น',
      guide: 'ฟันธงตอบคำถามผู้ใช้ชัดเจน 1 ย่อหน้า',
    },
    {
      heading: 'คำแนะนำ',
      guide: 'action ที่ทำได้จริง 2–4 ข้อแบบ bullet',
    },
  ]);

  const systemPrompt = `คุณคือหมอดูไพ่ยิปซีที่อบอุ่น ตรงประเด็น และเชื่อมโยงความหมายไพ่เป็นเรื่องราวเดียวกัน

กฎการทำนาย:
1. ภาษาไทยสละสลวย อ่านง่าย ไม่พูดทื่อแบบหุ่นยนต์
2. ตอบตรงคำถาม ห้ามคลุมเครือเกินจำเป็น
3. ห้ามอ่านไพ่แยกใบโดยไม่เชื่อมกัน — ร้อยเป็นเรื่องเดียว
4. Major Arcana เยอะ = เน้นจุดเปลี่ยน/บทเรียนใหญ่; Minor Arcana เยอะ = เรื่องในชีวิตประจำวันที่ควบคุมได้
5. ระบุไพ่ตั้งหัว/กลับหัวให้ชัด${spreadGuidelineSection}

${MARKDOWN_OUTPUT_RULES}

${structure}`;

  const userPrompt = buildInitialUserPrompt(question, drawnCards, spreadMode, deckFilter);

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, settings, onChunk, historyEntry);
    if (content && content.trim()) {
      return content;
    }
    throw new Error('ไม่สามารถรับคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
    console.error('Failed Tarot AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ทำนายไพ่ยิปซีได้ในขณะนี้');
  }
}

export function generateFallbackReading(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  noticePrefix: string = ''
): string {
  const qText = question ? `"${question}"` : 'ดวงชะตารายวันและภาพรวมชีวิต';
  const spreadConfig = getSpreadConfig(spreadMode);

  let cardsSection = '';
  drawnCards.forEach((d, idx) => {
    const orientationText = d.isReversed ? 'ไพ่กลับหัว' : 'ไพ่ตั้งหัว';
    const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
    cardsSection += `### ${idx + 1}. ${d.position}: **${d.card.nameTh}** (${orientationText})
- **คีย์เวิร์ด:** ${d.card.keywords.join(', ')}
- **ความหมาย:** ${meaning}

`;
  });

  const mainCard = drawnCards[0].card;
  const outcomeCard = drawnCards[drawnCards.length - 1].card;

  const md = buildFallbackMarkdown(
    [
      {
        heading: `ภาพรวมดวงชะตา (${spreadConfig.titleTh})`,
        body: `สำหรับการเปิดไพ่เรื่อง ${qText} ด้วยสเปรด **${spreadConfig.titleTh}** พลังงานไพ่สะท้อนบทเรียนและโอกาสในชีวิตดังนี้`,
      },
      {
        heading: 'วิเคราะห์ไพ่ตามตำแหน่ง',
        body: cardsSection.trim(),
      },
      {
        heading: 'สรุปคำตอบตรงประเด็น',
        body: `ไพ่หลัก **${mainCard.nameTh}** ชี้จุดเริ่มต้น ขณะที่ **${outcomeCard.nameTh}** บ่งบอกทิศทางผลลัพธ์ของเรื่อง ${qText}`,
      },
      {
        heading: 'คำแนะนำ',
        body: `- ${mainCard.advice}\n- ${outcomeCard.advice}`,
      },
    ],
    'ไพ่คือเข็มทิศ — สติและการตัดสินใจในมือคุณจะกำหนดทางเดิน'
  );

  return `${noticePrefix}${md}`;
}

export function buildInitialUserPrompt(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  deckFilter: 'all' | 'major' | 'minor' = 'all'
): string {
  const spreadConfig = getSpreadConfig(spreadMode);

  const cardsDescription = drawnCards
    .map((d, index) => {
      const orientation = d.isReversed
        ? 'ไพ่กลับหัว (พลังงานติดขัด/มุมมองภายใน)'
        : 'ไพ่ตั้งหัว (พลังงานเปิดชัด)';
      const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
      const arcanaType =
        d.card.arcana === 'minor'
          ? `Minor Arcana - ชุด${
              d.card.suit === 'wands'
                ? 'ไม้เท้า'
                : d.card.suit === 'cups'
                  ? 'ถ้วย'
                  : d.card.suit === 'swords'
                    ? 'ดาบ'
                    : d.card.suit === 'pentacles'
                      ? 'เหรียญ'
                      : ''
            }`
          : 'Major Arcana';
      return `[ใบที่ ${index + 1}] ตำแหน่ง: ${d.position}
- ชื่อไพ่: ${d.card.nameTh} (${d.card.nameEn})
- หมวด: ${arcanaType}
- สถานะ: ${orientation}
- คีย์เวิร์ด: ${d.card.keywords.join(', ')}
- ความหมาย: ${meaning}
- ธาตุ: ${d.card.element}`;
    })
    .join('\n\n');

  const majorCount = drawnCards.filter((d) => d.card.arcana === 'major' || !d.card.arcana).length;
  const minorCount = drawnCards.filter((d) => d.card.arcana === 'minor').length;

  const filterText =
    deckFilter === 'major'
      ? 'สำรับ Major เท่านั้น'
      : deckFilter === 'minor'
        ? 'สำรับ Minor เท่านั้น'
        : 'สำรับเต็ม 78 ใบ';

  return `คำถาม: "${question || 'ดูดวงภาพรวมประจำวันและคำแนะนำชีวิต'}"
สเปรด: ${spreadConfig.titleTh} (${spreadConfig.badge})
จำนวนไพ่: ${drawnCards.length}
โหมดสำรับ: ${filterText}
สัดส่วน: Major ${majorCount} / Minor ${minorCount}

แนวทางสเปรด: ${spreadConfig.aiGuideline || 'วิเคราะห์เชื่อมโยงไพ่กับตำแหน่ง'}

ไพ่ที่ได้:
${cardsDescription}

โปรดตอบตามโครงสร้าง markdown ที่กำหนด เชื่อมโยงไพ่ทุกใบ และตอบตรงคำถาม`;
}

export async function analyzeTarotFollowUp(params: {
  question: string;
  drawnCards: DrawnCard[];
  spreadMode: SpreadMode;
  initialResult: string;
  chatHistory: ChatMessage[];
  newQuestion: string;
  settings: ApiSettings;
  onChunk?: (chunk: string) => void;
}): Promise<string> {
  const {
    question,
    drawnCards,
    spreadMode,
    initialResult,
    chatHistory,
    newQuestion,
    settings,
    onChunk,
  } = params;

  const systemPrompt = `คุณคือหมอดูไพ่ยิปซี ตอบคำถามเจาะลึกต่อจากผลทำนายเดิม

กฎ:
1. ภาษาไทยสละสลวย ตรงประเด็น กระชับ
2. อ้างอิงไพ่ที่เปิดได้และบทวิเคราะห์เดิมเสมอ
3. ห้ามตอบเลื่อนลอยโดยไม่เกี่ยวกับไพ่

${MARKDOWN_OUTPUT_RULES}

รูปแบบคำตอบ follow-up:
## สรุปคำตอบ
(ตอบคำถามใหม่ชัดเจน)

## เชื่อมโยงกับไพ่
(อ้างไพ่ที่เกี่ยวข้อง 1–3 ใบ)

## คำแนะนำ
(bullet 2–3 ข้อ)

> **คำแนะนำสั้น:** …`;

  const initialUserPrompt = buildInitialUserPrompt(question, drawnCards, spreadMode);

  try {
    const historyText = chatHistory
      .map((m) => `${m.role === 'user' ? 'ผู้ถาม' : 'หมอดู'}: ${m.content}`)
      .join('\n');
    const combinedUserPrompt = `คำถามตั้งต้น:\n${initialUserPrompt}\n\nผลทำนายเริ่มต้น:\n${initialResult}\n\nประวัติก่อนหน้า:\n${historyText}\n\nคำถามเพิ่มเติม: ${newQuestion}`;
    const content = await requestAiCompletion(systemPrompt, combinedUserPrompt, settings, onChunk);
    if (content && content.trim()) {
      return content;
    }

    return generateFollowUpFallback(newQuestion, drawnCards);
  } catch (error: any) {
    console.error('Failed follow-up AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำตอบเจาะลึกจาก AI ได้ในขณะนี้');
  }
}

export function generateFollowUpFallback(
  newQuestion: string,
  drawnCards: DrawnCard[],
  noticePrefix: string = ''
): string {
  const mainCard = drawnCards[0]?.card;
  const outcomeCard = drawnCards[drawnCards.length - 1]?.card;

  const md = buildFallbackMarkdown(
    [
      {
        heading: 'สรุปคำตอบ',
        body: `เกี่ยวกับ **"${newQuestion}"** — จากพลังไพ่ในสเปรดนี้ ทิศทางยังเชื่อมกับบทเรียนของ **${mainCard?.nameTh || 'ไพ่หลัก'}** และ **${outcomeCard?.nameTh || 'ไพ่ผลลัพธ์'}**`,
      },
      {
        heading: 'เชื่อมโยงกับไพ่',
        body: `- **${mainCard?.nameTh || 'ไพ่หลัก'}:** ${mainCard?.advice || 'ยึดสติและความดีงาม'}\n- **${outcomeCard?.nameTh || 'ไพ่ผลลัพธ์'}:** ${outcomeCard?.advice || 'ก้าวเดินด้วยความมั่นใจ'}`,
      },
      {
        heading: 'คำแนะนำ',
        body: `- ทบทวนสถานการณ์ด้วยความสงบ\n- ลงมือทีละขั้นจากสิ่งที่ควบคุมได้`,
      },
    ],
    'ใช้ไพ่เป็นเข็มทิศ — การตัดสินใจปัจจุบันคือตัวเปลี่ยนทางเดิน'
  );

  return `${noticePrefix}${md}`;
}
