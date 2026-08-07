import type { ApiSettings, SavedReading } from '../../types';
import { requestModuleAiCompletion } from './aiClient';
import { buildModulePrompts } from './buildPrompts';
import { buildFallbackMarkdown } from './markdownFormat';

export async function analyzeNumerology(
  digitsStr: string,
  sumValue: number,
  sumTitle: string,
  pairsSummary: string,
  settings: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  const payload = { digitsStr, sumValue, sumTitle, pairsSummary };
  const localPrompts = buildModulePrompts('numerology', payload);

  try {
    const content = await requestModuleAiCompletion(
      'numerology',
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
    console.error('Failed Numerology AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ถอดรหัสตัวเลขได้ในขณะนี้');
  }
}

export function generateFallbackNumerology(
  inputNumber: string,
  sumValue: number,
  sumTitle: string
): string {
  return buildFallbackMarkdown(
    [
      {
        heading: 'ภาพรวมพลังงานตัวเลข',
        body: `ชุดเลข **${inputNumber}** มีผลรวม **${sumValue}** (${sumTitle}) ส่งเสริมพลังชีวิตให้ก้าวหน้าและสมดุล หากใช้อย่างมีสติ`,
      },
      {
        heading: 'การงานและการเรียน',
        body: 'ส่งเสริมไหวพริบและความคิดสร้างสรรค์ มีแนวโน้มได้รับความไว้วางใจในการเจรจาและงานที่ต้องใช้สติปัญญา',
      },
      {
        heading: 'การเงินและโชคลาภ',
        body: 'การเงินไหลเวียนได้ดี เหมาะกับการค้าและการวางแผนรายรับ-รายจ่ายอย่างมีระบบ',
      },
      {
        heading: 'ความรักและความสัมพันธ์',
        body: 'มีเสน่ห์ดึงดูด ได้รับความเอ็นดูจากคนรอบข้าง มิตรภาพเกื้อกูล',
      },
      {
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: '- ใช้ตัวเลขเป็นแรงหนุน ไม่ใช่ที่พึ่งเดียว\n- ลงมือทำสม่ำเสมอคู่กับการวางแผน\n- รักษาเครดิตและความสัมพันธ์ระยะยาว',
      },
    ],
    'ตัวเลขหนุนนำ — สติและการลงมือทำคือกุญแจสู่ผลลัพธ์ยั่งยืน'
  );
}
