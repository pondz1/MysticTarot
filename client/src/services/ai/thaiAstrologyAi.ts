import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion, DEFAULT_API_SETTINGS } from './aiClient';

export async function analyzeThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  elementTh: string,
  peakAgeRange: string,
  summaryGuidance: string,
  settings?: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const activeSettings = settings || DEFAULT_API_SETTINGS;

  const systemPrompt = `คุณคือโหราจารย์อาโสฬสผู้เชี่ยวชาญตำรากราฟชีวิตและโหราศาสตร์ไทยโบราณ โปรดวิเคราะห์กราฟชีวิต 9 ช่วงอายุอย่างลึกซึ้ง ให้สติปัญญาในการดำเนินชีวิต (ใช้ภาษาไทยสละสลวย 100%)

โครงสร้างบทวิเคราะห์ในรูปแบบ Markdown (ใช้หัวข้อ ##):
## 📜 จังหวะชีวิตและพลังดาวประจำวันเกิด (วัน${dayOfWeekTh} ธาตุ${elementTh})
(วิเคราะห์พลังงานหลักของดวงชะตาและพื้นดวงเดิม)

## 📈 ช่วงอายุพีคทองคำ (${peakAgeRange})
(วิเคราะห์โอกาส ความสำเร็จ และจังหวะก้าวหน้าสูงสุด)

## ⚖️ ข้อควรระวังและวิธีตั้งรับช่วงกราฟชีวิตลง
(คำแนะนำการใช้ชีวิตด้วยความไม่ประมาทและการเสริมบารมี)

> 🕯️ **โอวาทคำสอนเตือนสติ:** ${summaryGuidance}`;

  const userPrompt = `โปรดทำนายวิเคราะห์กราฟชีวิตดวงไทยสำหรับผู้เกิดวัน "${dayOfWeekTh}" (เกิดวันที่ ${birthDate}, ธาตุ ${elementTh}) มีช่วงอายุพีคสูงสุดคือ ${peakAgeRange}`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, activeSettings, onChunk, historyEntry);
    if (content && content.trim()) {
      return content;
    }
    return generateFallbackThaiLifeGraph(birthDate, dayOfWeekTh, peakAgeRange, summaryGuidance);
  } catch (error: any) {
    console.error('Failed Thai Astrology AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ดวงไทยโบราณได้ในขณะนี้');
  }
}

export function generateFallbackThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  peakAgeRange: string,
  summaryGuidance: string
): string {
  return `## ภาพรวมดวงชะตากราฟชีวิตผู้เกิด${dayOfWeekTh} (วันเกิด ${birthDate})
ผู้เกิด${dayOfWeekTh} มีพลังสถิตแข็งแกร่ง ${summaryGuidance} ดวงชะตามีจังหวะเติบโตอย่างมั่นคงตามลำดับ

## จังหวะกราฟชีวิตช่วงพีคสูงสุด: ${peakAgeRange}
ช่วงอายุ **${peakAgeRange}** นับเป็นช่วงเวลาทองแห่งการกอบโกยและสร้างอนาคต มีโอกาสใหญ่เข้ามาในชีวิต

## การงาน & เกียรติยศ
งานสร้างชื่อเสียง มีโอกาสได้รับความไว้วางใจจากผู้ใหญ่ ให้เน้นความซื่อสัตย์และความประณีตในการทำงาน

## การเงิน & ทรัพย์สิน
โชคลาภการเงินหมุนเวียนดี มีเกณฑ์ได้ทรัพย์สินก้อนโตหรืออสังหาริมทรัพย์เมื่อผ่านช่วงกลางคน

## ความรัก & ครอบครัว
คู่ครองช่วยส่งเสริมดวงชะตา มีความเข้าใจและเกื้อกูลกันในยามยุ่งยาก

> **สารสั้นเตือนใจประจำชะตาชีวิต:** "ยึดมั่นในสติและความดี ความเพียรจะนำพาความสำเร็จและบารมีมาสู่ตัวคุณ"`;
}
