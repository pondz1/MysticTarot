import type { DrawnCard, SpreadMode } from '../../features/tarot/types/tarot';
import type { ApiSettings, ChatMessage, SavedReading } from '../../types';
import { getSpreadConfig } from '../../features/tarot/data/tarotSpreads';
import { requestAiCompletion } from './aiClient';
import { buildFallbackMarkdown } from './markdownFormat';

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
    ? `\n\n🎯 **วัตถุประสงค์และแนวทางวิเคราะห์เฉพาะสำหรับสเปรดนี้ (${spreadConfig.titleTh})**:\n👉 ${spreadConfig.aiGuideline}`
    : '';

  // ใช้ system prompt ต้นฉบับครบถ้วน (บทบาท + กฎ 1–5 + โครง 4 หัวข้อ)
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

5. **การจัดรูปแบบผลทำนายด้วย Markdown ที่สวยงาม**:
   - ใช้ Markdown Headings (##), ข้อความตัวหนา (**Bold**), และ Bullet points เพื่อให้อ่านง่ายและน่าเลื่อมใส
   - ใช้ Blockquote (>) สำหรับคำคมหรือข้อคิดปิดท้าย
   - หัวข้อย่อยของไพ่แต่ละใบในสเปรดใช้ ### ตามลำดับตำแหน่ง

📌 **โครงสร้างผลทำนายที่ต้องใช้เป็นมาตรฐาน** (ห้ามย่อหรือเปลี่ยนชื่อหัวข้อ):
## 🔮 ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})
(เกริ่นเปิดภาพรวมดวงชะตา วิเคราะห์สัดส่วน Major/Minor Arcana และสะท้อนพลังงานไพ่ด้วยภาษาสละสลวย)

## 🃏 วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด
(วิเคราะห์ไพ่แต่ละใบตามตำแหน่งอย่างมีมิติ เชื่อมโยงความหมาย ไพ่ตั้งหัว/กลับหัว ธาตุประจำไพ่ และบริบทเรื่องที่ถาม — ใช้ ### ทีละใบ)

## 💡 บทสรุปคำตอบตรงประเด็นคำถาม
(ฟันธงตอบสิ่งที่ผู้ใช้ถามอย่างตรงจุด ชัดเจน และมีสติปัญญา)

## 🌟 คำแนะนำและข้อคิดชี้ทางจากจักรวาล
(แจงคำแนะนำที่นำไปปฏิบัติได้จริงเป็นข้อๆ Actionable Advice)

> 🌌 *คำคม/Affirmation ประจำการเปิดไพ่ครั้งนี้*`;

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
        heading: `🔮 ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})`,
        body: `สำหรับการเปิดไพ่ถามถึง ${qText} ด้วยสเปรด **${spreadConfig.titleTh}** พลังงานแห่งจักรวาลสะท้อนบทเรียนและโอกาสในชีวิตของคุณดังนี้`,
      },
      {
        heading: '🃏 วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด',
        body: cardsSection.trim(),
      },
      {
        heading: '💡 บทสรุปคำตอบตรงประเด็นคำถาม',
        body: `พลังแห่งไพ่หลัก **${mainCard.nameTh}** บ่งบอกถึงจุดเริ่มต้นที่สำคัญ ขณะที่ไพ่ **${outcomeCard.nameTh}** ชี้แนะเส้นทางไปสู่ผลลัพธ์ของเรื่อง ${qText}`,
      },
      {
        heading: '🌟 คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
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
