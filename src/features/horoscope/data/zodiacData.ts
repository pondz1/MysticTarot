import type { ZodiacSign, ElementType } from '../types/horoscope';

export interface ElementStyle {
  bg: string;
  activeBg: string;
  border: string;
  activeBorder: string;
  text: string;
  badgeBg: string;
  glow: string;
}

export const ELEMENT_STYLE_MAP: Record<ElementType, ElementStyle> = {
  fire: {
    bg: 'bg-amber-950/30 hover:bg-amber-900/40',
    activeBg: 'bg-gradient-to-b from-amber-500/30 to-red-950/60',
    border: 'border-amber-500/40 hover:border-amber-400',
    activeBorder: 'border-amber-400 shadow-amber-500/20',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    glow: 'shadow-amber-500/20',
  },
  water: {
    bg: 'bg-cyan-950/30 hover:bg-cyan-900/40',
    activeBg: 'bg-gradient-to-b from-cyan-500/30 to-blue-950/60',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    activeBorder: 'border-cyan-400 shadow-cyan-500/20',
    text: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
    glow: 'shadow-cyan-500/20',
  },
  air: {
    bg: 'bg-purple-950/30 hover:bg-purple-900/40',
    activeBg: 'bg-gradient-to-b from-purple-500/30 to-indigo-950/60',
    border: 'border-purple-500/40 hover:border-purple-400',
    activeBorder: 'border-purple-400 shadow-purple-500/20',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
    glow: 'shadow-purple-500/20',
  },
  earth: {
    bg: 'bg-emerald-950/30 hover:bg-emerald-900/40',
    activeBg: 'bg-gradient-to-b from-emerald-500/30 to-teal-950/60',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    activeBorder: 'border-emerald-400 shadow-emerald-500/20',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
    glow: 'shadow-emerald-500/20',
  },
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    nameTh: 'ราศีเมษ',
    nameEn: 'Aries',
    symbol: '♈',
    dateRange: '13 เม.ย. - 13 พ.ค.',
    element: 'fire',
    elementTh: 'ธาตุไฟ',
    rulingPlanet: 'ดาวอังคาร',
    traits: ['กล้าหาญ', 'มีภาวะผู้นำ', 'กระตือรือร้น', 'ตรงไปตรงมา'],
    luckyNumber: [1, 9, 8],
    luckyColor: ['สีแดงเข้ม', 'สีส้มสด'],
    description: 'ชาวราศีเมษผู้เปี่ยมด้วยพลังแห่งการเริ่มต้น ความมุ่งมั่นอันไร้ขีดจำกัด และความเป็นผู้นำตามธรรมชาติ',
  },
  {
    id: 'taurus',
    nameTh: 'ราศีพฤษภ',
    nameEn: 'Taurus',
    symbol: '♉',
    dateRange: '14 พ.ค. - 13 มิ.ย.',
    element: 'earth',
    elementTh: 'ธาตุดิน',
    rulingPlanet: 'ดาวศุกร์',
    traits: ['มั่นคง', 'อดทน', 'ประณีต', 'รักความสงบ'],
    luckyNumber: [6, 4, 2],
    luckyColor: ['สีเขียวมรกต', 'สีชมพูอ่อน'],
    description: 'ชาวราศีพฤษภผู้รักความสงบสุข ความมั่นคงในชีวิต และมีความสุนทรีย์ในการดื่มด่ำความสวยงาม',
  },
  {
    id: 'gemini',
    nameTh: 'ราศีเมถุน',
    nameEn: 'Gemini',
    symbol: '♊',
    dateRange: '14 มิ.ย. - 14 ก.ค.',
    element: 'air',
    elementTh: 'ธาตุลม',
    rulingPlanet: 'ดาวพุธ',
    traits: ['เฉลียวฉลาด', 'สื่อสารเก่ง', 'ยืดหยุ่น', 'ปรับตัวไว'],
    luckyNumber: [5, 3, 7],
    luckyColor: ['สีเหลืองสดใส', 'สีฟ้าอ่อน'],
    description: 'ชาวราศีเมถุนผู้เต็มไปด้วยไอเดียสร้างสรรค์ ไหวพริบปฏิภาณ และความสามารถในการปรับตัวเข้ากับทุกสถานการณ์',
  },
  {
    id: 'cancer',
    nameTh: 'ราศีกรกฎ',
    nameEn: 'Cancer',
    symbol: '♋',
    dateRange: '15 ก.ค. - 16 ส.ค.',
    element: 'water',
    elementTh: 'ธาตุน้ำ',
    rulingPlanet: 'ดวงจันทร์',
    traits: ['อ่อนโยน', 'มีสัญชาตญาณสูง', 'ใส่ใจ', 'อบอุ่น'],
    luckyNumber: [2, 7, 9],
    luckyColor: ['สีขาวมุก', 'สีเงิน'],
    description: 'ชาวราศีกรกฎผู้มีจิตวิญญาณอันอบอุ่น ลึกซึ้ง และสัญชาตญาณสัมผัสที่แม่นยำในการดูแลคนรอบข้าง',
  },
  {
    id: 'leo',
    nameTh: 'ราศีสิงห์',
    nameEn: 'Leo',
    symbol: '♌',
    dateRange: '17 ส.ค. - 16 ก.ย.',
    element: 'fire',
    elementTh: 'ธาตุไฟ',
    rulingPlanet: 'ดวงอาทิตย์',
    traits: ['สง่างาม', 'ใจกว้าง', 'มีเสน่ห์', 'ความเชื่อมั่นสูง'],
    luckyNumber: [1, 5, 9],
    luckyColor: ['สีทอง', 'สีส้มแสด'],
    description: 'ชาวราศีสิงห์ผู้เปล่งประกายรัศมีแห่งความโดดเด่น ใจกว้าง และมีพลังในการสร้างสรรค์สิ่งยิ่งใหญ่',
  },
  {
    id: 'virgo',
    nameTh: 'ราศีกันย์',
    nameEn: 'Virgo',
    symbol: '♍',
    dateRange: '17 ก.ย. - 16 ต.ค.',
    element: 'earth',
    elementTh: 'ธาตุดิน',
    rulingPlanet: 'ดาวพุธ',
    traits: ['ละเอียดรอบคอบ', 'มีระเบียบ', 'มีเหตุผล', 'พึ่งพาได้'],
    luckyNumber: [5, 6, 8],
    luckyColor: ['สีน้ำตาลครีม', 'สีเขียวใบไม้'],
    description: 'ชาวราศีกันย์ผู้พิถีพิถัน ใส่ใจรายละเอียด มีความคิดวิเคราะห์ที่เป็นระบบและทรงประสิทธิภาพ',
  },
  {
    id: 'libra',
    nameTh: 'ราศีตุลย์',
    nameEn: 'Libra',
    symbol: '♎',
    dateRange: '17 ต.ค. - 15 พ.ย.',
    element: 'air',
    elementTh: 'ธาตุลม',
    rulingPlanet: 'ดาวศุกร์',
    traits: ['ยุติธรรม', 'มีศิลปะ', 'มีเสน่ห์ดึงดูด', 'รักความสมดุล'],
    luckyNumber: [6, 3, 9],
    luckyColor: ['สีพาสเทล', 'สีน้ำเงินไพลิน'],
    description: 'ชาวราศีตุลย์ผู้แสวงหาความสมดุลและความงดงาม สดใส อ่อนโยน มีมนุษยสัมพันธ์อันยอดเยี่ยม',
  },
  {
    id: 'scorpio',
    nameTh: 'ราศีพิจิก',
    nameEn: 'Scorpio',
    symbol: '♏',
    dateRange: '16 พ.ย. - 15 ธ.ค.',
    element: 'water',
    elementTh: 'ธาตุน้ำ',
    rulingPlanet: 'ดาวอังคาร / ดาวพลูโต',
    traits: ['ลุ่มลึก', 'หยั่งรู้', 'มุ่งมั่นพยายาม', 'จริงใจ'],
    luckyNumber: [8, 3, 0],
    luckyColor: ['สีแดงไวน์', 'สีดำเงา'],
    description: 'ชาวราศีพิจิกผู้มีความลุ่มลึก น่าค้นหา พลังแห่งจิตวิญญาณอันเข้มแข็ง และความซื่อสัตย์จริงใจ',
  },
  {
    id: 'sagittarius',
    nameTh: 'ราศีธนู',
    nameEn: 'Sagittarius',
    symbol: '♐',
    dateRange: '16 ธ.ค. - 14 ม.ค.',
    element: 'fire',
    elementTh: 'ธาตุไฟ',
    rulingPlanet: 'ดาวพฤหัสบดี',
    traits: ['รักอิสระ', 'มองโลกในแง่ดี', 'ชอบเรียนรู้', 'จริงใจ'],
    luckyNumber: [9, 5, 4],
    luckyColor: ['สีม่วงคราม', 'สีเหลืองทอง'],
    description: 'ชาวราศีธนูผู้เปี่ยมด้วยปรัชญา วิสัยทัศน์กว้างไกล ความรักในอิสรภาพ และพลังงานบวก',
  },
  {
    id: 'capricorn',
    nameTh: 'ราศีมังกร',
    nameEn: 'Capricorn',
    symbol: '♑',
    dateRange: '15 ม.ค. - 12 ก.พ.',
    element: 'earth',
    elementTh: 'ธาตุดิน',
    rulingPlanet: 'ดาวเสาร์',
    traits: ['มีความรับผิดชอบ', 'ทะเยอทะยาน', 'อดทนสูง', 'เป็นผู้ใหญ่'],
    luckyNumber: [8, 7, 2],
    luckyColor: ['สีเทาควันบุหรี่', 'สีน้ำเงินเข้ม'],
    description: 'ชาวราศีมังกรผู้เป็นนักสู้ที่มั่นคง มีเป้าหมายชัดเจน ทะเยอทะยาน และประสบความสำเร็จอย่างยั่งยืน',
  },
  {
    id: 'aquarius',
    nameTh: 'ราศีกุมภ์',
    nameEn: 'Aquarius',
    symbol: '♒',
    dateRange: '13 ก.พ. - 14 มี.ค.',
    element: 'air',
    elementTh: 'ธาตุลม',
    rulingPlanet: 'ดาวราหู / ดาวมฤตยู',
    traits: ['สร้างสรรค์สิ่งใหม่', 'เป็นตัวของตัวเอง', 'ชอบช่วยเหลือ', 'วิสัยทัศน์ไกล'],
    luckyNumber: [7, 4, 1],
    luckyColor: ['สีฟ้าเทอร์ควอยซ์', 'สีนีออน'],
    description: 'ชาวราศีกุมภ์ผู้นำเทรนด์ยุคใหม่ มีความคิดสร้างสรรค์ที่เป็นเอกลักษณ์ และจิตวิญญาณแห่งความเอื้อเฟื้อ',
  },
  {
    id: 'pisces',
    nameTh: 'ราศีมีน',
    nameEn: 'Pisces',
    symbol: '♓',
    dateRange: '15 มี.ค. - 12 เม.ย.',
    element: 'water',
    elementTh: 'ธาตุน้ำ',
    rulingPlanet: 'ดาวพฤหัสบดี / ดาวเนปจูน',
    traits: ['จินตนาการล้ำเลิศ', 'เห็นอกเห็นใจ', 'อ่อนโยน', 'มีเซนส์พิเศษ'],
    luckyNumber: [2, 6, 9],
    luckyColor: ['สีเขียวทะเล', 'สีม่วงอ่อน'],
    description: 'ชาวราศีมีนผู้เปี่ยมด้วยจินตนาการ ความเห็นอกเห็นใจลึกซึ้ง และจิตสัมผัสอันอ่อนโยนจากจักรวาล',
  },
];

export function getZodiacClassicPrediction(sign: ZodiacSign, timeframe: 'daily' | 'monthly'): string {
  const isDaily = timeframe === 'daily';
  return `📜 **คำทำนายคลาสสิก ${sign.nameTh} (${isDaily ? 'ประจำวัน' : 'รายเดือน'})**

🔮 **ภาพรวมพลังงานดวงชะตา:**
${sign.description} จังหวะชีวิตใน${isDaily ? 'วันนี้' : 'เดือนนี้'} มีพลังแห่งดาวประจำราศี (${sign.rulingPlanet}) และอิทธิพลธาตุ (${sign.elementTh}) โดดเด่นเป็นพิเศษ ส่งผลให้คุณมีพลังในการตัดสินใจและสร้างสรรค์สิ่งใหม่ๆ

💼 **การงานและการเรียน:**
สถานการณ์รอบตัวราบรื่น มีโอกาสได้แสดงศักยภาพโดดเด่น ผู้ใหญ่หรือเพื่อนร่วมงานให้ความไว้วางใจ เหมาะกับการวางแผนและลงมือทำโปรเจกต์สำคัญ

💰 **การเงินและโชคลาภ:**
สภาพคล่องการเงินอยู่ในเกณฑ์ดี มีโชคลาภจากการเจรจาหรือผลงานที่ทำไว้ เลขนำโชคของคุณคือ **${sign.luckyNumber.join(', ')}**

❤️ **ความรักและความสัมพันธ์:**
คนมีคู่มีความเข้าใจและเกื้อกูลกันดี คนโสดมีเสน่ห์ดึงดูดผู้คนรอบข้างโดยเฉพาะสีมงคล **${sign.luckyColor.join(' และ ')}**

🌟 **สาส์นเตือนใจ:**
"ยึดมั่นในสติและความดีงาม ก้าวเดินไปด้วยความมั่นใจ แล้วความสำเร็จจะปรากฏตรงหน้าคุณ"`;
}

export function getZodiacAspectScores(sign: ZodiacSign, timeframe: 'daily' | 'monthly') {
  const seed = (sign.id.charCodeAt(0) + (timeframe === 'daily' ? 12 : 25)) % 25;
  return {
    love: Math.min(98, Math.max(72, 80 + (seed * 3) % 18)),
    work: Math.min(99, Math.max(75, 82 + (seed * 5) % 17)),
    finance: Math.min(96, Math.max(70, 78 + (seed * 7) % 19)),
    health: Math.min(95, Math.max(74, 85 + (seed * 2) % 12)),
  };
}

export function findZodiacSignByBirthdate(month: number, day: number): ZodiacSign {
  // Month: 1-12, Day: 1-31
  if ((month === 4 && day >= 13) || (month === 5 && day <= 13)) return ZODIAC_SIGNS[0]; // Aries
  if ((month === 5 && day >= 14) || (month === 6 && day <= 13)) return ZODIAC_SIGNS[1]; // Taurus
  if ((month === 6 && day >= 14) || (month === 7 && day <= 14)) return ZODIAC_SIGNS[2]; // Gemini
  if ((month === 7 && day >= 15) || (month === 8 && day <= 16)) return ZODIAC_SIGNS[3]; // Cancer
  if ((month === 8 && day >= 17) || (month === 9 && day <= 16)) return ZODIAC_SIGNS[4]; // Leo
  if ((month === 9 && day >= 17) || (month === 10 && day <= 16)) return ZODIAC_SIGNS[5]; // Virgo
  if ((month === 10 && day >= 17) || (month === 11 && day <= 15)) return ZODIAC_SIGNS[6]; // Libra
  if ((month === 11 && day >= 16) || (month === 12 && day <= 15)) return ZODIAC_SIGNS[7]; // Scorpio
  if ((month === 12 && day >= 16) || (month === 1 && day <= 14)) return ZODIAC_SIGNS[8]; // Sagittarius
  if ((month === 1 && day >= 15) || (month === 2 && day <= 12)) return ZODIAC_SIGNS[9]; // Capricorn
  if ((month === 2 && day >= 13) || (month === 3 && day <= 14)) return ZODIAC_SIGNS[10]; // Aquarius
  return ZODIAC_SIGNS[11]; // Pisces
}
