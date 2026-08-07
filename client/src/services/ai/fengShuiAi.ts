import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';

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

  const systemPrompt = `คุณคือปรมาจารย์แห่งศาสตร์ฮวงจุ้ยและสีมงคล (Feng Shui & Auspicious Master) โปรดวิเคราะห์ทิศมงคลและการจัดฮวงจุ้ยเพื่อเปิดรับพลังงานดี (ใช้ภาษาไทยสละสลวย 100%)

โครงสร้างบทวิเคราะห์ในรูปแบบ Markdown (ใช้หัวข้อ ##):
## 🧭 พลังงานฮวงจุ้ย & สีมงคลประจำวัน${dayNameTh} (สำหรับ ${selectedSpace})
(วิเคราะห์พลังงานธาตุประจำวันและการจัดองศาทิศทางเพื่อปรับพลังงานพื้นที่)

## 💼 การจัดฮวงจุ้ยเสริมการงาน & ธุรกิจ
(คำแนะนำจัดพื้นที่ ${selectedSpace} เสริมสีมงคลการงาน: ${luckyWork})

## 💰 การจัดฮวงจุ้ยเสริมโชคลาภ & ความมั่งคั่ง
(คำแนะนำจัดพื้นที่ ${selectedSpace} เสริมสีมงคลการเงิน: ${luckyWealth})

## 🚫 สิ่งที่ควรหลีกเลี่ยง & ทิศอัปมงคล
(คำแนะนำหลีกเลี่ยงสิ่งต้องห้ามและสีอัปมงคล: ${unluckyForbidden})

> 🌿 **เคล็ดลับปรับฮวงจุ้ยด่วน:** (เคล็ดลับง่ายๆ ที่ลงมือทำได้ทันที)`;

  const userPrompt = `โปรดวิเคราะห์การจัดฮวงจุ้ยสำหรับ "${selectedSpace}" ประจำวัน "${dayNameTh}" โดยมีสีมงคลการงาน: ${luckyWork}, สีมงคลการเงิน: ${luckyWealth}, สีมงคลความรัก: ${luckyLove}, และสีอัปมงคลต้องห้าม: ${unluckyForbidden}`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, activeSettings, onChunk, historyEntry);
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
