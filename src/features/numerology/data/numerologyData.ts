import type { PairNumberAnalysis, NumerologySumMeaning } from '../types/numerology';

export const NUMEROLOGY_SUM_MAP: Record<number, NumerologySumMeaning> = {
  36: {
    sum: 36,
    grade: 'A+',
    title: 'เลขคู่อภิมหาโชค เสน่ห์และการเงินดึงดูดทรัพย์',
    description: 'ผลรวมแห่งมหาเสน่ห์และความสำเร็จอย่างสูง การเงินไหลมาเทมา ได้รับความเมตตาเอ็นดูจากผู้ใหญ่และมิตรบริวาร',
    auspiciousFor: ['การค้าขาย', 'ธุรกิจบันเทิง', 'การเจรจาต่อรอง', 'ความรักสมหวัง'],
  },
  41: {
    sum: 41,
    grade: 'A+',
    title: 'เลขมหาจักรพรรดิแห่งสติปัญญาและโชคลาภ',
    description: 'ส่งเสริมสติปัญญาไหวพริบ ความคิดสร้างสรรค์ งานด้านวิชาการ สื่อสารมวลชน หรือธุรกิจต่างประเทศ ร่ำรวยยั่งยืน',
    auspiciousFor: ['นักคิดนักเขียน', 'นักธุรกิจ', 'การติดต่อต่างประเทศ', 'งานสอบแข่งขัน'],
  },
  42: {
    sum: 42,
    grade: 'A+',
    title: 'เลขดวงดาวแห่งมหาเสน่ห์โชคลาภ',
    description: 'ดึงดูดโชคลาภ สิ่งดีๆ และผู้คนให้หลงรักเมตตา การเงินไม่ขาดมือ ความรักสดใสหวานชื่น',
    auspiciousFor: ['นักแสดง', 'ครีเอเตอร์', 'งานบริการ', 'ธุรกิจความงาม'],
  },
  45: {
    sum: 45,
    grade: 'A+',
    title: 'เลขเทพอุ้มชู ผู้ใหญ่เมตตา ประสบความสำเร็จสูง',
    description: 'มีเกตุและดาวพฤหัสส่งเสริม มีสิ่งศักดิ์สิทธิ์คุ้มครอง ผู้ใหญ่ให้ความไว้วางใจ ทำกิจการใดก็ราบรื่นไร้อุปสรรค',
    auspiciousFor: ['ข้าราชการ', 'ผู้บริหาร', 'นักลงทุน', 'การศึกษา'],
  },
  51: {
    sum: 51,
    grade: 'A+',
    title: 'เลขแห่งความสุข สมหวัง และความเจริญรุ่งเรือง',
    description: 'มีมิตรแท้รอบด้าน ชีวิตเต็มไปด้วยความสมบูรณ์พูนสุขทั้งการงาน การเงิน และครอบครัว',
    auspiciousFor: ['เจ้าของกิจการ', 'ครอบครัว', 'งานบริการ', 'อสังหาริมทรัพย์'],
  },
  54: {
    sum: 54,
    grade: 'A+',
    title: 'เลขมหาเศรษฐี สติปัญญาและทรัพย์สินมหาศาล',
    description: 'รวมพลังดาวพฤหัสและดาวพุธ เด่นเรื่องปัญญา การบริหารจัดการเงิน ทรัพย์สินเพิ่มพูนรวดเร็ว',
    auspiciousFor: ['การเงินการธนาคาร', 'นักลงทุน', 'ผู้จัดการ', 'สตาร์ทอัพ'],
  },
  56: {
    sum: 56,
    grade: 'A+',
    title: 'เลขแห่งความขยัน มหาโชคเงินล้าน',
    description: 'หยิบจับอะไรก็เป็นเงินเป็นทอง มีความขยันและโชคลาภสนับสนุนควบคู่กันเสมอ',
    auspiciousFor: ['การค้าออนไลน์', 'ฟรีแลนซ์', 'การขายตรง', 'นักลงทุน'],
  },
  63: {
    sum: 63,
    grade: 'A+',
    title: 'เลขมหาเสน่ห์ ความรักสดใส การเงินสะพัด',
    description: 'มีเสน่ห์ดึงดูดความรักที่ดี เงินทองไหลมาไม่ขาดสาย เหมาะกับงานที่ต้องเจอผู้คน',
    auspiciousFor: ['งานบริการ', 'อินฟลูเอนเซอร์', 'เซลส์ขายของ', 'ความรัก'],
  },
  65: {
    sum: 65,
    grade: 'A+',
    title: 'เลขแห่งความมั่นคงและโชคลาภทับคูณ',
    description: 'การเงินมั่นคง มีโชคลาภเข้ามาต่อเนื่อง ความรักราบรื่นและมีผู้ใหญ่อุปถัมภ์',
    auspiciousFor: ['การลงทุนระยะยาว', 'ธุรกิจครอบครัว', 'การวางแผนการเงิน'],
  },
};

export const COMMON_PAIR_ANALYSIS: Record<string, PairNumberAnalysis> = {
  '36': { pair: '36', meaning: 'เสน่ห์แรง การเงินดีเยี่ยม มีโชคจากการเจรจา', category: 'wealth', score: 10 },
  '63': { pair: '63', meaning: 'การเงินไหลลื่น ความรักสดใส มีเสน่ห์มหาเสน่ห์', category: 'love', score: 10 },
  '45': { pair: '45', meaning: 'สติปัญญาดี ผู้ใหญ่อุปถัมภ์ งานราบรื่น', category: 'work', score: 10 },
  '54': { pair: '54', meaning: 'ฉลาดรอบคอบ บริหารเงินเก่ง ความน่าเชื่อถือสูง', category: 'work', score: 10 },
  '56': { pair: '56', meaning: 'โชคลาภทางการเงิน ขยันแล้วรวยเร็ว', category: 'wealth', score: 10 },
  '65': { pair: '65', meaning: 'คู่ทรัพย์คู่โชค เงินทองไม่ขาดมือ มีความสุข', category: 'wealth', score: 10 },
  '15': { pair: '15', meaning: 'ผู้ใหญ่เมตตา มีเสน่ห์ในงานเกียรติยศ', category: 'charm', score: 9 },
  '51': { pair: '51', meaning: 'มิตรภาพดี มีที่ปรึกษาช่วยสำเร็จ', category: 'work', score: 9 },
  '24': { pair: '24', meaning: 'มีเสน่ห์ ปากหวาน คนรักเอ็นดู งานขายดีมาก', category: 'charm', score: 9 },
  '42': { pair: '42', meaning: 'มิตรสหายรัก เมตตามหานิยม เงินทองคล่องมือ', category: 'charm', score: 9 },
  '78': { pair: '78', meaning: 'สติปัญญาหาเงินเก่ง ใจใหญ่ มีพรรคพวกบริวาร', category: 'wealth', score: 8 },
  '87': { pair: '87', meaning: 'กว้างขวาง มีโชคเสี่ยงดวง ธุรกิจเติบโตรวดเร็ว', category: 'wealth', score: 8 },
};

export function analyzePhoneNumber(phone: string) {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 9) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < clean.length; i++) {
    sum += parseInt(clean[i], 10);
  }

  // Calculate digit pairs
  const pairs: PairNumberAnalysis[] = [];
  for (let i = 0; i < clean.length - 1; i++) {
    const pairStr = clean.slice(i, i + 2);
    if (COMMON_PAIR_ANALYSIS[pairStr]) {
      pairs.push(COMMON_PAIR_ANALYSIS[pairStr]);
    } else {
      pairs.push({
        pair: pairStr,
        meaning: `คู่เลข ${pairStr} เสริมพลังงานชีวิตและผลรวมเบอร์`,
        category: 'work',
        score: 7,
      });
    }
  }

  const sumInfo = NUMEROLOGY_SUM_MAP[sum] || {
    sum,
    grade: sum % 2 === 0 ? 'A' : 'B',
    title: `ผลรวม ${sum} เลขมงคลเสริมพลังชีวิต`,
    description: `ผลรวม ${sum} ช่วยหนุนนำดวงชะตา เพิ่มพลังสร้างสรรค์และความสมดุลในชีวิตประจำวัน`,
    auspiciousFor: ['งานทั่วไป', 'ความสัมพันธ์', 'โชคลาภ'],
  };

  return {
    inputNumber: phone,
    cleanDigits: clean,
    sumValue: sum,
    sumMeaning: sumInfo,
    pairAnalyses: pairs,
    overallGrade: sumInfo.grade,
    summaryText: sumInfo.description,
  };
}
