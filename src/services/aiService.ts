import OpenAI from 'openai';
import type { ApiSettings, DrawnCard, SpreadMode } from '../types/tarot';
import { getSpreadConfig } from '../data/tarotSpreads';

export const DEFAULT_API_SETTINGS: ApiSettings = {
  apiKey: 'sk-dce7f4d0918d74dd-ocq0dk-310c8c1d',
  baseUrl: 'https://9router.jsd.my.id/v1',
  model: 'tarot-cards',
};

// Preset providers for quick configuration
export const PROVIDER_PRESETS: { name: string; baseUrl: string; model: string; apiKey?: string }[] = [
  {
    name: '9Router (Tarot Special)',
    baseUrl: 'https://9router.jsd.my.id/v1',
    model: 'tarot-cards',
    apiKey: 'sk-dce7f4d0918d74dd-ocq0dk-310c8c1d'
  },
  { name: 'OpenAI (Default)', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' },
  { name: 'Local Ollama', baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
];

export async function analyzeTarotReading(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  settings: ApiSettings,
  deckFilter: 'all' | 'major' | 'minor' = 'all'
): Promise<string> {
  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return generateFallbackReading(question, drawnCards, spreadMode);
  }

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

  const cardsDescription = drawnCards.map((d, index) => {
    const orientation = d.isReversed ? 'ไพ่กลับหัว (Reversed - พลังงานติดขัด/สะท้อนมุมมองภายใน)' : 'ไพ่ตั้งหัว (Upright - พลังงานสมบูรณ์/แสดงผลชัดเจน)';
    const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
    const arcanaType = d.card.arcana === 'minor' ? `Minor Arcana - ชุด${d.card.suit === 'wands' ? 'ไม้เท้า (Wands)' : d.card.suit === 'cups' ? 'ถ้วย (Cups)' : d.card.suit === 'swords' ? 'ดาบ (Swords)' : d.card.suit === 'pentacles' ? 'เหรียญ (Pentacles)' : ''}` : 'Major Arcana (ชุดใหญ่)';
    return `[ใบที่ ${index + 1}] ตำแหน่ง: ${d.position}
- ชื่อไพ่: ${d.card.nameTh} (${d.card.nameEn})
- หมวดหมู่ไพ่: ${arcanaType}
- สถานะ: ${orientation}
- คีย์เวิร์ด: ${d.card.keywords.join(', ')}
- ความหมายไพ่: ${meaning}
- ธาตุประจำไพ่: ${d.card.element}`;
  }).join('\n\n');

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

  const userPrompt = `คำถาม / สิ่งที่อยากรู้ของผู้ใช้: "${question || 'ดูดวงภาพรวมประจำวันและคำแนะนำชีวิต'}"
รูปแบบสเปรด: ${spreadConfig.titleTh} (${spreadConfig.badge})
จำนวนไพ่: ${drawnCards.length} ใบ
${proportionNote}

แนวทางการทำนายสเปรดนี้: ${spreadConfig.aiGuideline || 'วิเคราะห์เชื่อมโยงไพ่กับตำแหน่งอย่างละเอียด'}

ไพ่ที่จับได้ทั้งหมดตามตำแหน่ง:
${cardsDescription}

โปรดทำนายอย่างละเอียด ลึกซึ้ง เชื่อมโยงความหมายไพ่กับตำแหน่งในสเปรด วิเคราะห์พลังงานสัดส่วน Major/Minor Arcana และตอบตรงประเด็นคำถามของผู้ใช้`;

  try {
    const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');

    // Initialize Official OpenAI Client
    const client = new OpenAI({
      apiKey: settings.apiKey || 'ollama',
      baseURL: cleanBaseUrl,
      dangerouslyAllowBrowser: true,
    });

    const completion = await client.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 5000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return cleanAiResponse(content);
    }

    return generateFallbackReading(question, drawnCards, spreadMode);
  } catch (error) {
    console.error('Failed to connect via OpenAI SDK:', error);
    return generateFallbackReading(
      question,
      drawnCards,
      spreadMode,
      `⚠️ (ข้อความจาก OpenAI SDK: ${error instanceof Error ? error.message : 'API Error'} - ระบบใช้ Smart AI Reader อัตโนมัติ)\n\n`
    );
  }
}

// Sanitizer function to clean up AI thinking / prompt leakage (e.g., Reasoning Models or proxies returning internal planning)
export function cleanAiResponse(rawContent: string): string {
  if (!rawContent) return '';

  // 1. Remove <think>...</think> tags (common in DeepSeek / Reasoning models)
  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Extract content starting from the first Markdown heading (e.g., # 🔮 or ## 🔮 or ## 🃏)
  const headingMatch = cleaned.match(/(#+\s*🔮?[\s\S]*)/i);
  if (headingMatch && headingMatch[1]) {
    cleaned = headingMatch[1].trim();
  } else {
    // Fallback: If no heading found, strip common English prompt reflection lines
    cleaned = cleaned
      .replace(/^(We need to|Constraints:|Let's craft|Pattern:|Structure:|Must keep|The instruction says)[\s\S]*?(?=\n\n|$)/gi, '')
      .trim();
  }

  return cleaned || rawContent.trim();
}

// Built-in Smart AI Reader Fallback generator
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

*จำไว้ว่า ไพ่ยิปซีคือเข็มทิศชี้ทาง แต่อนาคตที่แท้จริงขึ้นอยู่กับสติและการตัดสินใจในปัจจุบันของคุณเอง*`;
}
