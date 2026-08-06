import type { ApiSettings } from '../../features/tarot/types/tarot';
import { requestAiCompletion } from './aiClient';

export async function analyzeNumerology(
  inputNumber: string,
  sumValue: number,
  sumTitle: string,
  pairsSummary: string,
  settings: ApiSettings,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = `คุณคือปรมาจารย์ผู้เชี่ยวชาญศาสตร์แห่งตัวเลขและเบอร์มงคล (Celestial Master Numerologist) มีสติปัญญา ลึกซึ้ง และทำนายภาษาไทยสละสลวย 100% (ห้ามใส่ Emoji ใดๆ ในหัวข้อ Heading)`;
  const userPrompt = `โปรดทำนายวิเคราะห์เชิงลึกสำหรับตัวเลข "${inputNumber}"
- ผลรวมตัวเลข: ${sumValue} (${sumTitle})
- สรุปคู่เลขย่อย: ${pairsSummary}

โปรดจัดทำโครงสร้างบทวิเคราะห์ Markdown สละสลวยดังนี้ (ห้ามใส่ Emoji ในหัวข้อ ##):
## ภาพรวมพลังงานและอิทธิพลแห่งตัวเลข (${inputNumber})
(วิเคราะห์พลังรวม สถิตตัวเลข และแรงดึงดูดชีวิต)

## พลังเสริมดวงการงาน & สติปัญญา
(วิเคราะห์อิทธิพลต่อการทำงาน การบริหาร และวิชาการ)

## พลังเสริมดวงการเงิน & โชคลาภ
(วิเคราะห์การไหลเวียนเงินทอง โชคลาภ และความมั่งคั่ง)

## พลังเสริมดวงความรัก & เมตตามหานิยม
(วิเคราะห์เสน่ห์ ความรัก และการเอ็นดูจากผู้คน)

> **ข้อคิดคำแนะนำมงคลประจำชุดตัวเลขนี้**`;

  try {
    const content = await requestAiCompletion(systemPrompt, userPrompt, settings, onChunk);
    if (content && content.trim()) {
      return content;
    }
    return generateFallbackNumerology(inputNumber, sumValue, sumTitle);
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
