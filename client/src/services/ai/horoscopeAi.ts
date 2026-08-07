import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  lifeAspectSections,
  buildFallbackMarkdown,
} from './markdownFormat';

export async function analyzeZodiacHoroscope(
  signNameTh: string,
  elementTh: string,
  timeframe: 'daily' | 'monthly',
  settings: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const period = timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน';

  const structure = buildStructureBlock(
    lifeAspectSections({
      overviewHeading: 'ภาพรวมพลังงานดวงชะตา',
      overviewGuide: `สรุปพลังงานราศี${signNameTh} ธาตุ${elementTh} ช่วง${period} 2–4 ประโยค`,
      workGuide: 'ทิศทางงาน ธุรกิจ การศึกษา โอกาสและอุปสรรค',
      moneyGuide: 'สภาพคล่อง โชคลาภ การใช้จ่ายและการเก็บออม',
      loveGuide: 'ความสัมพันธ์ คนมีคู่/คนโสด เสน่ห์และมิตรภาพ',
      adviceGuide: 'ข้อแนะนำปฏิบัติได้จริง 2–4 ข้อแบบ bullet',
    })
  );

  const systemPrompt = `คุณคือโหราจารย์ 12 ราศี วิเคราะห์ดวงชะตาอย่างชัดเจน อบอุ่น และนำไปใช้ได้จริง

กฎ:
1. ภาษาไทยสละสลวย อ่านง่าย ตรงประเด็น
2. ไม่ขู่เกินเหตุ ไม่รับประกันโชคลาภแน่นอน
3. แยกแง่มุมชีวิตตามหัวข้อที่กำหนด

${MARKDOWN_OUTPUT_RULES}

${structure}`;

  const userPrompt = `โปรดทำนายดวง${period} ของราศี "${signNameTh}" (ธาตุ ${elementTh}) ตามโครงสร้าง markdown ที่กำหนด`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, settings, onChunk, historyEntry);
    if (content && content.trim()) {
      return content;
    }
    throw new Error('ไม่สามารถประมวลผลคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
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
        heading: 'คำแนะนำ',
        body: '- จัดลำดับงานสำคัญก่อน\n- ดูแลสุขภาพและพักผ่อนให้พอ\n- สื่อสารตรงไปตรงมาด้วยความสุภาพ',
      },
    ],
    'ยึดสติและความสม่ำเสมอ — ความก้าวหน้าจะตามมาเอง'
  );
}
