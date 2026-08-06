import type { ApiSettings } from '../../features/tarot/types/tarot';
import { requestAiCompletion } from './aiClient';

export async function analyzeZodiacHoroscope(
  signNameTh: string,
  elementTh: string,
  timeframe: 'daily' | 'monthly',
  settings: ApiSettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `คุณคือโหราจารย์ผู้หยั่งรู้ดวงดาว 12 ราศี วิเคราะห์ดวงชะตาสละสลวย ให้พลังบวกและข้อคิดแม่นยำ`;
  const userPrompt = `โปรดทำนายดวงชะตา ${timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'} สำหรับผู้เกิด "${signNameTh}" (${elementTh})
โดยแยกหัวข้อสั้นๆ สละสลวยดังนี้:
1. 🔮 ภาพรวมพลังงานดวงดาว
2. 💼 การงาน & การเรียน
3. 💰 การเงิน & โชคลาภ
4. ❤️ ความรัก & ความสัมพันธ์
5. 🌟 ข้อคิดชี้ทางประจำวัน`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, settings, onChunk);
    if (content && content.trim()) {
      return content;
    }
    return generateFallbackZodiacHoroscope(signNameTh, timeframe);
  } catch (error: any) {
    console.error('Failed Zodiac AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ดูดวงราศีได้ในขณะนี้');
  }
}

export function generateFallbackZodiacHoroscope(signNameTh: string, timeframe: 'daily' | 'monthly'): string {
  return `**ภาพรวมดวงชะตา ${signNameTh} (${timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'})**

ช่วงเวลานี้ดวงดาวประจำราศีส่งพลังงานบวกและโอกาสใหม่ๆ เข้ามา ให้ใช้วิสัยทัศน์และความตั้งใจในการเดินหน้าต่อ

**การงาน & การเรียน:** ราบรื่น มีผู้ใหญ่อุปถัมภ์ งานที่ติดต่อไว้จะได้รับข่าวดี
**การเงิน & โชคลาภ:** การเงินสะพัด มีช่องทางทำเงินเพิ่ม แต่ควรวางแผนรายจ่ายให้รอบคอบ
**ความรัก & ความสัมพันธ์:** คนมีคู่มีความเข้าใจกันดี คนโสดมีเสน่ห์โดดเด่นมีคนสนใจ
**ข้อคิดชี้ทาง:** "เปิดใจรับโอกาสใหม่ด้วยสติและความมั่นใจ แล้วความสำเร็จจะเข้ามาหาคุณ"`;
}
