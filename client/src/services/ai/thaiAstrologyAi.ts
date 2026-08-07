import type { ApiSettings, SavedReading } from '../../types';
import { requestModuleAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import { buildModulePrompts } from './buildPrompts';
import { buildFallbackMarkdown } from './markdownFormat';

export async function analyzeThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  elementTh: string,
  peakAgeRange: string,
  summaryGuidance: string,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  const activeSettings = settings || DEFAULT_API_SETTINGS;
  const payload = {
    birthDate,
    dayOfWeekTh,
    elementTh,
    peakAgeRange,
    summaryGuidance,
  };
  const localPrompts = buildModulePrompts('thai_astrology', payload);

  try {
    const content = await requestModuleAiCompletion(
      'thai_astrology',
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
    console.error('Failed Thai Astrology AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ดวงไทยโบราณได้ในขณะนี้');
  }
}

export function generateFallbackThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  peakAgeRange: string,
  summaryGuidance: string
): string {
  return buildFallbackMarkdown(
    [
      {
        heading: 'ภาพรวมกราฟชีวิต',
        body: `ผู้เกิด${dayOfWeekTh} (วันเกิด ${birthDate}) มีพื้นดวงที่ ${summaryGuidance} จังหวะชีวิตเติบโตได้มั่นคงหากวางแผนเป็นขั้น`,
      },
      {
        heading: `ช่วงอายุพีค (${peakAgeRange})`,
        body: `ช่วง ${peakAgeRange} เป็นจังหวะเร่งผลงานและสร้างฐาน เหมาะกับการลงทุนในทักษะและความสัมพันธ์เกื้อกูล`,
      },
      {
        heading: 'การงานและเกียรติยศ',
        body: 'งานก้าวหน้าได้ด้วยความสม่ำเสมอและความซื่อสัตย์ ผู้ใหญ่มักให้โอกาสเมื่อเห็นผลงานจริง',
      },
      {
        heading: 'การเงินและทรัพย์สิน',
        body: 'การเงินมั่นคงเมื่อมีแผนออมและเลี่ยงหนี้ฟุ่มเฟือย โชคจากความเพียรมีน้ำหนักกว่าโชคฉับพลัน',
      },
      {
        heading: 'ความรักและครอบครัว',
        body: 'ครอบครัวและคู่ครองเป็นฐานใจ เลือกคบคนที่ส่งเสริมกันระยะยาว',
      },
      {
        heading: 'ข้อควรระวังและคำแนะนำ',
        body: '- วางแผนระยะ 3–5 ปี\n- ดูแลสุขภาพช่วงกราฟลง\n- ใช้จังหวะพีคสร้างผลงานให้เป็นรูปธรรม',
      },
    ],
    'รู้จักจังหวะขึ้น-ลงของชีวิต — ลงมือเมื่อพร้อม หยุดพักเมื่อควร'
  );
}
