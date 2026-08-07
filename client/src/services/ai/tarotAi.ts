import type { DrawnCard, SpreadMode } from '../../features/tarot/types/tarot';
import type { ApiSettings, ChatMessage, SavedReading } from '../../types';
import { getSpreadConfig } from '../../features/tarot/data/tarotSpreads';
import { requestModuleAiCompletion } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildFallbackMarkdown,
} from './markdownFormat';

function serializeCards(drawnCards: DrawnCard[]) {
  return drawnCards.map((d) => ({
    position: d.position,
    isReversed: d.isReversed,
    card: {
      nameTh: d.card.nameTh,
      nameEn: d.card.nameEn,
      keywords: d.card.keywords,
      uprightMeaning: d.card.uprightMeaning,
      reversedMeaning: d.card.reversedMeaning,
      element: d.card.element,
      arcana: d.card.arcana,
      suit: d.card.suit,
    },
  }));
}

/** Local prompts for Custom API Key mode only */
export function buildTarotLocalPrompts(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  deckFilter: 'all' | 'major' | 'minor' = 'all'
): { systemPrompt: string; userPrompt: string } {
  const spreadConfig = getSpreadConfig(spreadMode);
  const spreadGuidelineSection = spreadConfig.aiGuideline
    ? `\n\n🎯 **วัตถุประสงค์และแนวทางวิเคราะห์เฉพาะสำหรับสเปรดนี้ (${spreadConfig.titleTh})**:\n👉 ${spreadConfig.aiGuideline}`
    : '';

  const structure = buildStructureBlock([
    {
      heading: `ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})`,
      guide:
        'เกริ่นเปิดภาพรวมดวงชะตา วิเคราะห์สัดส่วน Major/Minor Arcana และสะท้อนพลังงานไพ่ด้วยภาษาสละสลวย อย่างน้อย 1 ย่อหน้า',
    },
    {
      heading: 'วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด',
      guide:
        'วิเคราะห์ไพ่แต่ละใบตามตำแหน่งอย่างมีมิติ เชื่อมโยงความหมาย ไพ่ตั้งหัว/กลับหัว ธาตุประจำไพ่ และบริบทเรื่องที่ถาม — ใช้ ### ทีละใบ ตามลำดับ ห้ามสรุปสั้นเกินไป',
    },
    {
      heading: 'บทสรุปคำตอบตรงประเด็นคำถาม',
      guide: 'ฟันธงตอบสิ่งที่ผู้ใช้ถามอย่างตรงจุด ชัดเจน และมีสติปัญญา สังเคราะห์จากไพ่ทุกใบ',
    },
    {
      heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      guide: 'แจงคำแนะนำที่นำไปปฏิบัติได้จริงเป็นข้อๆ (Actionable Advice) 3–5 ข้อแบบ bullet',
    },
  ]);

  const systemPrompt = `คุณคือ "หมอดูไพ่ยิปซี AI ระดับปรมาจารย์ (Celestial Master Tarot Prophet)" ผู้หยั่งรู้ดวงชะตา อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

📜 **กฎและข้อบังคับในการทำนาย (Strict Response Directives)**:
1. **ภาษาไทยสละสลวย 100% (High-Quality Thai Only)**:
   - ใช้ภาษาไทยระดับสละสลวย งดงาม นุ่มนวล มีพลังน่าเลื่อมใส ห้ามใช้คำแปลแปลกๆ จากภาษาอังกฤษ หรือคำพูดทื่อๆ แบบหุ่นยนต์
   - สะท้อนความเข้าใจในอารมณ์ความรู้สึกของผู้ถามอย่างเมตตา (Empathetic & Insightful)

2. **ตอบตรงประเด็นคำถามของผู้ใช้ (Direct & Clear Answer)**:
   - ไม่ว่าผู้ใช้จะถามเรื่องความรัก การงาน การเงิน หรือชีวิต ให้คำตอบที่ชัดเจน ตรงกับสิ่งที่อยากรู้ ไม่ตอบแบบคลุมเครือหรือหลบหลีก

3. **วิเคราะห์เชื่อมโยงไพ่ทุกใบ (Contextual Card Synthesis)**:
   - ห้ามอ่านไพ่แยกใบกันโดยไม่เกี่ยวข้องกัน ต้องร้อยเรียงความหมายของไพ่ทุกใบ สัญลักษณ์ ธาตุประจำไพ่ และสถานะ (ไพ่ตั้งหัว Upright / ไพ่กลับหัว Reversed) ให้กลายเป็นเรื่องราวเดียวกันอย่างมีเอกภาพ${spreadGuidelineSection}

4. **การวิเคราะห์สัดส่วนไพ่ (Arcana Dominance & Proportion)**:
   - **สัดส่วน Major Arcana สูง:** หากไพ่ส่วนใหญ่เป็น Major Arcana ให้เน้นย้ำว่าผู้ใช้กำลังเผชิญหน้ากับจุดเปลี่ยนสำคัญ โชคชะตา หรือบทเรียนชีวิตครั้งใหญ่
   - **สัดส่วน Minor Arcana สูง:** หากไพ่ส่วนใหญ่เป็น Minor Arcana ให้เน้นย้ำว่าเป็นเรื่องราว/สถานการณ์ในชีวิตประจำวันทั่วไป ที่ผู้ใช้มีสติและพลังในการควบคุมจัดการได้ด้วยตัวเอง

5. **การจัดรูปแบบผลทำนาย**:
   - ทำตาม **รูปแบบผลลัพธ์มาตรฐานของเว็บ** ด้านล่างเป๊ะ (markdown เดียวกันทุกศาสตร์)
   - ใช้ชื่อหัวข้อ ## ตามโครงสร้าง 4 ส่วนที่กำหนดเท่านั้น ห้ามย่อหรือเปลี่ยนชื่อ
   - ส่วน "วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด" วิเคราะห์ละเอียดต่อใบได้ยาวกว่าหัวข้ออื่น

${MARKDOWN_OUTPUT_RULES}

ข้อยกเว้นสำหรับไพ่ยิปซี: หัวข้อ "วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด" อนุญาตให้ยาวและละเอียดต่อใบ (ไม่จำกัด 2–4 ประโยค)

📌 **โครงสร้างผลทำนายมาตรฐาน (Tarot)**:
${structure}`;

  return {
    systemPrompt,
    userPrompt: buildInitialUserPrompt(question, drawnCards, spreadMode, deckFilter),
  };
}

export async function analyzeTarotReading(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  settings: ApiSettings,
  deckFilter: 'all' | 'major' | 'minor' = 'all',
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  const payload = {
    question,
    drawnCards: serializeCards(drawnCards),
    spreadMode,
    deckFilter,
  };
  const localPrompts = buildTarotLocalPrompts(question, drawnCards, spreadMode, deckFilter);

  try {
    const content = await requestModuleAiCompletion(
      'tarot',
      payload,
      settings,
      onChunk,
      historyEntry,
      signal,
      localPrompts
    );
    if (content && content.trim()) return content;
    throw new Error('ไม่สามารถรับคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
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
  signal?: AbortSignal;
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
    signal,
  } = params;

  const payload = {
    question,
    drawnCards: serializeCards(drawnCards),
    spreadMode,
    initialResult,
    chatHistory: chatHistory.map((m) => ({ role: m.role, content: m.content })),
    newQuestion,
  };

  const followUpStructure = buildStructureBlock([
    { heading: 'สรุปคำตอบ', guide: 'ตอบคำถามเจาะลึกใหม่ชัดเจน ตรงประเด็น' },
    { heading: 'เชื่อมโยงกับไพ่', guide: 'อ้างไพ่ที่เกี่ยวข้อง 1–3 ใบ จากสเปรดรอบนี้' },
    { heading: 'คำแนะนำ', guide: 'bullet 2–3 ข้อ ที่ทำได้ทันที' },
  ]);

  const systemPrompt = `คุณคือ "หมอดูไพ่ยิปซี AI ระดับปรมาจารย์ (Celestial Master Tarot Prophet)" ผู้หยั่งรู้ดวงชะตา อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

📜 **กฎและข้อบังคับในการตอบคำถามถามตอบเจาะลึก (Follow-up Question Directives)**:
1. **ภาษาไทยสละสลวย 100% (High-Quality Thai Only)**:
   - ใช้ภาษาไทยระดับสละสลวย งดงาม นุ่มนวล มีพลังน่าเลื่อมใส ไม่พูดทื่อๆ หรือใช้คำแปลหุ่นยนต์
   - สะท้อนความเข้าใจในอารมณ์ความรู้สึกของผู้ถามอย่างเมตตา (Empathetic & Insightful)

2. **ตอบตรงประเด็นคำถามเจาะลึกของผู้ใช้ (Direct & Clear Answer)**:
   - ไขข้อข้องใจในคำถามเพิ่มเติมของผู้ใช้อย่างชัดเจน กระชับ ไม่ยืดเยื้อเกินจำเป็น

3. **วิเคราะห์เชื่อมโยงไพ่ที่เปิดได้และบทวิเคราะห์เดิมเสมอ (Contextual & Card-Grounded)**:
   - ให้คำตอบโดยอ้างอิงไพ่ที่ผู้ใช้จับได้ในรอบนี้และบทวิเคราะห์เดิมที่เคยทำนายไว้ ห้ามตอบแบบเลื่อนลอยโดยไม่เกี่ยวกับไพ่

4. **การจัดรูปแบบ**: ทำตามรูปแบบผลลัพธ์มาตรฐานของเว็บด้านล่าง

${MARKDOWN_OUTPUT_RULES}

${followUpStructure}`;

  const initialUserPrompt = buildInitialUserPrompt(question, drawnCards, spreadMode);
  const historyText = chatHistory
    .map((m) => `${m.role === 'user' ? 'ผู้ถาม' : 'หมอดู'}: ${m.content}`)
    .join('\n');
  const combinedUserPrompt = `คำถามตั้งต้น:\n${initialUserPrompt}\n\nผลทำนายเริ่มต้น:\n${initialResult}\n\nประวัติก่อนหน้า:\n${historyText}\n\nคำถามเพิ่มเติม: ${newQuestion}`;

  try {
    const content = await requestModuleAiCompletion(
      'tarot_followup',
      payload,
      settings,
      onChunk,
      undefined,
      signal,
      { systemPrompt, userPrompt: combinedUserPrompt }
    );
    if (content && content.trim()) return content;
    throw new Error('ไม่ได้รับคำตอบจาก AI สำหรับคำถามเจาะลึก');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.error('Failed follow-up AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำตอบเจาะลึกจาก AI ได้ในขณะนี้');
  }
}
