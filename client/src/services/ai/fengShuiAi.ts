import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
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
      guide: `สรุปพลังงานวัน${dayNameTh} สำหรับพื้นที่ ${selectedSpace} 2–4 ประโยค`,
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
      heading: 'คำแนะนำ',
      guide: 'action ปรับพื้นที่ได้ทันที 2–4 ข้อแบบ bullet',
    },
  ]);

  const systemPrompt = `คุณคือผู้เชี่ยวชาญฮวงจุ้ยและสีมงคล ให้คำแนะนำปฏิบัติได้จริง ชัดเจน และสุภาพ

กฎ:
1. ภาษาไทยสละสลวย อ่านง่าย ตรงประเด็น
2. อิงสีมงคล/อัปมงคลและพื้นที่ที่ระบุ ห้ามแต่งข้อมูลวันเอง
3. เน้นสิ่งที่ทำได้ทันทีในบ้านหรือที่ทำงาน

${MARKDOWN_OUTPUT_RULES}

${structure}`;

  const userPrompt = `วิเคราะห์ฮวงจุ้ยพื้นที่ "${selectedSpace}" ประจำวัน "${dayNameTh}"
สีมงคลงาน: ${luckyWork}
สีมงคลเงิน: ${luckyWealth}
สีมงคลรัก: ${luckyLove}
สีควรหลีก: ${unluckyForbidden}
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
        heading: 'คำแนะนำ',
        body: '- เปิดหน้าต่างรับแสงยามเช้า\n- จัดโต๊ะทำงานให้เป็นระเบียบ\n- ใช้สีมงคลในเครื่องแต่งกายหรือของตกแต่งเล็กน้อย',
      },
    ],
    'จัดพื้นที่ให้โล่ง สะอาด และมีแสง — พลังงานดีเริ่มจากสิ่งที่ทำได้ทันที'
  );
}
