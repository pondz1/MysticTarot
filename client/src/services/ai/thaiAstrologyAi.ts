import type { ApiSettings, SavedReading } from '../../types';
import { requestModuleAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildMasterDirectives,
  buildFallbackMarkdown,
} from './markdownFormat';

function buildLocalPrompts(
  birthDate: string,
  dayOfWeekTh: string,
  elementTh: string,
  peakAgeRange: string,
  summaryGuidance: string
): { systemPrompt: string; userPrompt: string } {
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

  return {
    systemPrompt: `คุณคือ "หมอดูดวงไทยและกราฟชีวิต AI ระดับปรมาจารย์ (Celestial Master Thai Astrology Prophet)" ผู้เชี่ยวชาญตำรากราฟชีวิตโบราณ อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Thai Life Chart)**:
${structure}`,
    userPrompt: `วิเคราะห์กราฟชีวิตผู้เกิดวัน "${dayOfWeekTh}" วันที่ ${birthDate} ธาตุ ${elementTh} ช่วงพีค ${peakAgeRange}
ตอบตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`,
  };
}

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
  try {
    const content = await requestModuleAiCompletion(
      'thai_astrology',
      {
        birthDate,
        dayOfWeekTh,
        elementTh,
        peakAgeRange,
        summaryGuidance,
      },
      activeSettings,
      onChunk,
      historyEntry,
      signal,
      buildLocalPrompts(birthDate, dayOfWeekTh, elementTh, peakAgeRange, summaryGuidance)
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
