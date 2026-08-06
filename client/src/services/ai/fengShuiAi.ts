import type { ApiSettings } from '../../features/tarot/types/tarot';
import { requestAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';

export async function analyzeFengShui(
  dayNameTh: string,
  luckyWork: string,
  luckyWealth: string,
  luckyLove: string,
  unluckyForbidden: string,
  spaceType: string = 'ภาพรวมที่อยู่อาศัย & โต๊ะทำงาน',
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const effectiveSettings = settings || DEFAULT_API_SETTINGS;

  const systemPrompt = `คุณคือซินแสผู้เชี่ยวชาญศาสตร์ฮวงจุ้ยและการปรับพลังงานเบญจธาตุระดับสูง โปรดให้คำแนะนำการแต่งกายสีมงคล ทิศรับทรัพย์ และการจัดวางพื้นที่ (${spaceType}) ในรูปแบบ Markdown (ใช้ภาษาไทยสละสลวย 100%)

โครงสร้างคำทำนายในรูปแบบ Markdown:
## 🔮 ภาพรวมพลังงานเบญจธาตุ & สมดุลชีวิต
(เกริ่นนำพลังงานธาตุประจำวันและการเปิดรับโชคลาภ)

## 👕 สีเสื้อมงคลเสริมพลังชีวิต
(วิเคราะห์การเลือกแต่งกายด้วยสีมงคลในแต่ละด้าน)

## 🧭 การจัดฮวงจุ้ยพื้นที่ (${spaceType})
(เคล็ดลับการจัดวางทิศทาง แสงสว่าง และวัตถุมงคลรับทรัพย์)

## ⚠️ ข้อควรระวัง & สีต้องห้าม
(เตือนสติเรื่องสีต้องห้าม ${unluckyForbidden} และจุดอับพลังงานที่ควรแก้ไข)

> **เคล็ดลับซินแสประจำวัน:** (ข้อคิดปรับสมดุลชีวิตและจิตใจ)`;

  const userPrompt = `ข้อมูลฮวงจุ้ยประจำ${dayNameTh}:
- สีเสริมการงาน: ${luckyWork}
- สีเสริมการเงินโชคลาภ: ${luckyWealth}
- สีเสริมความรักเมตตา: ${luckyLove}
- สีต้องห้าม/ฉุดดวง: ${unluckyForbidden}
- พื้นที่ที่ต้องการจัดฮวงจุ้ย: ${spaceType}`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, effectiveSettings, onChunk);
    if (content && content.trim()) {
      return content;
    }
    return generateFallbackFengShui(dayNameTh, luckyWork, luckyWealth, luckyLove, unluckyForbidden, spaceType);
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
  return `## เคล็ดลับฮวงจุ้ย & สีมงคลประจำ${dayNameTh}
การเลือกสวมใส่เสื้อผ้าและจัดวางพลังงานในพื้นที่ **${spaceType}** ประจำ${dayNameTh} ช่วยดึงดูดพลังงานโชคลาภและสิริมงคล

## สีเสื้อมงคลเสริมการงาน: ${luckyWork}
ช่วยเพิ่มความน่าเชื่อถือ เสริมอำนาจบารมี และได้รับการสนับสนุนจากผู้ร่วมงาน

## สีเสื้อมงคลเสริมการเงิน: ${luckyWealth}
ดึงดูดเงินทองและโชคลาภทางการค้า เหมาะสำหรับการเจรจาธุรกิจและปิดการขาย

## สีเสื้อมงคลเสริมความรัก: ${luckyLove}
เสริมเสน่ห์เมตตามหานิยม ความสัมพันธ์ราบรื่น อ่อนโยนและได้รับความเอ็นดู

## สีต้องห้ามประจำวัน: ${unluckyForbidden}
ควรหลีกเลี่ยงการสวมใส่เสื้อผ้าสี **${unluckyForbidden}** ในวันนี้ เพื่อป้องกันพลังงานขัดข้อง

> **เคล็ดลับซินแส:** "เปิดหน้าต่างรับแสงแดดยามเช้า จัดโต๊ะทำงานให้เป็นระเบียบ เพื่อเปิดทางให้พลังงานชี่ (Chi) ไหลเวียนรับทรัพย์อย่างสมบูรณ์"`;
}
