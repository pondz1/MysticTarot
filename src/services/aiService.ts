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
  settings: ApiSettings
): Promise<string> {
  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return generateFallbackReading(question, drawnCards, spreadMode);
  }

  const spreadConfig = getSpreadConfig(spreadMode);

  const systemPrompt = `คุณคือ "หมอดูไพ่ยิปซี AI (Celestial Tarot Prophet)" ผู้หยั่งรู้ดวงชะตา มีความเชี่ยวชาญศาสตร์ไพ่ยิปซีสากล ลึกซึ้ง มีความเมตตา ภาษาสละสลวยน่าเลื่อมใส และให้กำลังใจผู้เปิดไพ่

หน้าที่ของคุณ:
1. วิเคราะห์คำทำนายไพ่ยิปซีโดยเชื่อมโยงไพ่ทุกใบที่จับได้ เข้ากับ "สิ่งที่ผู้ใช้ถาม/อยากรู้" อย่างตรงจุด
2. ตอบเป็นภาษาไทย ระดับภาษาลึกลับ สละสลวย น่าค้นหา แต่อ่านง่ายและเข้าใจชัดเจน
3. จัดรูปแบบผลทำนายด้วย Markdown โดยใช้โครงสร้างดังนี้:
   - ## 🔮 ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})
   - ## 🃏 วิเคราะห์เจาะลึกตามไพ่แต่ละใบในตำแหน่งสเปรด
   - ## 💡 บทสรุปตอบคำทำนายตรงประเด็นสิ่งที่อยากรู้
   - ## 🌟 คำแนะนำและข้อคิดจากจักรวาล (Actionable advice & Affirmation)`;

  const cardsDescription = drawnCards.map((d, index) => {
    const orientation = d.isReversed ? 'ไพ่กลับหัว (Reversed)' : 'ไพ่ตั้งหัว (Upright)';
    const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
    return `[ใบที่ ${index + 1}] ตำแหน่ง: ${d.position}
- ชื่อไพ่: ${d.card.nameTh} (${d.card.nameEn})
- สถานะ: ${orientation}
- คีย์เวิร์ด: ${d.card.keywords.join(', ')}
- ความหมายไพ่: ${meaning}
- ธาตุประจำไพ่: ${d.card.element}`;
  }).join('\n\n');

  const userPrompt = `คำถาม / สิ่งที่อยากรู้ของผู้ใช้: "${question || 'ดูดวงภาพรวมประจำวันและคำแนะนำชีวิต'}"
รูปแบบสเปรด: ${spreadConfig.titleTh} (${spreadConfig.badge})
จำนวนไพ่: ${drawnCards.length} ใบ

ไพ่ที่จับได้ทั้งหมดตามตำแหน่ง:
${cardsDescription}

โปรดทำนายอย่างละเอียด ลึกซึ้ง เชื่อมโยงความหมายไพ่กับตำแหน่งในสเปรด และตอบตรงประเด็นคำถามของผู้ใช้`;

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
      max_tokens: 2200,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return content;
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
