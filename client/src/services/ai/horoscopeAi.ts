import type { ApiSettings, SavedReading } from '../../types';
import { requestModuleAiCompletion } from './aiClient';
import { buildModulePrompts } from './buildPrompts';
import { buildFallbackMarkdown } from './markdownFormat';

export async function analyzeZodiacHoroscope(
  signNameTh: string,
  elementTh: string,
  timeframe: 'daily' | 'monthly',
  settings: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  const payload = { signNameTh, elementTh, timeframe };
  const localPrompts = buildModulePrompts('horoscope', payload);

  try {
    const content = await requestModuleAiCompletion(
      'horoscope',
      payload,
      settings,
      onChunk,
      historyEntry,
      signal,
      localPrompts
    );
    if (content && content.trim()) return content;
    throw new Error('ไม่สามารถประมวลผลคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.error('Failed Zodiac AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ดูดวงราศีได้ในขณะนี้');
  }
}

export function generateFallbackZodiacHoroscope(
  signNameTh: string,
  timeframe: 'daily' | 'monthly'
): string {
  const period = timeframe === 'daily' ? 'วันนี้' : 'เดือนนี้';
  return buildFallbackMarkdown(
    [
      {
        heading: 'ภาพรวมพลังงานดวงชะตา',
        body: `ชาวราศี${signNameTh}ในช่วง${period} มีพลังงานเหมาะกับการวางแผนและลงมือทำอย่างมีสติ อารมณ์และความคิดเฉียบคมขึ้น ใช้จังหวะนี้จัดลำดับความสำคัญ`,
      },
      {
        heading: 'การงานและการเรียน',
        body: 'งานและการเรียนไปได้ราบรื่น มีโอกาสได้แสดงศักยภาพ เหมาะกับการเจรจา วางแผน และปิดงานที่ค้างคา',
      },
      {
        heading: 'การเงินและโชคลาภ',
        body: 'สภาพคล่องอยู่ในเกณฑ์ดี มีโอกาสจากผลงานที่ทำไว้ ควรเก็บออมสำรองและเลี่ยงรายจ่ายฟุ่มเฟือย',
      },
      {
        heading: 'ความรักและความสัมพันธ์',
        body: 'คนมีคู่เข้าใจกันดีขึ้น คนโสดมีเสน่ห์ดึงดูด มิตรภาพใหม่ๆ อาจเข้ามาอย่างเป็นธรรมชาติ',
      },
      {
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: '- จัดลำดับงานสำคัญก่อน\n- ดูแลสุขภาพและพักผ่อนให้พอ\n- สื่อสารตรงไปตรงมาด้วยความสุภาพ',
      },
    ],
    'ยึดสติและความสม่ำเสมอ — ความก้าวหน้าจะตามมาเอง'
  );
}
