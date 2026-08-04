import OpenAI from 'openai';
import type { TarotCard } from '../data/tarotCards';

export interface ApiSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: string; // e.g. "ไพ่แทนคำตอบประจำวัน" or "อดีต/พื้นดวง", "ปัจจุบัน/สถานการณ์", "อนาคต/ทางออก"
}

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
  spreadMode: 'single' | 'three',
  settings: ApiSettings
): Promise<string> {
  // If no API key is provided and not local ollama, use the built-in smart AI reader fallback
  const isLocalHost = settings.baseUrl.includes('localhost') || settings.baseUrl.includes('127.0.0.1');
  if (!settings.apiKey && !isLocalHost) {
    return generateFallbackReading(question, drawnCards, spreadMode);
  }

  const systemPrompt = `คุณคือ "หมอดูไพ่ยิปซี AI (Celestial Tarot Prophet)" ที่มีความเชี่ยวชาญ หยั่งรู้ลึกซึ้ง มีความเมตตา ภาษาสละสลวยน่าเลื่อมใส และให้กำลังใจผู้เปิดไพ่

หน้าที่ของคุณ:
1. วิเคราะห์คำทำนายไพ่ยิปซีโดยเชื่อมโยงไพ่ที่ผู้ใช้จับได้ กับ "สิ่งที่ผู้ใช้ถาม/อยากรู้" อย่างตรงจุด
2. ตอบเป็นภาษาไทย มีระดับภาษาลึกลับ สละสลวย น่าค้นหา แต่อ่านง่ายและเข้าใจชัดเจน
3. จัดรูปแบบผลทำนายด้วย Markdown โดยใช้โครงสร้างดังนี้:
   - ## 🔮 ภาพรวมดวงชะตาและพลังงานไพ่
   - ## 🃏 วิเคราะห์เจาะลึกตามไพ่แต่ละใบ (อธิบายความหมายไพ่กับตำแหน่งของไพ่)
   - ## 💡 คำทำนายตอบคำถามสิ่งที่อยากรู้ (วิเคราะห์เจาะลึกประเด็นที่ถาม)
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

  const userPrompt = `คำถาม / สิ่งที่อยากรู้ของผู้ใช้: "${question || 'ดูดวงภาพรวมประจำวัน คำแนะนำทั่วไป'}"
รูปแบบสเปรด: ${spreadMode === 'single' ? 'จับไพ่ 1 ใบ (คำตอบฉับไว/สรุปสกัด)' : 'จับไพ่ 3 ใบ (อดีต-ปัจจุบัน-อนาคต / สถานการณ์-อุปสรรค-ทางออก)'}

ไพ่ที่จับได้ทั้งหมด:
${cardsDescription}

โปรดทำนายอย่างละเอียด ลึกซึ้ง และตรงประเด็นคำถามของผู้ใช้`;

  try {
    const cleanBaseUrl = settings.baseUrl.replace(/\/+$/, '');
    
    // Initialize Official OpenAI Client with Browser Support
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
      max_tokens: 1500,
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
  spreadMode: 'single' | 'three',
  noticePrefix: string = ''
): string {
  const qText = question ? `"${question}"` : 'ดวงชะตารายวันและภาพรวมชีวิต';

  if (spreadMode === 'single') {
    const d = drawnCards[0];
    const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
    
    return `${noticePrefix}## 🔮 ภาพรวมพลังงานไพ่ประจำวัน
สายลมแห่งโชคชะตาได้พัดพาไพ่ **${d.card.nameTh}** (${d.isReversed ? 'ไพ่กลับหัว' : 'ไพ่ตั้งหัว'}) มาปรากฏเบื้องหน้าคุณ เพื่อตอบรับสิ่งที่ถามถึง ${qText}

## 🃏 วิเคราะห์เจาะลึกไพ่ ${d.card.nameTh}
* **ธาตุประจำไพ่:** ${d.card.element} (${d.card.planetOrSign})
* **คีย์เวิร์ดสำคัญ:** ${d.card.keywords.join(', ')}

${d.card.description}

**สาระสำคัญของไพ่:** ${meaning}

## 💡 สารจากไพ่ถึงเรื่องที่อยากรู้ (${qText})
* **ด้านงานและการเรียน:** ${d.card.work}
* **ด้านความรักความสัมพันธ์:** ${d.card.love}
* **ด้านการเงินและโชคลาภ:** ${d.card.finance}

## 🌟 คำแนะนำและข้อคิดจากจักรวาล
${d.card.advice}

*จำไว้ว่า ไพ่ยิปซีคือเข็มทิศชี้ทาง แต่อนาคตที่แท้จริงขึ้นอยู่กับสติและการตัดสินใจในปัจจุบันของคุณเอง*`;
  } else {
    const [c1, c2, c3] = drawnCards;

    return `${noticePrefix}## 🔮 ภาพรวมการทำนาย 3 ชะตา
สำหรับการถามถึง ${qText} พลังงานของไพ่ทั้งสามใบส่งสัญญาณถึงการเปลี่ยนผ่านและบทเรียนชีวิตที่ต่อเนื่องกันอย่างน่าสนใจ

## 🃏 วิเคราะห์เจาะลึกไพ่ทั้ง 3 ใบ

### 1. ตำแหน่งอดีต/รากฐานความคิด: **${c1.card.nameTh}** ${c1.isReversed ? '(กลับหัว)' : ''}
* **คีย์เวิร์ด:** ${c1.card.keywords.join(', ')}
* **คำทำนาย:** ${c1.isReversed ? c1.card.reversedMeaning : c1.card.uprightMeaning}

---

### 2. ตำแหน่งปัจจุบัน/สถานการณ์จริง: **${c2.card.nameTh}** ${c2.isReversed ? '(กลับหัว)' : ''}
* **คีย์เวิร์ด:** ${c2.card.keywords.join(', ')}
* **คำทำนาย:** ${c2.isReversed ? c2.card.reversedMeaning : c2.card.uprightMeaning}

---

### 3. ตำแหน่งอนาคต/ทางออกและผลลัพธ์: **${c3.card.nameTh}** ${c3.isReversed ? '(กลับหัว)' : ''}
* **คีย์เวิร์ด:** ${c3.card.keywords.join(', ')}
* **คำทำนาย:** ${c3.isReversed ? c3.card.reversedMeaning : c3.card.uprightMeaning}

---

## 💡 สรุปการเชื่อมโยงคำตอบเรื่อง (${qText})
พลังแห่งอดีตของ **${c1.card.nameTh}** ได้ส่งผลกระทบต่อเนื่องมาถึงปัจจุบันกับไพ่ **${c2.card.nameTh}** โดยมีไพ่ **${c3.card.nameTh}** ชี้แนะเส้นทางไปสู่อนาคต จงใช้ปัญญา ความใจเย็น และสติในการฟันฝ่าอุปสรรคตามคำแนะนำของไพ่

## 🌟 คำแนะนำและข้อคิดจากจักรวาล
* **คำแนะนำจากไพ่หลัก:** ${c2.card.advice}
* **พลังบวกนำทาง:** ${c3.card.advice}

*จงเชื่อมั่นในตนเอง ไพ่เป็นเพียงผู้เปิดเผยแสงสว่าง ส่วนคุณคือผู้กำหนดชะตาชีวิตของตนเอง*`;
  }
}
