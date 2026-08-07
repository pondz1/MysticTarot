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
    ? `\n\nแนวทางเฉพาะสเปรดนี้ (${spreadConfig.titleTh}):\n${spreadConfig.aiGuideline}`
    : '';

  // หัวข้อมาตรฐานเดิมของ tarot — ละเอียดกว่าโครง life-aspect ทั่วไป
  const structure = buildStructureBlock([
    {
      heading: `ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})`,
      guide:
        'เกริ่นเปิดภาพรวมอย่างมีมิติ วิเคราะห์สัดส่วน Major/Minor Arcana พลังงานรวมของสำรับ และโทนเรื่องราวที่ไพ่สื่อ อย่างน้อย 1 ย่อหน้า',
    },
    {
      heading: 'วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด',
      guide:
        'ใช้ ### ทีละใบ ตามลำดับตำแหน่ง: ชื่อตำแหน่ง + ชื่อไพ่ + ตั้งหัว/กลับหัว แล้ววิเคราะห์เชิงลึก เชื่อมสัญลักษณ์ ธาตุ คีย์เวิร์ด กับบริบทคำถามและไพ่ใบอื่น ห้ามสรุปสั้นเกินไป',
    },
    {
      heading: 'บทสรุปคำตอบตรงประเด็นคำถาม',
      guide:
        'ฟันธงตอบสิ่งที่ผู้ใช้ถามอย่างตรงจุด ชัดเจน สังเคราะห์จากไพ่ทุกใบเป็นภาพรวมคำตอบ (ไม่ใช่ทวนทีละใบซ้ำ)',
    },
    {
      heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      guide:
        'แจงคำแนะนำที่นำไปปฏิบัติได้จริงเป็น bullet 3–5 ข้อ (Actionable Advice) ครอบคลุมใจความคำถาม',
    },
  ]);

  const systemPrompt = `คุณคือหมอดูไพ่ยิปซีระดับปรมาจารย์ อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญา

กฎและข้อบังคับในการทำนาย:
1. ภาษาไทยสละสลวย 100% — นุ่มนวล มีพลัง อ่านแล้วรู้สึกเข้าใจ ไม่พูดทื่อแบบหุ่นยนต์
2. ตอบตรงประเด็นคำถาม — ชัดเจน ไม่คลุมเครือหรือหลบหลีก
3. วิเคราะห์เชื่อมโยงไพ่ทุกใบ — ห้ามอ่านแยกใบโดยไม่เกี่ยวข้อง ต้องร้อยเป็นเรื่องราวเดียว
4. วิเคราะห์สัดส่วน Arcana:
   - Major Arcana เยอะ = เน้นจุดเปลี่ยนสำคัญ โชคชะตา หรือบทเรียนชีวิตครั้งใหญ่
   - Minor Arcana เยอะ = เรื่องในชีวิตประจำวันที่ผู้ใช้ควบคุมจัดการได้
5. ระบุไพ่ตั้งหัว (Upright) / กลับหัว (Reversed) ให้ชัดทุกใบ
6. วิเคราะห์ให้ละเอียดพอ — โดยเฉพาะส่วน "วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด" ต้องมีเนื้อหาเชิงลึกต่อใบ${spreadGuidelineSection}

${MARKDOWN_OUTPUT_RULES}

หมายเหตุหัวข้อ: ใช้ชื่อหัวข้อ ## ตามโครงสร้างด้านล่างเป๊ะ (ห้ามย่อหรือเปลี่ยนชื่อ) เพื่อให้ผลทำนายละเอียดและสม่ำเสมอ

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
        heading: `ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})`,
        body: `สำหรับการเปิดไพ่ถามถึง ${qText} ด้วยสเปรด **${spreadConfig.titleTh}** พลังงานแห่งจักรวาลสะท้อนบทเรียนและโอกาสในชีวิตของคุณดังนี้`,
      },
      {
        heading: 'วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด',
        body: cardsSection.trim(),
      },
      {
        heading: 'บทสรุปคำตอบตรงประเด็นคำถาม',
        body: `พลังแห่งไพ่หลัก **${mainCard.nameTh}** บ่งบอกถึงจุดเริ่มต้นที่สำคัญ ขณะที่ไพ่ **${outcomeCard.nameTh}** ชี้แนะเส้นทางไปสู่ผลลัพธ์ของเรื่อง ${qText}`,
      },
      {
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: `- **คำแนะนำหลัก:** ${mainCard.advice}\n- **พลังบวกนำทาง:** ${outcomeCard.advice}`,
      },
    ],
    'ไพ่ยิปซีคือเข็มทิศชี้ทาง — ทางเดินอยู่ในมือของคุณเอง'
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

โปรดทำนายอย่างละเอียด ลึกซึ้ง ตามหัวข้อมาตรฐาน:
1) ภาพรวมดวงชะตาและพลังงานไพ่
2) วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด (ทีละใบ)
3) บทสรุปคำตอบตรงประเด็นคำถาม
4) คำแนะนำและข้อคิดชี้ทางจากจักรวาล
เชื่อมโยงความหมายไพ่กับตำแหน่ง วิเคราะห์สัดส่วน Major/Minor และตอบตรงคำถาม`;
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
    throw new Error('ไม่ได้รับคำตอบจาก AI สำหรับคำถามเจาะลึก');
  } catch (error: any) {
    console.error('Failed follow-up AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำตอบเจาะลึกจาก AI ได้ในขณะนี้');
  }
}
