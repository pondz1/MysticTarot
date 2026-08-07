import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildFallbackMarkdown,
} from './markdownFormat';

export async function analyzeThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  elementTh: string,
  peakAgeRange: string,
  summaryGuidance: string,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const activeSettings = settings || DEFAULT_API_SETTINGS;

  const structure = buildStructureBlock([
    {
      heading: 'ภาพรวมกราฟชีวิต',
      guide: `สรุปพื้นดวงผู้เกิดวัน${dayOfWeekTh} ธาตุ${elementTh} และโทนชีวิตโดยรวม`,
    },
    {
      heading: `ช่วงอายุพีค (${peakAgeRange})`,
      guide: 'โอกาส ความสำเร็จ และสิ่งที่ควรเร่งทำในช่วงพีค',
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
      guide: 'ช่วงกราฟลง วิธีตั้งรับ และ actionable 2–4 ข้อแบบ bullet',
    },
  ]);

  const systemPrompt = `คุณคือโหราจารย์ที่เชี่ยวชาญกราฟชีวิตและโหราศาสตร์ไทย วิเคราะห์ชัดเจน ให้สติ และนำไปวางแผนอนาคตได้

กฎ:
1. ภาษาไทยสละสลวย อ่านง่าย ตรงประเด็น
2. อิงวันเกิด วันในสัปดาห์ ธาตุ และช่วงพีคที่ให้มา
3. ไม่ขู่เกินเหตุ เน้นการเตรียมตัวและสติ

${MARKDOWN_OUTPUT_RULES}

${structure}

ข้อมูลอ้างอิงเพิ่ม: ${summaryGuidance}`;

  const userPrompt = `วิเคราะห์กราฟชีวิตผู้เกิดวัน "${dayOfWeekTh}" วันที่ ${birthDate} ธาตุ ${elementTh} ช่วงพีค ${peakAgeRange}
ตอบตามโครงสร้าง markdown ที่กำหนด`;

  try {
    const content = await requestAiCompletion(
      systemPrompt,
      userPrompt,
      activeSettings,
      onChunk,
      historyEntry
    );
    if (content && content.trim()) {
      return content;
    }
    throw new Error('ไม่สามารถประมวลผลคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
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
        body: `ช่วง **${peakAgeRange}** เหมาะกับการกอบโกย ลงทุนในตัวเอง และรับโอกาสใหญ่ ควรวางรากฐานก่อนถึงช่วงนี้`,
      },
      {
        heading: 'การงานและเกียรติยศ',
        body: 'งานสร้างชื่อเสียงได้เมื่อซื่อสัตย์และประณีต มีแนวโน้มได้รับความไว้วางใจจากผู้ใหญ่',
      },
      {
        heading: 'การเงินและทรัพย์สิน',
        body: 'การเงินหมุนเวียนได้ดีในระยะยาว มีโอกาสสะสมทรัพย์หรือสินทรัพย์เมื่อผ่านช่วงกลางคน',
      },
      {
        heading: 'ความรักและครอบครัว',
        body: 'คู่ครองและครอบครัวเกื้อกูลได้ดี หากสื่อสารด้วยความเข้าใจในยามกดดัน',
      },
      {
        heading: 'ข้อควรระวังและคำแนะนำ',
        body: '- เลี่ยงตัดสินใจใหญ่ตอนอารมณ์ร้อน\n- สะสมวินัยการเงินก่อนช่วงพีค\n- ดูแลสุขภาพเป็นทุนชีวิต',
      },
    ],
    'ยึดสติและความเพียร — บารมีและความสำเร็จจะสะสมตามจังหวะชีวิต'
  );
}
