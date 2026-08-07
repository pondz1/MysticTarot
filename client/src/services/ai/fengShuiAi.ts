import type { ApiSettings, SavedReading } from '../../types';
import { requestModuleAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import { buildModulePrompts } from './buildPrompts';
import { buildFallbackMarkdown } from './markdownFormat';

export async function analyzeFengShui(
  dayNameTh: string,
  luckyWork: string,
  luckyWealth: string,
  luckyLove: string,
  unluckyForbidden: string,
  selectedSpace: string,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  const activeSettings = settings || DEFAULT_API_SETTINGS;
  const payload = {
    dayNameTh,
    luckyWork,
    luckyWealth,
    luckyLove,
    unluckyForbidden,
    selectedSpace,
  };
  const localPrompts = buildModulePrompts('feng_shui', payload);

  try {
    const content = await requestModuleAiCompletion(
      'feng_shui',
      payload,
      activeSettings,
      onChunk,
      historyEntry,
      signal,
      localPrompts
    );
    if (content && content.trim()) return content;
    throw new Error('ไม่สามารถประมวลผลคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.error('Failed Feng Shui AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ฮวงจุ้ย & สีมงคลได้ในขณะนี้');
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
  return buildFallbackMarkdown(
    [
      {
        heading: 'ภาพรวมฮวงจุ้ยและสีมงคล',
        body: `วัน${dayNameTh} เหมาะกับการจัดพื้นที่ **${spaceType}** ให้สอดคล้องกับสีมงคลของวัน ช่วยหนุนงาน เงิน และความสัมพันธ์`,
      },
      {
        heading: 'การงานและพื้นที่ทำงาน',
        body: `ใช้โทนสี ${luckyWork} บริเวณมุมทำงาน จัดของให้โล่ง อ่านง่าย ลดสิ่งรบกวนสายตา`,
      },
      {
        heading: 'การเงินและโชคลาภ',
        body: `เสริมด้วยสี ${luckyWealth} ในจุดรับแสงหรือมุมเก็บของมีค่า หมั่นเก็บเงินอย่างมีระบบ`,
      },
      {
        heading: 'ความรักและเมตตา',
        body: `ใช้สี ${luckyLove} เบาๆ ในพื้นที่ส่วนตัว เพิ่มความอบอุ่นและการสื่อสาร`,
      },
      {
        heading: 'สิ่งที่ควรหลีกเลี่ยง',
        body: `เลี่ยงโทน ${unluckyForbidden} ในจุดหลักของบ้านวันนี้`,
      },
      {
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: '- จัดโต๊ะให้โล่งก่อนเริ่มงาน\n- เปิดทางเดินหลักให้โปร่ง\n- ใช้สีมงคลของวันเป็นจุดเน้นไม่ต้องทาสีทั้งห้อง',
      },
    ],
    'ปรับพื้นที่เล็กน้อยอย่างสม่ำเสมอ — พลังงานดีตามมาเอง'
  );
}
