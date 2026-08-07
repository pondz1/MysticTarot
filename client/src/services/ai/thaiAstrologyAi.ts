import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildMasterDirectives,
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

  const systemPrompt = `คุณคือ "หมอดูดวงไทยและกราฟชีวิต AI ระดับปรมาจารย์ (Celestial Master Thai Astrology Prophet)" ผู้เชี่ยวชาญตำรากราฟชีวิตโบราณ อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Thai Life Chart)**:
${structure}`;

  const userPrompt = `วิเคราะห์กราฟชีวิตผู้เกิดวัน "${dayOfWeekTh}" วันที่ ${birthDate} ธาตุ ${elementTh} ช่วงพีค ${peakAgeRange}
ตอบตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`;

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
