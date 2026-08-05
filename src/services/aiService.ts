import OpenAI from 'openai';
import type { ApiSettings, ChatMessage, DrawnCard, SpreadMode } from '../features/tarot/types/tarot';
import { getSpreadConfig } from '../features/tarot/data/tarotSpreads';

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

  const userPrompt = buildInitialUserPrompt(question, drawnCards, spreadMode, deckFilter);

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

*จำไว้ว่า ไพ่ยิปซีคือเข็มทิศชี้ทาง แ่อยู่นในมือของคุณเอง*`;
}

// Helper to construct the full detailed initial user prompt
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

แนวทางการทำนายสเปรดนี้: ${spreadConfig.aiGuideline || 'วิเคราะห์เชื่อมโยงไพ่กับตำแหน่งอย่างละเอียด'}

ไพ่ที่จับได้ทั้งหมดตามตำแหน่ง:
${cardsDescription}

โปรดทำนายอย่างละเอียด ลึกซึ้ง เชื่อมโยงความหมายไพ่กับตำแหน่งในสเปรด วิเคราะห์พลังงานสัดส่วน Major/Minor Arcana และตอบตรงประเด็นคำถามของผู้ใช้`;
}

// Follow-up Q&A Analyzer function with full context & zero duplication
export async function analyzeTarotFollowUp(params: {
  question: string;
  drawnCards: DrawnCard[];
  spreadMode: SpreadMode;
  initialResult: string;
  chatHistory: ChatMessage[];
  newQuestion: string;
  settings: ApiSettings;
}): Promise<string> {
  const { question, drawnCards, spreadMode, initialResult, chatHistory, newQuestion, settings } = params;

  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return generateFollowUpFallback(newQuestion, drawnCards);
  }

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
    const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
    const client = new OpenAI({
      apiKey: settings.apiKey || 'ollama',
      baseURL: cleanBaseUrl,
      dangerouslyAllowBrowser: true,
    });

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: initialUserPrompt },
      { role: 'assistant', content: initialResult },
    ];

    // Include prior chat history
    chatHistory.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });

    // Add newQuestion ONLY if it is not already the last message in chatHistory
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== newQuestion) {
      messages.push({
        role: 'user',
        content: newQuestion,
      });
    }

    const completion = await client.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return cleanAiResponse(content);
    }

    return generateFollowUpFallback(newQuestion, drawnCards);
  } catch (error) {
    console.error('Failed follow-up AI call:', error);
    return generateFollowUpFallback(
      newQuestion,
      drawnCards,
      `⚠️ (ระบบใช้ Smart AI Reader สำหรับตอบคำถามเพิ่มเติม)\n\n`
    );
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

export async function analyzeZodiacHoroscope(
  signNameTh: string,
  elementTh: string,
  timeframe: 'daily' | 'monthly',
  settings: ApiSettings
): Promise<string> {
  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return generateFallbackZodiacHoroscope(signNameTh, timeframe);
  }

  const systemPrompt = `คุณคือโหราจารย์ผู้หยั่งรู้ดวงดาว 12 ราศี วิเคราะห์ดวงชะตาสละสลวย ให้พลังบวกและข้อคิดแม่นยำ`;
  const userPrompt = `โปรดทำนายดวงชะตา ${timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'} สำหรับผู้เกิด "${signNameTh}" (${elementTh})
โดยแยกหัวข้อสั้นๆ สละสลวยดังนี้:
1. 🔮 ภาพรวมพลังงานดวงดาว
2. 💼 การงาน & การเรียน
3. 💰 การเงิน & โชคลาภ
4. ❤️ ความรัก & ความสัมพันธ์
5. 🌟 ข้อคิดชี้ทางประจำวัน`;

  try {
    const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
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
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return cleanAiResponse(content);
    }
    return generateFallbackZodiacHoroscope(signNameTh, timeframe);
  } catch (error) {
    console.error('Failed Zodiac AI call:', error);
    return generateFallbackZodiacHoroscope(signNameTh, timeframe);
  }
}

export function generateFallbackZodiacHoroscope(signNameTh: string, timeframe: 'daily' | 'monthly'): string {
  return `**ภาพรวมดวงชะตา ${signNameTh} (${timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'})**

ช่วงเวลานี้ดวงดาวประจำราศีส่งพลังงานบวกและโอกาสใหม่ๆ เข้ามา ให้ใช้วิสัยทัศน์และความตั้งใจในการเดินหน้าต่อ

**การงาน & การเรียน:** ราบรื่น มีผู้ใหญ่อุปถัมภ์ งานที่ติดต่อไว้จะได้รับข่าวดี
**การเงิน & โชคลาภ:** การเงินสะพัด มีช่องทางทำเงินเพิ่ม แต่ควรวางแผนรายจ่ายให้รอบคอบ
**ความรัก & ความสัมพันธ์:** คนมีคู่มีความเข้าใจกันดี คนโสดมีเสน่ห์โดดเด่นมีคนสนใจ
**ข้อคิดชี้ทาง:** "เปิดใจรับโอกาสใหม่ด้วยสติและความมั่นใจ แล้วความสำเร็จจะเข้ามาหาคุณ"`;
}

export async function analyzeNumerology(
  inputNumber: string,
  sumValue: number,
  sumTitle: string,
  pairsSummary: string,
  settings: ApiSettings
): Promise<string> {
  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return generateFallbackNumerology(inputNumber, sumValue, sumTitle);
  }

  const systemPrompt = `คุณคือปรมาจารย์ผู้เชี่ยวชาญศาสตร์แห่งตัวเลขและเบอร์มงคล (Celestial Master Numerologist) มีสติปัญญา ลึกซึ้ง และทำนายภาษาไทยสละสลวย 100% (ห้ามใส่ Emoji ใดๆ ในหัวข้อ Heading)`;
  const userPrompt = `โปรดทำนายวิเคราะห์เชิงลึกสำหรับตัวเลข "${inputNumber}"
- ผลรวมตัวเลข: ${sumValue} (${sumTitle})
- สรุปคู่เลขย่อย: ${pairsSummary}

โปรดจัดทำโครงสร้างบทวิเคราะห์ Markdown สละสลวยดังนี้ (ห้ามใส่ Emoji ในหัวข้อ ##):
## ภาพรวมพลังงานและอิทธิพลแห่งตัวเลข (${inputNumber})
(วิเคราะห์พลังรวม สถิตตัวเลข และแรงดึงดูดชีวิต)

## พลังเสริมดวงการงาน & สติปัญญา
(วิเคราะห์อิทธิพลต่อการทำงาน การบริหาร และวิชาการ)

## พลังเสริมดวงการเงิน & โชคลาภ
(วิเคราะห์การไหลเวียนเงินทอง โชคลาภ และความมั่งคั่ง)

## พลังเสริมดวงความรัก & เมตตามหานิยม
(วิเคราะห์เสน่ห์ ความรัก และการเอ็นดูจากผู้คน)

> **ข้อคิดคำแนะนำมงคลประจำชุดตัวเลขนี้**`;

  try {
    const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
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
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return cleanAiResponse(content);
    }
    return generateFallbackNumerology(inputNumber, sumValue, sumTitle);
  } catch (error) {
    console.error('Failed Numerology AI call:', error);
    return generateFallbackNumerology(inputNumber, sumValue, sumTitle);
  }
}

export function generateFallbackNumerology(inputNumber: string, sumValue: number, sumTitle: string): string {
  return `## ภาพรวมพลังงานแห่งตัวเลข: ${inputNumber} (ผลรวม ${sumValue})
ผลรวมตัวเลข **${sumValue}** นับเป็นชุดเลขพลังงานมงคลสูง (${sumTitle}) ช่วยส่งเสริมพลังชีวิตให้มีความก้าวหน้าและสมดุล

## การงาน & สติปัญญา
ส่งเสริมไหวพริบ ความคิดสร้างสรรค์ มีผู้ใหญ่อุปถัมภ์ค้ำชูในการทำงาน การเจรจาต่อรองประสบความสำเร็จ

## การเงิน & โชคลาภ
การเงินไหลเวียนคล่องตัว มีโชคลาภเข้ามาต่อเนื่อง เหมาะแก่การลงทุนค้าขายและขยายกิจการ

## ความรัก & เมตตามหานิยม
มีเสน่ห์ดึงดูดผู้คน ได้รับความเอ็นดูและความเมตตาจากมิตรสหายและคนใกล้ชิด

> **คำแนะนำมงคล:** ตัวเลขคือพลังหนุนนำ สติและการลงมือทำคือคีย์สำคัญสู่ความสำเร็จอย่างยั่งยืน`;
}

// ==========================================
// 🔮 Thai Life Graph AI Analysis
// ==========================================

export async function analyzeThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  elementTh: string,
  peakAgeRange: string,
  summaryGuidance: string,
  settings?: ApiSettings
): Promise<string> {
  if (!settings || !settings.baseUrl) {
    return generateFallbackThaiLifeGraph(birthDate, dayOfWeekTh, peakAgeRange, summaryGuidance);
  }

  const systemPrompt = `คุณคือโหราจารย์ผู้เชี่ยวชาญศาสตร์โหราศาสตร์ไทยโบราณและคำนวณกราฟชีวิต 9 ช่วงอายุ โปรดวิเคราะห์ดวงชะตากราฟชีวิตอย่างลึกซึ้ง มีเสน่ห์ ทรงพลัง และให้สติปัญญาในการดำเนินชีวิต

โครงสร้างคำทำนายในรูปแบบ Markdown:
# ดวงชะตากราฟชีวิต: ผู้เกิด${dayOfWeekTh} (${elementTh})
(เกริ่นนำลักษณะนิสัย พลังงานประจำวันเกิด และเส้นทางดวงชะตา)

## จังหวะกราฟชีวิต & ช่วงพีคสูงสุด
(วิเคราะห์ช่วงอายุ ${peakAgeRange} และการตักตักสร้างเนื้อสร้างตัว)

## การงาน & เกียรติยศ
(ทิศทางหน้าที่การงาน ธุรกิจ และผู้ใหญ่อุปถัมภ์)

## การเงิน & ทรัพย์สิน
(การหมุนเวียนเงินทอง การลงทุน และอสังหาริมทรัพย์)

## ความรัก & ครอบครัว
(ความสัมพันธ์ คู่ครอง และความสมบูรณ์ในครอบครัว)

> **สารสั้นเตือนใจประจำชะตาชีวิต:** (ข้อคิดและแนวทางสร้างบารมี)`;

  const userPrompt = `ข้อมูลชะตาชีวิต:
- วันเกิด: ${birthDate} (ตรงกับ${dayOfWeekTh}, ธาตุประจำตัว: ${elementTh})
- ช่วงอายุพุ่งสูงสุด: ${peakAgeRange}
- คำแนะนำภาพรวม: ${summaryGuidance}`;

  try {
    const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
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
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return cleanAiResponse(content);
    }
    return generateFallbackThaiLifeGraph(birthDate, dayOfWeekTh, peakAgeRange, summaryGuidance);
  } catch (error) {
    console.error('Failed Thai Life Graph AI call:', error);
    return generateFallbackThaiLifeGraph(birthDate, dayOfWeekTh, peakAgeRange, summaryGuidance);
  }
}

export function generateFallbackThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  peakAgeRange: string,
  summaryGuidance: string
): string {
  return `## ภาพรวมดวงชะตากราฟชีวิตผู้เกิด${dayOfWeekTh} (วันเกิด ${birthDate})
ผู้เกิด${dayOfWeekTh} มีพลังสถิตแข็งแกร่ง ${summaryGuidance} ดวงชะตามีจังหวะเติบโตอย่างมั่นคงตามลำดับ

## จังหวะกราฟชีวิตช่วงพีคสูงสุด: ${peakAgeRange}
ช่วงอายุ **${peakAgeRange}** นับเป็นช่วงเวลาทองแห่งการกอบโกยและสร้างอนาคต มีโอกาสใหญ่เข้ามาในชีวิต

## การงาน & เกียรติยศ
งานสร้างชื่อเสียง มีโอกาสได้รับความไว้วางใจจากผู้ใหญ่ ให้เน้นความซื่อสัตย์และความประณีตในการทำงาน

## การเงิน & ทรัพย์สิน
โชคลาภการเงินหมุนเวียนดี มีเกณฑ์ได้ทรัพย์สินก้อนโตหรืออสังหาริมทรัพย์เมื่อผ่านช่วงกลางคน

## ความรัก & ครอบครัว
คู่ครองช่วยส่งเสริมดวงชะตา มีความเข้าใจและเกื้อกูลกันในยามยุ่งยาก

> **สารสั้นเตือนใจประจำชะตาชีวิต:** "ยึดมั่นในสติและความดี ความเพียรจะนำพาความสำเร็จและบารมีมาสู่ตัวคุณ"`;
}

// ==========================================
// Feng Shui & Daily Energy AI Analysis
// ==========================================

export async function analyzeFengShui(
  dayNameTh: string,
  luckyWork: string,
  luckyWealth: string,
  luckyLove: string,
  unluckyForbidden: string,
  spaceType: string = 'ภาพรวมที่อยู่อาศัย & โต๊ะทำงาน',
  settings?: ApiSettings
): Promise<string> {
  if (!settings || !settings.baseUrl) {
    return generateFallbackFengShui(dayNameTh, luckyWork, luckyWealth, luckyLove, unluckyForbidden, spaceType);
  }

  const systemPrompt = `คุณคือซินแสผู้เชี่ยวชาญศาสตร์ฮวงจุ้ยและการปรับพลังงานเบญจธาตุระดับสูง โปรดให้คำแนะนำการแต่งกายสีมงคล ทิศรับทรัพย์ และการจัดวางพื้นที่ (${spaceType}) ในรูปแบบ Markdown (ห้ามใช้อิโมจิ)

โครงสร้างคำทำนายในรูปแบบ Markdown:
# วิเคราะห์ฮวงจุ้ย & พลังงานมงคลประจำ${dayNameTh}
(เกริ่นนำพลังงานธาตุประจำวันและการเปิดรับโชคลาภ)

## สีเสื้อมงคลเสริมพลังชีวิต
(วิเคราะห์การเลือกแต่งกายด้วยสีมงคลในแต่ละด้าน)

## การจัดฮวงจุ้ยพื้นที่ (${spaceType})
(เคล็ดลับการจัดวางทิศทาง แสงสว่าง และวัตถุมงคลรับทรัพย์)

## ข้อควรระวัง & สีต้องห้าม
(เตือนสติเรื่องสีต้องห้าม ${unluckyForbidden} และจุดอับพลังงานที่ควรแก้ไข)

> **เคล็ดลับซินแสประจำวัน:** (ข้อคิดปรับสมดุลชีวิตและจิตใจ)`;

  const userPrompt = `ข้อมูลฮวงจุ้ยประจำ${dayNameTh}:
- สีเสริมการงาน: ${luckyWork}
- สีเสริมการเงินโชคลาภ: ${luckyWealth}
- สีเสริมความรักเมตตา: ${luckyLove}
- สีต้องห้าม/ฉุดดวง: ${unluckyForbidden}
- พื้นที่ที่ต้องการจัดฮวงจุ้ย: ${spaceType}`;

  try {
    const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
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
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return cleanAiResponse(content);
    }
    return generateFallbackFengShui(dayNameTh, luckyWork, luckyWealth, luckyLove, unluckyForbidden, spaceType);
  } catch (error) {
    console.error('Failed Feng Shui AI call:', error);
    return generateFallbackFengShui(dayNameTh, luckyWork, luckyWealth, luckyLove, unluckyForbidden, spaceType);
  }
}

export function generateFallbackFengShui(
  dayNameTh: string,
  luckyWork: string,
  luckyWealth: string,
  luckyLove: string,
  unluckyForbidden: string,
  spaceType: string
): string {
  return `## เคล็ดลับฮวงจุ้ย & สีมงคลประจำ${dayNameTh}
การเลือกสวมใส่เสื้อผ้าและจัดวางพลังงานในพื้นที่ **${spaceType}** ประจำ${dayNameTh} ช่วยดึงดูดพลังงานโชคลาภและสิริมงคล

## สีเสื้อมงคลเสริมการงาน: ${luckyWork}
ช่วยเพิ่มความน่าเชื่อถือ เสริมอำนาจบารมี และได้รับการสนับสนุนจากผู้ร่วมงาน

## สีเสื้อมงคลเสริมการเงิน: ${luckyWealth}
ดึงดูดเงินทองและโชคลาภทางการค้า เหมาะสำหรับการเจรจาธุรกิจและปิดการขาย

## สีเสื้อมงคลเสริมความรัก: ${luckyLove}
เสริมเสน่ห์เมตตามหานิยม ความสัมพันธ์ราบรื่น อ่อนโยนและได้รับความเอ็นดู

## สีต้องห้ามประจำวัน: ${unluckyForbidden}
ควรหลีกเลี่ยงการสวมใส่เสื้อผ้าสี **${unluckyForbidden}** ในวันนี้ เพื่อป้องกันพลังงานขัดข้อง

> **เคล็ดลับซินแส:** "เปิดหน้าต่างรับแสงแดดยามเช้า จัดโต๊ะทำงานให้เป็นระเบียบ เพื่อเปิดทางให้พลังงานชี่ (Chi) ไหลเวียนรับทรัพย์อย่างสมบูรณ์"`;
}


