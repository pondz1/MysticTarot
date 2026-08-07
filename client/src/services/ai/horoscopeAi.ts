import type { ApiSettings, SavedReading } from '../../types';
import { requestModuleAiCompletion } from './aiClient';
import {
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  buildMasterDirectives,
  lifeAspectSections,
  buildFallbackMarkdown,
} from './markdownFormat';

function buildLocalPrompts(
  signNameTh: string,
  elementTh: string,
  timeframe: 'daily' | 'monthly'
): { systemPrompt: string; userPrompt: string } {
  const period = timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน';

  const structure = buildStructureBlock(
    lifeAspectSections({
      overviewHeading: 'ภาพรวมพลังงานดวงชะตา',
      overviewGuide: `สรุปพลังงานราศี${signNameTh} ธาตุ${elementTh} ช่วง${period} อย่างมีมิติ อย่างน้อย 1 ย่อหน้า`,
      workGuide: 'ทิศทางงาน ธุรกิจ การศึกษา โอกาสและอุปสรรค วิเคราะห์เชิงลึก',
      moneyGuide: 'สภาพคล่อง โชคลาภ การใช้จ่ายและการเก็บออม',
      loveGuide: 'ความสัมพันธ์ คนมีคู่/คนโสด เสน่ห์และมิตรภาพ',
      adviceHeading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
      adviceGuide: 'ข้อแนะนำปฏิบัติได้จริง 3–5 ข้อแบบ bullet',
    })
  );

  const directives = buildMasterDirectives([
    `**วิเคราะห์ตามราศีและธาตุ (Zodiac Synthesis)**:
   - อิงราศี **${signNameTh}** ธาตุ **${elementTh}** และช่วง **${period}** เป็นหลัก
   - ร้อยเรียงงาน เงิน รัก ให้เป็นภาพชีวิตเดียวกัน ไม่แยกขาดจากกัน`,
    `**สติและความรับผิดชอบ (Wise Counsel)**:
   - ไม่ขู่เกินเหตุ ไม่รับประกันโชคลาภแน่นอน
   - ให้สติปัญญาและทางเลือกที่ผู้ใช้นำไปปรับใช้ได้`,
  ]);

  return {
    systemPrompt: `คุณคือ "หมอดูโหราศาสตร์ 12 ราศี AI ระดับปรมาจารย์ (Celestial Master Zodiac Prophet)" ผู้หยั่งรู้ดวงดาว อบอุ่น ทรงพลัง มีความเมตตา และเปี่ยมด้วยปัญญาแห่งจักรวาล

${directives}

${MARKDOWN_OUTPUT_RULES}

📌 **โครงสร้างผลทำนายมาตรฐาน (Zodiac)**:
${structure}`,
    userPrompt: `โปรดทำนายดวง${period} ของราศี "${signNameTh}" (ธาตุ ${elementTh}) ตามบทบาทหมอดูปรมาจารย์และโครงสร้าง markdown ที่กำหนด ให้ละเอียด นุ่มนวล และตรงประเด็น`,
  };
}

export async function analyzeZodiacHoroscope(
  signNameTh: string,
  elementTh: string,
  timeframe: 'daily' | 'monthly',
  settings: ApiSettings,
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  try {
    const content = await requestModuleAiCompletion(
      'horoscope',
      { signNameTh, elementTh, timeframe },
      settings,
      onChunk,
      historyEntry,
      signal,
      buildLocalPrompts(signNameTh, elementTh, timeframe)
    );
    if (content && content.trim()) return content;
    throw new Error('ไม่สามารถประมวลผลคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.error('Failed Zodiac AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ดูดวงราศีได้ในขณะนี้');
  }
}

export function generateFallbackZodiacHoroscope(
  signNameTh: string,
  timeframe: 'daily' | 'monthly'
): string {
  const period = timeframe === 'daily' ? 'วันนี้' : 'เดือนนี้';
  return buildFallbackMarkdown(
    [
      {
        heading: 'ภาพรวมพลังงานดวงชะตา',
        body: `ชาวราศี${signNameTh}ในช่วง${period} มีพลังงานเหมาะกับการวางแผนและลงมือทำอย่างมีสติ อารมณ์และความคิดเฉียบคมขึ้น ใช้จังหวะนี้จัดลำดับความสำคัญ`,
      },
      {
        heading: 'การงานและการเรียน',
        body: 'งานและการเรียนไปได้ราบรื่น มีโอกาสได้แสดงศักยภาพ เหมาะกับการเจรจา วางแผน และปิดงานที่ค้างคา',
      },
      {
        heading: 'การเงินและโชคลาภ',
        body: 'สภาพคล่องอยู่ในเกณฑ์ดี มีโอกาสจากผลงานที่ทำไว้ ควรเก็บออมสำรองและเลี่ยงรายจ่ายฟุ่มเฟือย',
      },
      {
        heading: 'ความรักและความสัมพันธ์',
        body: 'คนมีคู่เข้าใจกันดีขึ้น คนโสดมีเสน่ห์ดึงดูด มิตรภาพใหม่ๆ อาจเข้ามาอย่างเป็นธรรมชาติ',
      },
      {
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: '- จัดลำดับงานสำคัญก่อน\n- ดูแลสุขภาพและพักผ่อนให้พอ\n- สื่อสารตรงไปตรงมาด้วยความสุภาพ',
      },
    ],
    'ยึดสติและความสม่ำเสมอ — ความก้าวหน้าจะตามมาเอง'
  );
}
