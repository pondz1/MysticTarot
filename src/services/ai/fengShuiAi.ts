import type { ApiSettings } from '../../features/tarot/types/tarot';
import { getOpenAIClient, cleanAiResponse } from './aiClient';

export async function analyzeFengShui(
  dayNameTh: string,
  luckyWork: string,
  luckyWealth: string,
  luckyLove: string,
  unluckyForbidden: string,
  spaceType: string = 'ภาพรวมที่อยู่อาศัย & โต๊ะทำงาน',
  settings?: ApiSettings
): Promise<string> {
  const client = getOpenAIClient(settings);
  if (!client) {
    return generateFallbackFengShui(dayNameTh, luckyWork, luckyWealth, luckyLove, unluckyForbidden, spaceType);
  }

  const systemPrompt = `คุณคือซินแสผู้เชี่ยวชาญศาสตร์ฮวงจุ้ยและการปรับพลังงานเบญจธาตุระดับสูง โปรดให้คำแนะนำการแต่งกายสีมงคล ทิศรับทรัพย์ และการจัดวางพื้นที่ (${spaceType}) ในรูปแบบ Markdown (ห้ามใช้อิโมจิ)

โครงสร้างคำทำนายในรูปแบบ Markdown:
# วิเคราะห์ฮวงจุ้ย & พลังงานมงคลประจำ${dayNameTh}
(เกริ่นนำพลังงานธาตุประจำวันและการเปิดรับโชคลาภ)

## สีเสื้อมงคลเสริมพลังชีวิต
(วิเคราะห์การเลือกแต่งกายด้วยสีมงคลในแต่ละด้าน)

## การจัดฮวงจุ้ยพื้นที่ (${spaceType})
(เคล็ดลับการจัดวางทิศทาง แสงสว่าง และวัตถุมงคลรับทรัพย์)

## ข้อควรระวัง & สีต้องห้าม
(เตือนสติเรื่องสีต้องห้าม ${unluckyForbidden} และจุดอับพลังงานที่ควรแก้ไข)

> **เคล็ดลับซินแสประจำวัน:** (ข้อคิดปรับสมดุลชีวิตและจิตใจ)`;

  const userPrompt = `ข้อมูลฮวงจุ้ยประจำ${dayNameTh}:
- สีเสริมการงาน: ${luckyWork}
- สีเสริมการเงินโชคลาภ: ${luckyWealth}
- สีเสริมความรักเมตตา: ${luckyLove}
- สีต้องห้าม/ฉุดดวง: ${unluckyForbidden}
- พื้นที่ที่ต้องการจัดฮวงจุ้ย: ${spaceType}`;

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
    return generateFallbackFengShui(dayNameTh, luckyWork, luckyWealth, luckyLove, unluckyForbidden, spaceType);
  } catch (error) {
    console.error('Failed Feng Shui AI call:', error);
    return generateFallbackFengShui(dayNameTh, luckyWork, luckyWealth, luckyLove, unluckyForbidden, spaceType);
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
