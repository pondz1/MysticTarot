/**
 * Shared Markdown output contract for every AI divination module.
 * Keep aligned with client/src/services/ai/markdownFormat.ts
 */

export function buildMasterDirectives(domainRules: string[]): string {
  const numbered = domainRules
    .map((rule, i) => `${i + 3}. ${rule}`)
    .join('\n\n');

  return `📜 **กฎและข้อบังคับในการทำนาย (Strict Response Directives)**:
1. **ภาษาไทยสละสลวย 100% (High-Quality Thai Only)**:
   - ใช้ภาษาไทยระดับสละสลวย งดงาม นุ่มนวล มีพลังน่าเลื่อมใส ห้ามใช้คำแปลแปลกๆ จากภาษาอังกฤษ หรือคำพูดทื่อๆ แบบหุ่นยนต์
   - สะท้อนความเข้าใจในอารมณ์ความรู้สึกของผู้ถามอย่างเมตตา (Empathetic & Insightful)

2. **ตอบตรงประเด็น (Direct & Clear Answer)**:
   - ให้คำตอบที่ชัดเจน ตรงกับสิ่งที่อยากรู้ ไม่คลุมเครือหรือหลบหลีก ไม่รับประกันผลลัพธ์แน่นอนเกินจริง

${numbered}

${domainRules.length + 3}. **การจัดรูปแบบผลทำนาย**:
   - ทำตาม **รูปแบบผลลัพธ์มาตรฐานของเว็บ** ด้านล่างเป๊ะ (markdown เดียวกันทุกศาสตร์)
   - ใช้ชื่อหัวข้อ ## ตามโครงสร้างที่กำหนดเท่านั้น ห้ามย่อหรือเปลี่ยนชื่อ`.trim();
}

export const MARKDOWN_OUTPUT_RULES = `
## รูปแบบผลลัพธ์ (บังคับ — ใช้เหมือนกันทุกคำทำนาย)

1. ใช้ Markdown เท่านั้น ห้าม HTML
2. หัวข้อหลักใช้ ## เท่านั้น (ห้าม # h1) — ไม่เกิน 6 หัวข้อหลัก
3. หัวข้อย่อยใช้ ### เฉพาะเมื่อต้องแยกรายการ (เช่น ไพ่ทีละใบ) ห้ามซ้อน ####
4. ชื่อหัวข้อเป็นภาษาไทยชัดเจน ใส่คำสำคัญเหล่านี้เมื่อเกี่ยวข้อง:
   - "ภาพรวม" สำหรับเกริ่นเปิด
   - "การงาน" สำหรับงาน/ธุรกิจ/เรียน
   - "การเงิน" สำหรับเงิน/โชคลาภ
   - "ความรัก" สำหรับความสัมพันธ์/เสน่ห์
   - "ระวัง" หรือ "หลีกเลี่ยง" สำหรับข้อห้าม/ความเสี่ยง
   - "คำแนะนำ" สำหรับสรุป actionable
5. ห้ามใส่ emoji นำหน้าหัวข้อ (UI ใส่ไอคอนให้แล้ว)
6. ย่อหน้าสั้นอ่านง่าย ละ 2–4 ประโยคต่อหัวข้อหลัก
7. ใช้ **ตัวหนา** กับชื่อเฉพาะ คำฟันธง หรือตัวเลขสำคัญเท่านั้น
8. ใช้ bullet (-) เมื่อเป็นรายการ 2 รายการขึ้นไป ห้ามใช้ bullet ทั้งย่อหน้า
9. ปิดท้ายด้วย blockquote หนึ่งบล็อกเท่านั้น:
   > **คำแนะนำสั้น:** …
10. ห้ามเปิดด้วยคำทักทาย/ขอโทษ/อธิบายว่าคุณเป็น AI ห้ามสรุปกฎ prompt กลับมา
11. ภาษาไทยสละสลวย อ่านง่าย อบอุ่น ตรงประเด็น ไม่เว่อร์เกินจริง ไม่ขู่เกินเหตุ
`.trim();

export type PredictionSection = {
  heading: string;
  guide: string;
};

export function buildStructureBlock(sections: PredictionSection[]): string {
  const lines = sections.map((s) => `## ${s.heading}\n(${s.guide})`);
  return [
    'โครงสร้างบทวิเคราะห์ (ต้องเรียงตามนี้ ครบทุกหัวข้อ):',
    ...lines,
    '',
    '> **คำแนะนำสั้น:** (1–2 ประโยค ข้อคิดหรือ action ที่นำไปใช้ได้ทันที)',
  ].join('\n\n');
}

export function lifeAspectSections(options?: {
  overviewHeading?: string;
  overviewGuide?: string;
  workGuide?: string;
  moneyGuide?: string;
  loveGuide?: string;
  adviceHeading?: string;
  adviceGuide?: string;
}): PredictionSection[] {
  return [
    {
      heading: options?.overviewHeading ?? 'ภาพรวมพลังงาน',
      guide: options?.overviewGuide ?? 'สรุปภาพรวมสถานการณ์และโทนพลังงานหลัก 2–4 ประโยค',
    },
    {
      heading: 'การงานและการเรียน',
      guide: options?.workGuide ?? 'ทิศทางงาน ธุรกิจ การศึกษา โอกาสและอุปสรรค',
    },
    {
      heading: 'การเงินและโชคลาภ',
      guide: options?.moneyGuide ?? 'สภาพคล่อง โชคลาภ การใช้จ่ายและการเก็บออม',
    },
    {
      heading: 'ความรักและความสัมพันธ์',
      guide: options?.loveGuide ?? 'ความสัมพันธ์ คนมีคู่/คนโสด เสน่ห์และมิตรภาพ',
    },
    {
      heading: options?.adviceHeading ?? 'คำแนะนำ',
      guide: options?.adviceGuide ?? 'ข้อแนะนำปฏิบัติได้จริง 2–4 ข้อแบบ bullet',
    },
  ];
}
