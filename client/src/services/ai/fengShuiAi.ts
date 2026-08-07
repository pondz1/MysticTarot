import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildMasterDirectives,
  buildFallbackMarkdown,
} from './markdownFormat';

export async function analyzeFengShui(
  dayNameTh: string,
  luckyWork: string,
  luckyWealth: string,
  luckyLove: string,
  unluckyForbidden: string,
  selectedSpace: string,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const activeSettings = settings || DEFAULT_API_SETTINGS;

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

  const systemPrompt = `คุณคือ "หมอดูฮวงจุ้ยและสีมงคล AI ระดับปรมาจารย์ (Celestial Master Feng Shui Prophet)" ผู้จัดพลังงานพื้นที่ อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Feng Shui)**:
${structure}`;

  const userPrompt = `วิเคราะห์ฮวงจุ้ยพื้นที่ "${selectedSpace}" ประจำวัน "${dayNameTh}"
สีมงคลงาน: ${luckyWork}
สีมงคลเงิน: ${luckyWealth}
สีมงคลรัก: ${luckyLove}
สีควรหลีก: ${unluckyForbidden}
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
        body: `ประจำ**${dayNameTh}** พื้นที่ **${spaceType}** เหมาะกับการปรับสีและการจัดวางเล็กน้อยเพื่อให้พลังงานไหลเวียนรับโชคลาภ`,
      },
      {
        heading: 'การงานและพื้นที่ทำงาน',
        body: `สีมงคลงาน **${luckyWork}** ช่วยเสริมความน่าเชื่อถือและสมาธิ จัดโต๊ะให้โล่ง หันรับแสงธรรมชาติถ้าทำได้`,
      },
      {
        heading: 'การเงินและโชคลาภ',
        body: `สีมงคลการเงิน **${luckyWealth}** เหมาะกับการเจรจาและการรับทรัพย์ เก็บพื้นที่ให้สะอาดเป็นระเบียบ`,
      },
      {
        heading: 'ความรักและเมตตา',
        body: `สีมงคลความรัก **${luckyLove}** เสริมเสน่ห์และความอ่อนโยนในความสัมพันธ์`,
      },
      {
        heading: 'สิ่งที่ควรหลีกเลี่ยง',
        body: `ควรเลี่ยงสี **${unluckyForbidden}** ในวันนี้ และอย่ากองของรกบริเวณทางเข้าหรือมุมทำงาน`,
      },
      {
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: '- เปิดหน้าต่างรับแสงยามเช้า\n- จัดโต๊ะทำงานให้เป็นระเบียบ\n- ใช้สีมงคลในเครื่องแต่งกายหรือของตกแต่งเล็กน้อย',
      },
    ],
    'จัดพื้นที่ให้โล่ง สะอาด และมีแสง — พลังงานดีเริ่มจากสิ่งที่ทำได้ทันที'
  );
}
