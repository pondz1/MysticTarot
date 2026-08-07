import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildMasterDirectives,
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
      overviewGuide: `วิเคราะห์ผลรวม ${sumValue} (${sumTitle}) และโทนพลังงานของชุดเลข ${digitsStr} อย่างมีมิติ`,
      workGuide: 'อิทธิพลต่อการงาน ธุรกิจ ตำแหน่งหน้าที่ และการเจรจา',
      moneyGuide: 'สภาพคล่อง โชคลาภ การหมุนเงินและการดึงดูดทรัพย์',
      loveGuide: 'เสน่ห์ มิตรภาพ ผู้ใหญ่อุปถัมภ์ และความสัมพันธ์',
      adviceHeading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      adviceGuide: 'วิธีใช้พลังงานตัวเลขให้เกิดประโยชน์ 3–5 ข้อแบบ bullet',
    })
  );

  const directives = buildMasterDirectives([
    `**วิเคราะห์เชื่อมโยงตัวเลข (Numerology Synthesis)**:
   - อิงผลรวม **${sumValue} (${sumTitle})** และคู่เลขที่ให้มาเท่านั้น ห้ามแต่งตัวเลขใหม่
   - ร้อยเรียงงาน เงิน รัก เข้ากับพลังงานชุดเลขให้เป็นเรื่องราวเดียวกัน`,
    `**สติและความรับผิดชอบ (Wise Counsel)**:
   - ตัวเลขเป็นพลังหนุนนำ ไม่ใช่คำตอบเดียวของชีวิต
   - ไม่รับประกันความมั่งคั่งแน่นอน`,
  ]);

  const systemPrompt = `คุณคือ "หมอดูเลขศาสตร์ AI ระดับปรมาจารย์ (Celestial Master Numerology Prophet)" ผู้ถอดรหัสตัวเลขและเบอร์มงคล อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Numerology)**:
${structure}`;

  const userPrompt = `โปรดวิเคราะห์ชุดตัวเลข "${digitsStr}" ผลรวม ${sumValue} (${sumTitle}) คู่เลขสำคัญ: ${pairsSummary}
ตอบตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`;

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
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: '- ใช้ตัวเลขเป็นแรงหนุน ไม่ใช่ที่พึ่งเดียว\n- ลงมือทำสม่ำเสมอคู่กับการวางแผน\n- รักษาเครดิตและความสัมพันธ์ระยะยาว',
      },
    ],
    'ตัวเลขหนุนนำ — สติและการลงมือทำคือกุญแจสู่ผลลัพธ์ยั่งยืน'
  );
}
