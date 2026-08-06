import type { ApiSettings } from '../../features/tarot/types/tarot';
import { getOpenAIClient, cleanAiResponse } from './aiClient';

export async function analyzeThaiLifeGraph(
  birthDate: string,
  dayOfWeekTh: string,
  elementTh: string,
  peakAgeRange: string,
  summaryGuidance: string,
  settings?: ApiSettings
): Promise<string> {
  const client = getOpenAIClient(settings);
  if (!client) {
    return generateFallbackThaiLifeGraph(birthDate, dayOfWeekTh, peakAgeRange, summaryGuidance);
  }

  const systemPrompt = `คุณคือโหราจารย์ผู้เชี่ยวชาญศาสตร์โหราศาสตร์ไทยโบราณและคำนวณกราฟชีวิต 9 ช่วงอายุ โปรดวิเคราะห์ดวงชะตากราฟชีวิตอย่างลึกซึ้ง มีเสน่ห์ ทรงพลัง และให้สติปัญญาในการดำเนินชีวิต

โครงสร้างคำทำนายในรูปแบบ Markdown:
# ดวงชะตากราฟชีวิต: ผู้เกิด${dayOfWeekTh} (${elementTh})
(เกริ่นนำลักษณะนิสัย พลังงานประจำวันเกิด และเส้นทางดวงชะตา)

## จังหวะกราฟชีวิต & ช่วงพีคสูงสุด
(วิเคราะห์ช่วงอายุ ${peakAgeRange} และการตักตักสร้างเนื้อสร้างตัว)

## การงาน & เกียรติยศ
(ทิศทางหน้าที่การงาน ธุรกิจ และผู้ใหญ่อุปถัมภ์)

## การเงิน & ทรัพย์สิน
(การหมุนเวียนเงินทอง การลงทุน และอสังหาริมทรัพย์)

## ความรัก & ครอบครัว
(ความสัมพันธ์ คู่ครอง และความสมบูรณ์ในครอบครัว)

> **สารสั้นเตือนใจประจำชะตาชีวิต:** (ข้อคิดและแนวทางสร้างบารมี)`;

  const userPrompt = `ข้อมูลชะตาชีวิต:
- วันเกิด: ${birthDate} (ตรงกับ${dayOfWeekTh}, ธาตุประจำตัว: ${elementTh})
- ช่วงอายุพุ่งสูงสุด: ${peakAgeRange}
- คำแนะนำภาพรวม: ${summaryGuidance}`;

  try {
    const completion = await client.chat.completions.create({
      model: settings?.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content && content.trim()) {
      return cleanAiResponse(content);
    }
    return generateFallbackThaiLifeGraph(birthDate, dayOfWeekTh, peakAgeRange, summaryGuidance);
  } catch (error) {
    console.error('Failed Thai Life Graph AI call:', error);
    return generateFallbackThaiLifeGraph(birthDate, dayOfWeekTh, peakAgeRange, summaryGuidance);
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
