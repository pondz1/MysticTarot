import type { ApiSettings, ChatMessage, DrawnCard, SpreadMode } from '../../features/tarot/types/tarot';
import { getSpreadConfig } from '../../features/tarot/data/tarotSpreads';
import { requestAiCompletion } from './aiClient';

export async function analyzeTarotReading(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  settings: ApiSettings,
  deckFilter: 'all' | 'major' | 'minor' = 'all',
  onChunk?: (chunk: string) => void
): Promise<string> {
  const spreadConfig = getSpreadConfig(spreadMode);

  const spreadGuidelineSection = spreadConfig.aiGuideline
    ? `\n\n🎯 **วัตถุประสงค์และแนวทางวิเคราะห์เฉพาะสำหรับสเปรดนี้ (${spreadConfig.titleTh})**:\n👉 ${spreadConfig.aiGuideline}`
    : '';

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

📌 **โครงสร้างผลทำนายที่ต้องใช้เป็นมาตรฐาน**:
## 🔮 ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})
(เกริ่นเปิดภาพรวมดวงชะตา วิเคราะห์สัดส่วน Major/Minor Arcana และสะท้อนพลังงานไพ่ด้วยภาษาสละสลวย)

## 🃏 วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด
(วิเคราะห์ไพ่แต่ละใบตามตำแหน่งอย่างมีมิติ เชื่อมโยงความหมาย ไพ่ตั้งหัว/กลับหัว ธาตุประจำไพ่ และบริบทเรื่องที่ถาม)

## 💡 บทสรุปคำตอบตรงประเด็นคำถาม
(ฟันธงตอบสิ่งที่ผู้ใช้ถามอย่างตรงจุด ชัดเจน และมีสติปัญญา)

## 🌟 คำแนะนำและข้อคิดชี้ทางจากจักรวาล
(แจงคำแนะนำที่นำไปปฏิบัติได้จริงเป็นข้อๆ Actionable Advice)

> 🌌 *คำคม/Affirmation ประจำการเปิดไพ่ครั้งนี้*`;

  const userPrompt = buildInitialUserPrompt(question, drawnCards, spreadMode, deckFilter);

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, settings, onChunk);
    if (content && content.trim()) {
      return content;
    }
    return generateFallbackReading(question, drawnCards, spreadMode);
  } catch (error) {
    console.error('Failed AI request:', error);
    return generateFallbackReading(
      question,
      drawnCards,
      spreadMode,
      `⚠️ (ข้อความระบบ: ${error instanceof Error ? error.message : 'API Error'} - ระบบใช้ Smart AI Reader อัตโนมัติ)\n\n`
    );
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
    const orientationText = d.isReversed ? 'ไพ่กลับหัว (Reversed)' : 'ไพ่ตั้งหัว (Upright)';
    const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;

    cardsSection += `### ${idx + 1}. ${d.position}: **${d.card.nameTh}** (${orientationText})
* **ธาตุ/จักรราศี:** ${d.card.element} (${d.card.planetOrSign})
* **คีย์เวิร์ดสำคัญ:** ${d.card.keywords.join(', ')}
* **คำทำนายในตำแหน่งนี้:** ${meaning}

---

`;
  });

  const mainCard = drawnCards[0].card;
  const outcomeCard = drawnCards[drawnCards.length - 1].card;

  return `${noticePrefix}## 🔮 ภาพรวมการทำนาย: ${spreadConfig.titleTh}
สำหรับการเปิดไพ่ถามถึง ${qText} ด้วยสเปรด **${spreadConfig.titleTh}** พลังงานแห่งจักรวาลสะท้อนบทเรียนและโอกาสในชีวิตของคุณดังนี้

## 🃏 วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด

${cardsSection}

## 💡 สรุปเชื่อมโยงคำตอบเรื่อง (${qText})
พลังแห่งไพ่หลัก **${mainCard.nameTh}** บ่งบอกถึงจุดเริ่มต้นที่สำคัญ ขณะที่ไพ่ **${outcomeCard.nameTh}** ชี้แนะเส้นทางไปสู่ผลลัพธ์ จงใช้ปัญญา สติ และการตัดสินใจที่ถูกต้องตามคำชี้แนะของไพ่

## 🌟 คำแนะนำและข้อคิดจากจักรวาล
* **คำแนะนำหลัก:** ${mainCard.advice}
* **พลังบวกนำทาง:** ${outcomeCard.advice}

*จำไว้ว่า ไพ่ยิปซีคือเข็มทิศชี้ทาง แ่อยู่นในมือของคุณเอง*`;
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
        ? 'ไพ่กลับหัว (Reversed - พลังงานติดขัด/สะท้อนมุมมองภายใน)'
        : 'ไพ่ตั้งหัว (Upright - พลังงานสมบูรณ์/แสดงผลชัดเจน)';
      const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
      const arcanaType =
        d.card.arcana === 'minor'
          ? `Minor Arcana - ชุด${
              d.card.suit === 'wands'
                ? 'ไม้เท้า (Wands)'
                : d.card.suit === 'cups'
                ? 'ถ้วย (Cups)'
                : d.card.suit === 'swords'
                ? 'ดาบ (Swords)'
                : d.card.suit === 'pentacles'
                ? 'เหรียญ (Pentacles)'
                : ''
            }`
          : 'Major Arcana (ชุดใหญ่)';
      return `[ใบที่ ${index + 1}] ตำแหน่ง: ${d.position}
- ชื่อไพ่: ${d.card.nameTh} (${d.card.nameEn})
- หมวดหมู่ไพ่: ${arcanaType}
- สถานะ: ${orientation}
- คีย์เวิร์ด: ${d.card.keywords.join(', ')}
- ความหมายไพ่: ${meaning}
- ธาตุประจำไพ่: ${d.card.element}`;
    })
    .join('\n\n');

  const majorCount = drawnCards.filter((d) => d.card.arcana === 'major' || !d.card.arcana).length;
  const minorCount = drawnCards.filter((d) => d.card.arcana === 'minor').length;
  const totalDrawn = drawnCards.length;

  const filterText =
    deckFilter === 'major'
      ? 'ผู้ใช้เลือกเปิดด้วยสำรับ Major Arcana (22 ใบ) เท่านั้น'
      : deckFilter === 'minor'
      ? 'ผู้ใช้เลือกเปิดด้วยสำรับ Minor Arcana (56 ใบ) เท่านั้น'
      : 'ผู้ใช้เลือกเปิดด้วยสำรับใหญ่เต็มรูปแบบ (78 ใบ)';

  const proportionNote = `🔮 โหมดสำรับไพ่ที่เลือก: ${filterText}
📊 สัดส่วนไพ่ที่สุ่มจับได้จริงในรอบนี้: Major Arcana ${majorCount} ใบ / Minor Arcana ${minorCount} ใบ (จากไพ่ที่เปิดรวม ${totalDrawn} ใบ)`;

  return `คำถาม / สิ่งที่อยากรู้ของผู้ใช้: "${question || 'ดูดวงภาพรวมประจำวันและคำแนะนำชีวิต'}"
รูปแบบสเปรด: ${spreadConfig.titleTh} (${spreadConfig.badge})
จำนวนไพ่: ${drawnCards.length} ใบ
${proportionNote}

แนวทางการทำนายสเปรดนี้: ${spreadConfig.aiGuideline || 'วิเคราะห์เชื่อมโยงไพ่กับตำแหน่งอย่างรายละเอียด'}

ไพ่ที่จับได้ทั้งหมดตามตำแหน่ง:
${cardsDescription}

โปรดทำนายอย่างละเอียด ลึกซึ้ง เชื่อมโยงความหมายไพ่กับตำแหน่งในสเปรด วิเคราะห์พลังงานสัดส่วน Major/Minor Arcana และตอบตรงประเด็นคำถามของผู้ใช้`;
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
  const { question, drawnCards, spreadMode, initialResult, chatHistory, newQuestion, settings, onChunk } = params;

  const spreadConfig = getSpreadConfig(spreadMode);

  const spreadGuidelineSection = spreadConfig.aiGuideline
    ? `\n\n🎯 **วัตถุประสงค์และแนวทางวิเคราะห์เฉพาะสำหรับสเปรดนี้ (${spreadConfig.titleTh})**:\n👉 ${spreadConfig.aiGuideline}`
    : '';

  const systemPrompt = `คุณคือ "หมอดูไพ่ยิปซี AI ระดับปรมาจารย์ (Celestial Master Tarot Prophet)" ผู้หยั่งรู้ดวงชะตา อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

📜 **กฎและข้อบังคับในการตอบคำถามถามตอบเจาะลึก (Follow-up Question Directives)**:
1. **ภาษาไทยสละสลวย 100% (High-Quality Thai Only)**:
   - ใช้ภาษาไทยระดับสละสลวย งดงาม นุ่มนวล มีพลังน่าเลื่อมใส ไม่พูดทื่อๆ หรือใช้คำแปลหุ่นยนต์
   - สะท้อนความเข้าใจในอารมณ์ความรู้สึกของผู้ถามอย่างเมตตา (Empathetic & Insightful)

2. **ตอบตรงประเด็นคำถามเจาะลึกของผู้ใช้ (Direct & Clear Answer)**:
   - ไขข้อข้องใจในคำถามเพิ่มเติมของผู้ใช้อย่างชัดเจน กระชับ ไม่ยืดเยื้อเกินจำเป็น

3. **วิเคราะห์เชื่อมโยงไพ่ที่เปิดได้และบทวิเคราะห์เดิมเสมอ (Contextual & Card-Grounded)**:
   - ให้คำตอบโดยอ้างอิงไพ่ที่ผู้ใช้จับได้ในรอบนี้และบทวิเคราะห์เดิมที่เคยทำนายไว้ ห้ามตอบแบบเลื่อนลอยโดยไม่เกี่ยวกับไพ่${spreadGuidelineSection}

4. **การจัดรูปแบบ**:
   - ใช้ Markdown เช่น ข้อความตัวหนา (**Bold**), Bullet points (-), หรือ Blockquote (>) เพื่อให้อ่านง่ายและสวยงามน่าเลื่อมใส`;

  const initialUserPrompt = buildInitialUserPrompt(question, drawnCards, spreadMode);

  try {
    const historyText = chatHistory.map(m => `${m.role === 'user' ? 'ผู้ถาม' : 'หมอดู'}: ${m.content}`).join('\n');
    const combinedUserPrompt = `คำถามตั้งต้นของผู้ถาม:\n${initialUserPrompt}\n\nผลทำนายเริ่มต้น:\n${initialResult}\n\nประวัติคำถามตอบก่อนหน้า:\n${historyText}\n\nคำถามเพิ่มเติมใหม่: ${newQuestion}`;
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

  return `${noticePrefix}🔮 **คำตอบเจาะลึกจากไพ่เกี่ยวกับ: "${newQuestion}"**

จากพลังแห่งไพ่ **${mainCard ? mainCard.nameTh : 'ไพ่ยิปซีประจำดวง'}** และ **${outcomeCard ? outcomeCard.nameTh : 'ไพ่ทิศทางผลลัพธ์'}** ในสเปรดของคุณ:

* **มุมมองและคำแนะนำ:** ${mainCard?.advice || 'จงมีสติและยึดมั่นในความดีงามของตัวคุณเอง'}
* **พลังบวกนำทาง:** ${outcomeCard?.advice || 'ก้าวเดินไปด้วยความมั่นใจ แล้วความสำเร็จจะตามมา'}

> ✨ *สติและการตัดสินใจในปัจจุบันคือสิ่งที่เปลี่ยนชะตาชีวิต จงใช้พลังของไพ่เป็นเข็มทิศชี้นำทางด้วยปัญญา*`;
}
