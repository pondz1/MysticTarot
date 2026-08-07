import type { ApiSettings, SavedReading } from '../../types';
import { requestAiCompletion } from './aiClient';

export async function analyzeNumerology(
  digitsStr: string,
  sumValue: number,
  sumTitle: string,
  pairsSummary: string,
  settings: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>
): Promise<string> {
  const systemPrompt = `คุณคือปรมาจารย์แห่งศาสตร์ถอดรหัสตัวเลขและเบอร์มงคล โปรดวิเคราะห์อิทธิพลของตัวเลขอย่างลึกซึ้ง แม่นยำ ทรงพลัง และให้ข้อคิดในการใช้ชีวิต (ใช้ภาษาไทยสละสลวย 100%)

โครงสร้างบทวิเคราะห์ในรูปแบบ Markdown (ใช้หัวข้อ ##):
## 🔢 พลังงานรวมของชุดตัวเลข (ผลรวม ${sumValue}: ${sumTitle})
(วิเคราะห์อิทธิพลโดยรวมของผลรวม และพลังงานหลักที่ส่งผลต่อเจ้าของเลข)

## 💼 อิทธิพลต่อการงาน & ธุรกิจ
(วิเคราะห์ว่าคู่เลขในชุดนี้ส่งเสริมงาน การค้า หรือตำแหน่งหน้าที่อย่างไร)

## 💰 อิทธิพลต่อการเงิน & โชคลาภ
(วิเคราะห์สภาพคล่อง การหมุนเงิน ลาภลอย หรือการดึงดูดทรัพย์)

## ❤️ อิทธิพลต่อเสน่ห์ & ความสัมพันธ์
(วิเคราะห์มิตรภาพ เสน่ห์ ผู้ใหญ่อุปถัมภ์ และความรัก)

> 💡 **ข้อแนะนำการใช้พลังงานตัวเลข:** (ข้อคิดสะกิดใจสร้างเสริมบารมี)`;

  const userPrompt = `โปรดวิเคราะห์ชุดตัวเลข "${digitsStr}" ซึ่งมีผลรวม ${sumValue} (${sumTitle}) และมีคู่เลขสำคัญ ได้แก่: ${pairsSummary}`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, settings, onChunk, historyEntry);
    if (content && content.trim()) {
      return content;
    }
    return generateFallbackNumerology(digitsStr, sumValue, sumTitle);
  } catch (error: any) {
    console.error('Failed Numerology AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ถอดรหัสตัวเลขได้ในขณะนี้');
  }
}

export function generateFallbackNumerology(inputNumber: string, sumValue: number, sumTitle: string): string {
  return `## ภาพรวมพลังงานแห่งตัวเลข: ${inputNumber} (ผลรวม ${sumValue})
ผลรวมตัวเลข **${sumValue}** นับเป็นชุดเลขพลังงานมงคลสูง (${sumTitle}) ช่วยส่งเสริมพลังชีวิตให้มีความก้าวหน้าและสมดุล

## การงาน & สติปัญญา
ส่งเสริมไหวพริบ ความคิดสร้างสรรค์ มีผู้ใหญ่อุปถัมภ์ค้ำชูในการทำงาน การเจรจาต่อรองประสบความสำเร็จ

## การเงิน & โชคลาภ
การเงินไหลเวียนคล่องตัว มีโชคลาภเข้ามาต่อเนื่อง เหมาะแก่การลงทุนค้าขายและขยายกิจการ

## ความรัก & เมตตามหานิยม
มีเสน่ห์ดึงดูดผู้คน ได้รับความเอ็นดูและความเมตตาจากมิตรสหายและคนใกล้ชิด

> **คำแนะนำมงคล:** ตัวเลขคือพลังหนุนนำ สติและการลงมือทำคือคีย์สำคัญสู่ความสำเร็จอย่างยั่งยืน`;
}
