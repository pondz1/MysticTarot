import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  lifeAspectSections,
  buildFallbackMarkdown,
} from './markdownFormat';

export async function analyzeNumerology(
  digitsStr: string,
  sumValue: number,
  sumTitle: string,
  pairsSummary: string,
  settings: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const structure = buildStructureBlock(
    lifeAspectSections({
      overviewHeading: 'ภาพรวมพลังงานตัวเลข',
      overviewGuide: `วิเคราะห์ผลรวม ${sumValue} (${sumTitle}) และโทนพลังงานของชุดเลข ${digitsStr}`,
      workGuide: 'อิทธิพลต่อการงาน ธุรกิจ ตำแหน่งหน้าที่ และการเจรจา',
      moneyGuide: 'สภาพคล่อง โชคลาภ การหมุนเงินและการดึงดูดทรัพย์',
      loveGuide: 'เสน่ห์ มิตรภาพ ผู้ใหญ่อุปถัมภ์ และความสัมพันธ์',
      adviceGuide: 'วิธีใช้พลังงานตัวเลขให้เกิดประโยชน์ 2–4 ข้อแบบ bullet',
    })
  );

  const systemPrompt = `คุณคือผู้เชี่ยวชาญเลขศาสตร์และเบอร์มงคล วิเคราะห์ตัวเลขอย่างชัดเจน แม่นยำ และให้ข้อคิดใช้ได้จริง

กฎ:
1. ภาษาไทยสละสลวย อ่านง่าย ตรงประเด็น
2. อ้างอิงผลรวมและคู่เลขที่ให้มา ห้ามแต่งตัวเลขใหม่
3. ไม่รับประกันความมั่งคั่งแน่นอน

${MARKDOWN_OUTPUT_RULES}

${structure}`;

  const userPrompt = `โปรดวิเคราะห์ชุดตัวเลข "${digitsStr}" ผลรวม ${sumValue} (${sumTitle}) คู่เลขสำคัญ: ${pairsSummary}
ตอบตามโครงสร้าง markdown ที่กำหนด`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, settings, onChunk, historyEntry);
    if (content && content.trim()) {
      return content;
    }
    throw new Error('ไม่สามารถประมวลผลคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
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
        heading: 'คำแนะนำ',
        body: '- ใช้ตัวเลขเป็นแรงหนุน ไม่ใช่ที่พึ่งเดียว\n- ลงมือทำสม่ำเสมอคู่กับการวางแผน\n- รักษาเครดิตและความสัมพันธ์ระยะยาว',
      },
    ],
    'ตัวเลขหนุนนำ — สติและการลงมือทำคือกุญแจสู่ผลลัพธ์ยั่งยืน'
  );
}
