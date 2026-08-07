import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion } from './aiClient';

export async function analyzeZodiacHoroscope(
  signNameTh: string,
  elementTh: string,
  timeframe: 'daily' | 'monthly',
  settings: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const systemPrompt = `คุณคือโหราจารย์ผู้หยั่งรู้ดวงดาว 12 ราศี โปรดวิเคราะห์ดวงชะตาอย่างลึกซึ้ง มีเสน่ห์ ทรงพลัง และให้สติปัญญาในการดำเนินชีวิต (ใช้ภาษาไทยสละสลวย 100%)

โครงสร้างคำทำนายในรูปแบบ Markdown (ใช้หัวข้อ ##):
## 🔮 ภาพรวมพลังงานดวงชะตา
(เกริ่นนำพลังงานดาวประจำราศี ${signNameTh} ธาตุ ${elementTh} และจังหวะชีวิต ${timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'})

## 💼 การงาน & การเรียน
(วิเคราะห์ทิศทางงาน ธุรกิจ การศึกษา และโอกาสก้าวหน้า)

## 💰 การเงิน & โชคลาภ
(วิเคราะห์สภาพคล่อง โชคลาภ ลาภลอย และการบริหารเงิน)

## ❤️ ความรัก & ความสัมพันธ์
(วิเคราะห์ความสัมพันธ์ คนมีคู่ และเสน่ห์คนโสด)

> 🌟 **สารสั้นเตือนใจ:** (ข้อคิดสะกิดใจสร้างพลังบวก)`;

  const userPrompt = `โปรดทำนายดวงชะตา ${timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'} สำหรับผู้เกิด "${signNameTh}" (${elementTh})`;

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

export function generateFallbackZodiacHoroscope(signNameTh: string, timeframe: 'daily' | 'monthly'): string {
  return `## 🔮 ภาพรวมพลังงานดวงชะตา
ชาวราศี${signNameTh}ผู้เปี่ยมด้วยพลังแห่งการเริ่มต้นและความมุ่งมั่น จังหวะชีวิตในระยะ${timeframe === 'daily' ? 'วันนี้' : 'เดือนนี้'} มีพลังดาวประจำราศีส่งผลให้อารมณ์และความคิดเฉียบคม มีวิสัยทัศน์ในการสร้างสรรค์สิ่งใหม่ๆ

## 💼 การงาน & การเรียน
สถานการณ์รอบตัวราบรื่น มีโอกาสได้แสดงศักยภาพโดดเด่น ผู้ใหญ่หรือเพื่อนร่วมงานให้ความไว้วางใจ เหมาะกับการวางแผนและลงมือทำโปรเจกต์สำคัญ

## 💰 การเงิน & โชคลาภ
สภาพคล่องการเงินอยู่ในเกณฑ์ดี มีโชคลาภจากการเจรจาหรือผลงานที่ทำไว้ การหมุนเวียนเงินคล่องตัวขึ้น แต่ควรเก็บออมสำรองไว้ล่วงหน้า

## ❤️ ความรัก & ความสัมพันธ์
คนมีคู่มีความเข้าใจและเกื้อกูลกันดี คนโสดมีเสน่ห์ดึงดูดผู้คนรอบข้างเป็นพิเศษ มีเกณฑ์พบมิตรภาพใหม่ๆ ที่น่าประทับใจ

> 🌟 **สารสั้นเตือนใจ:** "ยึดมั่นในสติและความดีงาม ก้าวเดินไปด้วยความมั่นใจ แล้วความสำเร็จจะปรากฏตรงหน้าคุณ"`;
}
