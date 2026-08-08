/**
 * Module prompt builders — single source for credit (server) and custom key (client).
 */
import {
  MARKDOWN_OUTPUT_RULES,
  buildMasterDirectives,
  buildStructureBlock,
  lifeAspectSections,
} from './markdownFormat.js';
import { getSpreadConfig } from './spreads.js';
import type {
  AiModuleId,
  BuiltPrompts,
  FengShuiPayload,
  HoroscopePayload,
  NumerologyPayload,
  TarotCardPayload,
  TarotFollowUpPayload,
  TarotPayload,
  ThaiAstrologyPayload,
} from './types.js';

export type {
  AiModuleId,
  BuiltPrompts,
  FengShuiPayload,
  HoroscopePayload,
  NumerologyPayload,
  TarotCardPayload,
  TarotFollowUpPayload,
  TarotPayload,
  ThaiAstrologyPayload,
} from './types.js';
export { AI_MODULE_IDS, isAiModuleId } from './types.js';
export { getSpreadConfig } from './spreads.js';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function suitLabel(suit?: string): string {
  if (suit === 'wands') return 'ไม้เท้า';
  if (suit === 'cups') return 'ถ้วย';
  if (suit === 'swords') return 'ดาบ';
  if (suit === 'pentacles') return 'เหรียญ';
  return '';
}

function normalizeCards(raw: unknown): TarotCardPayload[] {
  if (!Array.isArray(raw)) return [];
  const out: TarotCardPayload[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const d = item as Record<string, unknown>;
    const card = (d.card && typeof d.card === 'object' ? d.card : {}) as Record<string, unknown>;
    const keywords = Array.isArray(card.keywords)
      ? card.keywords.map((k) => String(k)).slice(0, 20)
      : [];
    out.push({
      position: asString(d.position, 'ตำแหน่ง'),
      isReversed: Boolean(d.isReversed),
      card: {
        nameTh: asString(card.nameTh, 'ไม่ทราบชื่อ'),
        nameEn: asString(card.nameEn, ''),
        keywords,
        uprightMeaning: asString(card.uprightMeaning, ''),
        reversedMeaning: asString(card.reversedMeaning, ''),
        element: asString(card.element, ''),
        arcana: asString(card.arcana, 'major') || 'major',
        suit: typeof card.suit === 'string' ? card.suit : undefined,
      },
    });
    if (out.length >= 12) break;
  }
  return out;
}

function buildTarotCardsContext(payload: TarotPayload): string {
  const spreadMode = asString(payload.spreadMode, 'three');
  const spreadConfig = getSpreadConfig(spreadMode);
  const drawnCards = normalizeCards(payload.drawnCards);
  const deckFilter = payload.deckFilter === 'major' || payload.deckFilter === 'minor' ? payload.deckFilter : 'all';
  const question = asString(payload.question, 'ดูดวงภาพรวมประจำวันและคำแนะนำชีวิต');

  const cardsDescription = drawnCards
    .map((d, index) => {
      const orientation = d.isReversed
        ? 'ไพ่กลับหัว (พลังงานติดขัด/มุมมองภายใน)'
        : 'ไพ่ตั้งหัว (พลังงานเปิดชัด)';
      const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
      const arcanaType =
        d.card.arcana === 'minor'
          ? `Minor Arcana - ชุด${suitLabel(d.card.suit)}`
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

  return `คำถาม: "${question}"
สเปรด: ${spreadConfig.titleTh} (${spreadConfig.badge})
จำนวนไพ่: ${drawnCards.length}
โหมดสำรับ: ${filterText}
สัดส่วน: Major ${majorCount} / Minor ${minorCount}

แนวทางสเปรด: ${spreadConfig.aiGuideline || 'วิเคราะห์เชื่อมโยงไพ่กับตำแหน่ง'}

ไพ่ที่ได้:
${cardsDescription}`;
}

function buildTarotUserPrompt(payload: TarotPayload): string {
  const cardsContext = buildTarotCardsContext(payload);

  return `${cardsContext}

โปรดทำนายอย่างละเอียด ลึกซึ้ง ตามหัวข้อมาตรฐาน:
1) ภาพรวมดวงชะตาและพลังงานไพ่
2) วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด (ทีละใบ)
3) บทสรุปคำตอบตรงประเด็นคำถาม
4) คำแนะนำและข้อคิดชี้ทางจากจักรวาล
เชื่อมโยงความหมายไพ่กับตำแหน่ง วิเคราะห์สัดส่วน Major/Minor และตอบตรงคำถาม`;
}

function buildTarotSystem(spreadMode: string): string {
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

  return `คุณคือ "หมอดูไพ่ยิปซี AI ระดับปรมาจารย์ (Celestial Master Tarot Prophet)" ผู้หยั่งรู้ดวงชะตา อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

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
}

function buildTarotPrompts(payload: unknown): BuiltPrompts {
  const p = (payload && typeof payload === 'object' ? payload : {}) as TarotPayload;
  const cards = normalizeCards(p.drawnCards);
  if (cards.length === 0) {
    throw new Error('tarot payload ต้องมี drawnCards อย่างน้อย 1 ใบ');
  }
  const spreadMode = asString(p.spreadMode, 'three');
  return {
    systemPrompt: buildTarotSystem(spreadMode),
    userPrompt: buildTarotUserPrompt({ ...p, drawnCards: cards }),
  };
}

function buildTarotFollowUpPrompts(payload: unknown): BuiltPrompts {
  const p = (payload && typeof payload === 'object' ? payload : {}) as TarotFollowUpPayload;
  const cards = normalizeCards(p.drawnCards);
  if (cards.length === 0) {
    throw new Error('tarot_followup payload ต้องมี drawnCards');
  }
  const newQuestion = asString(p.newQuestion).trim();
  if (!newQuestion) {
    throw new Error('tarot_followup ต้องมี newQuestion');
  }
  const initialResult = asString(p.initialResult).slice(0, 20_000);
  const spreadMode = asString(p.spreadMode, 'three');

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
   - **ห้าม** เขียนทำนายดวงใหม่ 4 หัวข้อแบบรอบหลักเด็ดขาด ต้องตอบเฉพาะคำถามเพิ่มเติมตาม 3 หัวข้อด้านล่างเท่านั้น

3. **วิเคราะห์เชื่อมโยงไพ่ที่เปิดได้และบทวิเคราะห์เดิมเสมอ (Contextual & Card-Grounded)**:
   - ให้คำตอบโดยอ้างอิงไพ่ที่ผู้ใช้จับได้ในรอบนี้และบทวิเคราะห์เดิมที่เคยทำนายไว้ ห้ามตอบแบบเลื่อนลอยโดยไม่เกี่ยวกับไพ่

4. **การจัดรูปแบบ**: ทำตามรูปแบบ 3 หัวข้อด้านล่างเท่านั้น:
   - ## สรุปคำตอบ
   - ## เชื่อมโยงกับไพ่
   - ## คำแนะนำ

${MARKDOWN_OUTPUT_RULES}

${followUpStructure}`;

  const rawHistory = Array.isArray(p.chatHistory) ? p.chatHistory : [];
  const priorHistory = rawHistory
    .filter((m) => {
      if (!m || typeof m !== 'object') return false;
      const role = asString((m as { role?: string }).role);
      const content = asString((m as { content?: string }).content).trim();
      return !(role === 'user' && content === newQuestion);
    })
    .slice(-10);

  const historyText =
    priorHistory.length > 0
      ? priorHistory
          .map((m) => {
            const role = asString((m as { role?: string }).role);
            const content = asString((m as { content?: string }).content).slice(0, 2000);
            return `${role === 'user' ? 'ผู้ถาม' : 'หมอดู'}: ${content}`;
          })
          .join('\n')
      : '(ไม่มีประวัติก่อนหน้า)';

  const cardsContext = buildTarotCardsContext({
    question: p.question,
    drawnCards: cards,
    spreadMode,
    deckFilter: p.deckFilter,
  });

  const userPrompt = `[ข้อมูลการเปิดไพ่เดิม]
${cardsContext}

[ผลทำนายหลักก่อนหน้า]
${initialResult}

[ประวัติการสนทนาเพิ่มเติมก่อนหน้า]
${historyText}

[คำถามเพิ่มเติมรอบนี้ที่ต้องตอบ]
${newQuestion.slice(0, 2000)}

*** คำสั่งสำคัญ: นี่คือคำถามเพิ่มเติม (Follow-up) กรุณาตอบเฉพาะคำถามเพิ่มเติมในรอบนี้ โดยอ้างอิงจากไพ่และผลทำนายหลักก่อนหน้า ให้ตอบตามโครงสร้าง 3 หัวข้อ (## สรุปคำตอบ, ## เชื่อมโยงกับไพ่, ## คำแนะนำ) ห้ามเขียนบทวิเคราะห์ทำนายดวงใหม่ 4 หัวข้อแบบรอบหลักซ้ำเด็ดขาด ***`;

  return { systemPrompt, userPrompt };
}

function buildHoroscopePrompts(payload: unknown): BuiltPrompts {
  const p = (payload && typeof payload === 'object' ? payload : {}) as HoroscopePayload;
  const signNameTh = asString(p.signNameTh).trim();
  const elementTh = asString(p.elementTh).trim();
  if (!signNameTh || !elementTh) {
    throw new Error('horoscope ต้องมี signNameTh และ elementTh');
  }
  const timeframe = p.timeframe === 'monthly' ? 'monthly' : 'daily';
  const period = timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน';

  const structure = buildStructureBlock(
    lifeAspectSections({
      overviewHeading: 'ภาพรวมพลังงานดวงชะตา',
      overviewGuide: `สรุปพลังงานราศี${signNameTh} ธาตุ${elementTh} ช่วง${period} อย่างมีมิติ อย่างน้อย 1 ย่อหน้า`,
      workGuide: 'ทิศทางงาน ธุรกิจ การศึกษา โอกาสและอุปสรรค วิเคราะห์เชิงลึก',
      moneyGuide: 'สภาพคล่อง โชคลาภ การใช้จ่ายและการเก็บออม',
      loveGuide: 'ความสัมพันธ์ คนมีคู่/คนโสด เสน่ห์และมิตรภาพ',
      adviceHeading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      adviceGuide: 'ข้อแนะนำปฏิบัติได้จริง 3–5 ข้อแบบ bullet',
    })
  );

  const directives = buildMasterDirectives([
    `**วิเคราะห์ตามราศีและธาตุ (Zodiac Synthesis)**:
   - อิงราศี **${signNameTh}** ธาตุ **${elementTh}** และช่วง **${period}** เป็นหลัก
   - ร้อยเรียงงาน เงิน รัก ให้เป็นภาพชีวิตเดียวกัน ไม่แยกขาดจากกัน`,
    `**สติและความรับผิดชอบ (Wise Counsel)**:
   - ไม่ขู่เกินเหตุ ไม่รับประกันโชคลาภแน่นอน
   - ให้สติปัญญาและทางเลือกที่ผู้ใช้นำไปปรับใช้ได้`,
  ]);

  return {
    systemPrompt: `คุณคือ "หมอดูโหราศาสตร์ 12 ราศี AI ระดับปรมาจารย์ (Celestial Master Zodiac Prophet)" ผู้หยั่งรู้ดวงดาว อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Zodiac)**:
${structure}`,
    userPrompt: `โปรดทำนายดวง${period} ของราศี "${signNameTh}" (ธาตุ ${elementTh}) ตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`,
  };
}

function buildNumerologyPrompts(payload: unknown): BuiltPrompts {
  const p = (payload && typeof payload === 'object' ? payload : {}) as NumerologyPayload;
  const digitsStr = asString(p.digitsStr).trim().slice(0, 64);
  const sumTitle = asString(p.sumTitle).trim().slice(0, 120);
  const sumValue = asNumber(p.sumValue);
  if (!digitsStr || !sumTitle) {
    throw new Error('numerology ต้องมี digitsStr และ sumTitle');
  }
  const pairsSummary = asString(p.pairsSummary).slice(0, 500);

  const structure = buildStructureBlock(
    lifeAspectSections({
      overviewHeading: 'ภาพรวมพลังงานตัวเลข',
      overviewGuide: `วิเคราะห์ผลรวม ${sumValue} (${sumTitle}) และโทนพลังงานของชุดเลข ${digitsStr} อย่างมีมิติ`,
      workGuide: 'อิทธิพลต่อการงาน ธุรกิจ ตำแหน่งหน้าที่ และการเจรจา',
      moneyGuide: 'สภาพคล่อง โชคลาภ การหมุนเงินและการดึงดูดทรัพย์',
      loveGuide: 'เสน่ห์ มิตรภาพ ผู้ใหญ่อุปถัมภ์ และความสัมพันธ์',
      adviceHeading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      adviceGuide: 'วิธีใช้พลังงานตัวเลขให้เกิดประโยชน์ 3–5 ข้อแบบ bullet',
    })
  );

  const directives = buildMasterDirectives([
    `**วิเคราะห์เชื่อมโยงตัวเลข (Numerology Synthesis)**:
   - อิงผลรวม **${sumValue} (${sumTitle})** และคู่เลขที่ให้มาเท่านั้น ห้ามแต่งตัวเลขใหม่
   - ร้อยเรียงงาน เงิน รัก เข้ากับพลังงานชุดเลขให้เป็นเรื่องราวเดียวกัน`,
    `**สติและความรับผิดชอบ (Wise Counsel)**:
   - ตัวเลขเป็นพลังหนุนนำ ไม่ใช่คำตอบเดียวของชีวิต
   - ไม่รับประกันความมั่งคั่งแน่นอน`,
  ]);

  return {
    systemPrompt: `คุณคือ "หมอดูเลขศาสตร์ AI ระดับปรมาจารย์ (Celestial Master Numerology Prophet)" ผู้ถอดรหัสตัวเลขและเบอร์มงคล อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Numerology)**:
${structure}`,
    userPrompt: `โปรดวิเคราะห์ชุดตัวเลข "${digitsStr}" ผลรวม ${sumValue} (${sumTitle}) คู่เลขสำคัญ: ${pairsSummary}
ตอบตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`,
  };
}

function buildFengShuiPrompts(payload: unknown): BuiltPrompts {
  const p = (payload && typeof payload === 'object' ? payload : {}) as FengShuiPayload;
  const dayNameTh = asString(p.dayNameTh).trim();
  const selectedSpace = asString(p.selectedSpace).trim().slice(0, 80);
  if (!dayNameTh || !selectedSpace) {
    throw new Error('feng_shui ต้องมี dayNameTh และ selectedSpace');
  }
  const luckyWork = asString(p.luckyWork).slice(0, 200);
  const luckyWealth = asString(p.luckyWealth).slice(0, 200);
  const luckyLove = asString(p.luckyLove).slice(0, 200);
  const unluckyForbidden = asString(p.unluckyForbidden).slice(0, 200);

  const structure = buildStructureBlock([
    {
      heading: 'ภาพรวมฮวงจุ้ยและสีมงคล',
      guide: `สรุปพลังงานวัน${dayNameTh} สำหรับพื้นที่ ${selectedSpace} อย่างมีมิติ อย่างน้อย 1 ย่อหน้า`,
    },
    {
      heading: 'การงานและพื้นที่ทำงาน',
      guide: `จัดพื้นที่ ${selectedSpace} เสริมงาน โดยอิงสีมงคลการงาน: ${luckyWork}`,
    },
    {
      heading: 'การเงินและโชคลาภ',
      guide: `จัดพื้นที่/สีเสริมโชคลาภ อิงสีมงคลการเงิน: ${luckyWealth}`,
    },
    {
      heading: 'ความรักและเมตตา',
      guide: `เสริมเสน่ห์และความสัมพันธ์ อิงสีมงคลความรัก: ${luckyLove}`,
    },
    {
      heading: 'สิ่งที่ควรหลีกเลี่ยง',
      guide: `สี/ทิศ/พฤติกรรมที่ควรเลี่ยง อิงสีอัปมงคล: ${unluckyForbidden}`,
    },
    {
      heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      guide: 'action ปรับพื้นที่ได้ทันที 3–5 ข้อแบบ bullet',
    },
  ]);

  const directives = buildMasterDirectives([
    `**วิเคราะห์ฮวงจุ้ยและสีมงคล (Feng Shui Synthesis)**:
   - อิงวัน **${dayNameTh}** พื้นที่ **${selectedSpace}** และชุดสีที่ระบุเท่านั้น ห้ามแต่งข้อมูลวันเอง
   - ร้อยเรียงงาน เงิน รัก และการจัดพื้นที่ให้เป็นคำแนะนำเดียวที่ทำได้จริง`,
    `**สติและความรับผิดชอบ (Wise Counsel)**:
   - เน้นสิ่งที่ปรับได้ทันทีในบ้านหรือที่ทำงาน
   - ไม่ขู่เกินเหตุ ไม่รับประกันโชคลาภแน่นอน`,
  ]);

  return {
    systemPrompt: `คุณคือ "หมอดูฮวงจุ้ยและสีมงคล AI ระดับปรมาจารย์ (Celestial Master Feng Shui Prophet)" ผู้จัดพลังงานพื้นที่ อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Feng Shui)**:
${structure}`,
    userPrompt: `วิเคราะห์ฮวงจุ้ยพื้นที่ "${selectedSpace}" ประจำวัน "${dayNameTh}"
สีมงคลงาน: ${luckyWork}
สีมงคลเงิน: ${luckyWealth}
สีมงคลรัก: ${luckyLove}
สีควรหลีก: ${unluckyForbidden}
ตอบตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`,
  };
}

function buildThaiAstrologyPrompts(payload: unknown): BuiltPrompts {
  const p = (payload && typeof payload === 'object' ? payload : {}) as ThaiAstrologyPayload;
  const birthDate = asString(p.birthDate).trim();
  const dayOfWeekTh = asString(p.dayOfWeekTh).trim();
  const elementTh = asString(p.elementTh).trim();
  const peakAgeRange = asString(p.peakAgeRange).trim();
  const summaryGuidance = asString(p.summaryGuidance).trim().slice(0, 1000);
  if (!birthDate || !dayOfWeekTh || !elementTh || !peakAgeRange) {
    throw new Error('thai_astrology ต้องมี birthDate, dayOfWeekTh, elementTh, peakAgeRange');
  }

  const structure = buildStructureBlock([
    {
      heading: 'ภาพรวมกราฟชีวิต',
      guide: `สรุปพื้นดวงผู้เกิดวัน${dayOfWeekTh} ธาตุ${elementTh} และโทนชีวิตโดยรวมอย่างมีมิติ`,
    },
    {
      heading: `ช่วงอายุพีค (${peakAgeRange})`,
      guide: 'โอกาส ความสำเร็จ และสิ่งที่ควรเร่งทำในช่วงพีค วิเคราะห์ละเอียด',
    },
    {
      heading: 'การงานและเกียรติยศ',
      guide: 'ทิศทางงาน ชื่อเสียง ผู้ใหญ่ และจังหวะก้าวหน้า',
    },
    {
      heading: 'การเงินและทรัพย์สิน',
      guide: 'โชคลาภ ทรัพย์สิน และการวางแผนระยะยาว',
    },
    {
      heading: 'ความรักและครอบครัว',
      guide: 'คู่ครอง ครอบครัว และความสัมพันธ์เกื้อกูล',
    },
    {
      heading: 'ข้อควรระวังและคำแนะนำ',
      guide: 'ช่วงกราฟลง วิธีตั้งรับ และ actionable 3–5 ข้อแบบ bullet',
    },
  ]);

  const directives = buildMasterDirectives([
    `**วิเคราะห์ตามตำรากราฟชีวิต (Thai Life Chart Synthesis)**:
   - อิงวันเกิด **${birthDate}** วัน **${dayOfWeekTh}** ธาตุ **${elementTh}** และช่วงพีค **${peakAgeRange}**
   - ร้อยเรียงจังหวะชีวิต งาน เงิน รัก เป็นภาพชะตาเดียวกัน
   - ข้อมูลอ้างอิงพื้นดวง: ${summaryGuidance}`,
    `**สติและความรับผิดชอบ (Wise Counsel)**:
   - ไม่ขู่เกินเหตุ เน้นการเตรียมตัว วางแผน และบำเพ็ญตน
   - ให้ทางเลือกที่ผู้ใช้ปรับใช้ตามวัยและจังหวะชีวิตได้`,
  ]);

  return {
    systemPrompt: `คุณคือ "หมอดูดวงไทยและกราฟชีวิต AI ระดับปรมาจารย์ (Celestial Master Thai Astrology Prophet)" ผู้เชี่ยวชาญตำรากราฟชีวิตโบราณ อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Thai Life Chart)**:
${structure}`,
    userPrompt: `วิเคราะห์กราฟชีวิตผู้เกิดวัน "${dayOfWeekTh}" วันที่ ${birthDate} ธาตุ ${elementTh} ช่วงพีค ${peakAgeRange}
ตอบตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`,
  };
}

/**
 * Build system + user prompts from a trusted module id + structured payload.
 * Credit mode must use this path only — free-form client system prompts are ignored.
 */
export function buildModulePrompts(module: AiModuleId, payload: unknown): BuiltPrompts {
  switch (module) {
    case 'tarot':
      return buildTarotPrompts(payload);
    case 'tarot_followup':
      return buildTarotFollowUpPrompts(payload);
    case 'horoscope':
      return buildHoroscopePrompts(payload);
    case 'numerology':
      return buildNumerologyPrompts(payload);
    case 'feng_shui':
      return buildFengShuiPrompts(payload);
    case 'thai_astrology':
      return buildThaiAstrologyPrompts(payload);
    default: {
      const _exhaustive: never = module;
      throw new Error(`Unknown module: ${_exhaustive}`);
    }
  }
}
