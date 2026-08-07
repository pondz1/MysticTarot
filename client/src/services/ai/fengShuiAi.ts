import type { ApiSettings, SavedReading } from '../../types';
import { requestModuleAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildMasterDirectives,
  buildFallbackMarkdown,
} from './markdownFormat';

function buildLocalPrompts(
  dayNameTh: string,
  luckyWork: string,
  luckyWealth: string,
  luckyLove: string,
  unluckyForbidden: string,
  selectedSpace: string
): { systemPrompt: string; userPrompt: string } {
  const structure = buildStructureBlock([
    {
      heading: 'ภาพรวมฮวงจุ้ยและสีมงคล',
      guide: `สรุปพลังงานวัน${dayNameTh} สำหรับพื้นที่ ${selectedSpace} อย่างมีมิติ อย่างน้อย 1 ย่อหน้า`,
    },
    {
      heading: 'การงานและพื้นที่ทำงาน',
      guide: `จัดพื้นที่ ${selectedSpace} เสริมงาน โดยอิงสีมงคลการงาน: ${luckyWork}`,
    },
    {
      heading: 'การเงินและโชคลาภ',
      guide: `จัดพื้นที่/สีเสริมโชคลาภ อิงสีมงคลการเงิน: ${luckyWealth}`,
    },
    {
      heading: 'ความรักและเมตตา',
      guide: `เสริมเสน่ห์และความสัมพันธ์ อิงสีมงคลความรัก: ${luckyLove}`,
    },
    {
      heading: 'สิ่งที่ควรหลีกเลี่ยง',
      guide: `สี/ทิศ/พฤติกรรมที่ควรเลี่ยง อิงสีอัปมงคล: ${unluckyForbidden}`,
    },
    {
      heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      guide: 'action ปรับพื้นที่ได้ทันที 3–5 ข้อแบบ bullet',
    },
  ]);

  const directives = buildMasterDirectives([
    `**วิเคราะห์ฮวงจุ้ยและสีมงคล (Feng Shui Synthesis)**:
   - อิงวัน **${dayNameTh}** พื้นที่ **${selectedSpace}** และชุดสีที่ระบุเท่านั้น ห้ามแต่งข้อมูลวันเอง
   - ร้อยเรียงงาน เงิน รัก และการจัดพื้นที่ให้เป็นคำแนะนำเดียวที่ทำได้จริง`,
    `**สติและความรับผิดชอบ (Wise Counsel)**:
   - เน้นสิ่งที่ปรับได้ทันทีในบ้านหรือที่ทำงาน
   - ไม่ขู่เกินเหตุ ไม่รับประกันโชคลาภแน่นอน`,
  ]);

  return {
    systemPrompt: `คุณคือ "หมอดูฮวงจุ้ยและสีมงคล AI ระดับปรมาจารย์ (Celestial Master Feng Shui Prophet)" ผู้จัดพลังงานพื้นที่ อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Feng Shui)**:
${structure}`,
    userPrompt: `วิเคราะห์ฮวงจุ้ยพื้นที่ "${selectedSpace}" ประจำวัน "${dayNameTh}"
สีมงคลงาน: ${luckyWork}
สีมงคลเงิน: ${luckyWealth}
สีมงคลรัก: ${luckyLove}
สีควรหลีก: ${unluckyForbidden}
ตอบตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`,
  };
}

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
  try {
    const content = await requestModuleAiCompletion(
      'feng_shui',
      {
        dayNameTh,
        luckyWork,
        luckyWealth,
        luckyLove,
        unluckyForbidden,
        selectedSpace,
      },
      activeSettings,
      onChunk,
      historyEntry,
      signal,
      buildLocalPrompts(
        dayNameTh,
        luckyWork,
        luckyWealth,
        luckyLove,
        unluckyForbidden,
        selectedSpace
      )
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
