import type { ThaiLifeChartResult, LifeStagePoint } from '../types/thaiAstrology';

export const DAYS_OF_WEEK = [
  { id: 'sun', nameTh: 'วันอาทิตย์', element: 'ไฟ', color: 'สีแดง', rulingPlanet: 'ดาวอาทิตย์ (1)', trait: 'เด็ดเดี่ยว เป็นผู้นำ กล้าคิดกล้าทำ มีเกียรติยศ' },
  { id: 'mon', nameTh: 'วันจันทร์', element: 'ดิน', color: 'สีเหลือง', rulingPlanet: 'ดาวจันทร์ (2)', trait: 'อ่อนโยน นุ่มนวล มีเสน่ห์เมตตามหานิยม มิตรสหายรัก' },
  { id: 'tue', nameTh: 'วันอังคาร', element: 'ลม', color: 'สีชมพู', rulingPlanet: 'ดาวอังคาร (3)', trait: 'นักสู้ ขยันขันแข็ง เด็ดเดี่ยว ผ่านพ้นอุปสรรคเร็ว' },
  { id: 'wed', nameTh: 'วันพุธ (กลางวัน)', element: 'น้ำ', color: 'สีเขียว', rulingPlanet: 'ดาวพุธ (4)', trait: 'สติปัญญาไหวพริบ วาจาสิทธิ์ ค้าขายและสื่อสารเป็นเลิศ' },
  { id: 'wed_night', nameTh: 'วันพุธ (กลางคืน)', element: 'ลมพายุ/ราหู', color: 'สีดำ/สีเทา', rulingPlanet: 'พระราหู (8)', trait: 'ฉลาดล้ำ ไหวพริบสูง สายเสี่ยงโชค เก่งธุรกิจนวัตกรรมและบันเทิง' },
  { id: 'thu', nameTh: 'วันพฤหัสบดี', element: 'ดิน', color: 'สีส้ม', rulingPlanet: 'ดาวพฤหัสบดี (5)', trait: 'ซื่อสัตย์ มีคุณธรรม ปัญญาบริสุทธิ์ ผู้ใหญ่อุปถัมภ์' },
  { id: 'fri', nameTh: 'วันศุกร์', element: 'น้ำ', color: 'สีฟ้า', rulingPlanet: 'ดาวศุกร์ (6)', trait: 'มีเสน่ห์ รสนิยมดี การเงินไหลสะพัด ความสัมพันธ์หวานชื่น' },
  { id: 'sat', nameTh: 'วันเสาร์', element: 'ไฟ', color: 'สีม่วง', rulingPlanet: 'ดาวเสาร์ (7)', trait: 'อดทน ทรหด วางรากฐานมั่นคง อสังหาริมทรัพย์ยั่งยืน' },
];

export const DAY_LIFE_PROFILES: Record<number, {
  dominantAspect: string;
  summaryGuidance: string;
  careerAdvice: string;
  wealthAdvice: string;
  loveAdvice: string;
}> = {
  0: {
    dominantAspect: 'เกียรติยศและบารมีผู้นำ',
    summaryGuidance: 'ดวงชะตามีพลังดาวอาทิตย์หนุนนำ โดดเด่นด้านความเป็นผู้นำ การสร้างชื่อเสียง และเกียรติยศ',
    careerAdvice: 'เน้นงานบริหาร ความซื่อสัตย์ และการตัดสินใจที่เด็ดขาดจะนำพาบริวารยอมรับ',
    wealthAdvice: 'การเงินมาจากความสามารถและเกียรติยศ หลีกเลี่ยงการใช้อารมณ์ในการลงทุน',
    loveAdvice: 'คู่ครองช่วยเสริมบารมี ให้ความเคารพซึ่งกันและกันเพื่อความสัมพันธ์ยั่งยืน',
  },
  1: {
    dominantAspect: 'เสน่ห์เมตตามหานิยมและการค้าขาย',
    summaryGuidance: 'ดวงชะตามีพลังดาวจันทร์โอบอุ้ม เด่นเรื่องเสน่ห์ผู้คนรักใคร่เอ็นดู การบริการและการติดต่อเจรจา',
    careerAdvice: 'เน้นงานบริการ งานดูแล หรือธุรกิจสร้างสรรค์ มิตรสหายและผู้ใหญ่จะช่วยเหลือตลอดเส้นทาง',
    wealthAdvice: 'การเงินไหลเวียนจากเสน่ห์และการค้าขาย สั่งสมเงินออมในรูปแบบอสังหาริมทรัพย์',
    loveAdvice: 'มีความนุ่มนวล อ่อนโยน ควรเพิ่มความมั่นคงและหลีกเลี่ยงการคิดมากเกินไป',
  },
  2: {
    dominantAspect: 'นักสู้ชัยชนะและความขยันขันแข็ง',
    summaryGuidance: 'ดวงชะตามีพลังดาวอังคารขับเคลื่อน ลุยงานหนัก ทรหด ชนะอุปสรรคและคู่แข่งได้อย่างรวดเร็ว',
    careerAdvice: 'เหมาะกับงานบุกเบิก ฟรีแลนซ์ หรืองานที่ต้องแก้ปัญหาเฉพาะหน้า ยิ่งลุยยิ่งร่ำรวย',
    wealthAdvice: 'หาเงินได้รวดเร็วและมาก ควรสร้างวินัยงบประมาณเพื่อไม่ให้เงินรั่วไหลตามอารมณ์',
    loveAdvice: 'ความรักมีความหวือหวา จริงใจ ควรเพิ่มความใจเย็นและการรับฟังกัน',
  },
  3: {
    dominantAspect: 'สติปัญญาเจรจาการค้าและนวัตกรรม',
    summaryGuidance: 'ดวงชะตามีพลังดาวพุธส่งเสริม วาจาสิทธิ์ ช่างคิดช่างพูด ทันโลกเทคโนโลยีและการค้าขาย',
    careerAdvice: 'เด่นงานการตลาด สื่อสารมวลชน ค้าขายออนไลน์ และธุรกิจต่างประเทศ',
    wealthAdvice: 'รายได้เข้ามาจากหลายทางพร้อมกัน บริหารพอร์ตลงทุนต่อยอดเงินสร้างเงิน',
    loveAdvice: 'ช่างคุย อารมณ์ดี สร้างรอยยิ้มให้คู่ครองเสมอ',
  },
  4: {
    dominantAspect: 'สติปัญญาพลิกแพลง โชคลาภลอย และธุรกิจนวัตกรรม',
    summaryGuidance: 'ดวงชะตามีพลังพระราหูหนุนนำ ฉลาดพลิกแพลง มีไหวพริบหยั่งรู้ ทันคน ทันโลก และธุรกิจเสรีบันเทิง',
    careerAdvice: 'เด่นงานนวัตกรรม การลงทุนเสี่ยงโชค ธุรกิจเทคโนโลยี และการค้าระหว่างประเทศ',
    wealthAdvice: 'มีโชคลาภลอยและลาภกะทันหันบ่อยครั้ง ควรจัดสรรเงินออมในสินทรัพย์ที่จับต้องได้',
    loveAdvice: 'เสน่ห์ลุ่มลึก น่าค้นหา รักจริงทุ่มเท ควรเพิ่มความจริงใจและการเปิดใจคุยกัน',
  },
  5: {
    dominantAspect: 'ปัญญาบริสุทธิ์และผู้ใหญ่อุปถัมภ์',
    summaryGuidance: 'ดวงชะตามีพลังดาวพฤหัสบดีคุ้มครอง มีสิ่งศักดิ์สิทธิ์และครูบาอาจารย์ให้ความช่วยเหลืออุปถัมภ์',
    careerAdvice: 'เด่นงานวิชาการ การศึกษา กฎหมาย และงานผู้บริหารระดับสูง',
    wealthAdvice: 'ทรัพย์สินเพิ่มพูนมั่นคงยั่งยืน ไม่เสี่ยงโชคเกินตัว วางแผนการเงินรอบคอบ',
    loveAdvice: 'ความรักให้ความเคารพและเกื้อกูลกัน เป็นครอบครัวที่อบอุ่นมีศีลธรรม',
  },
  6: {
    dominantAspect: 'มหาเสน่ห์ทรัพย์สินและความสุขสมบูรณ์',
    summaryGuidance: 'ดวงชะตามีพลังดาวศุกร์อุปถัมภ์ การเงินไหลสะพัด ลาภปาก รสนิยมประณีต และดึงดูดความสุข',
    careerAdvice: 'เด่นงานศิลปะ แฟชั่น ความสวยงาม อสังหาฯ และธุรกิจบันเทิง',
    wealthAdvice: 'เงินทองไม่ขาดมือ มีโชคลาภเข้ามาบ่อยครั้ง บริหารการเงินให้อยู่ในความพอดี',
    loveAdvice: 'เสน่ห์แรง ความรักหวานชื่น ได้รับความดูแลเอาใจใส่จากคนรัก',
  },
  7: {
    dominantAspect: 'ความอดทนรากฐานมั่นคงและทรัพย์สินระยะยาว',
    summaryGuidance: 'ดวงชะตามีพลังดาวเสาร์สถิต ทรหด วางรากฐานชีวิตยาวนาน ประสบความสำเร็จมั่งคั่งช่วงกลางคน',
    careerAdvice: 'เด่นงานอสังหาริมทรัพย์ งานอุตสาหกรรม งานที่ต้องใช้ความอดทนและความรอบคอบสูง',
    wealthAdvice: 'สะสมทรัพย์สินก้อนโต วางแผนเกษียณมั่งคั่งไร้กังวล',
    loveAdvice: 'ความรักมั่นคง หนักแน่น ซื่อสัตย์และร่วมทุกข์ร่วมสุขกันอย่างแท้จริง',
  },
};

export function calculateLifeGraph(birthDateStr: string, dayOfWeekIndex: number): ThaiLifeChartResult {
  const dateObj = new Date(birthDateStr);
  const day = dateObj.getDate() || 15;
  const month = dateObj.getMonth() + 1 || 6;
  const year = dateObj.getFullYear() || 1995;

  const dayIdx = dayOfWeekIndex % 7;
  const dayInfo = DAYS_OF_WEEK[dayIdx] || DAYS_OF_WEEK[0];
  const profile = DAY_LIFE_PROFILES[dayIdx] || DAY_LIFE_PROFILES[0];

  // Calculate 8 life stages based on numerology cycle formula
  const baseSeed = (day + month + (year % 100) + dayIdx * 3) % 12;

  const stages: LifeStagePoint[] = [
    {
      ageRange: '1 - 10 ปี',
      stageName: 'ปฐมวัย & รากฐานชีวิต',
      score: Math.min(95, Math.max(45, (baseSeed * 7 + 45) % 100)),
      careerStatus: 'เริ่มเรียนรู้ มีพรสวรรค์ติดตัวตามธาตุประจำวันเกิด',
      wealthStatus: 'ครอบครัวเกื้อหนุน อบอุ่น',
      loveStatus: 'ได้รับความรักจากบิดามารดาและญาติผู้ใหญ่เต็มเปี่ยม',
      advice: 'สั่งสมความรู้และพัฒนาศักยภาพตนเองตั้งแต่เยาว์วัย',
    },
    {
      ageRange: '11 - 20 ปี',
      stageName: 'วัยเรียนรู้ & การค้นหาตัวตน',
      score: Math.min(95, Math.max(50, (baseSeed * 5 + 55) % 100)),
      careerStatus: 'การศึกษาโดดเด่น ค้นพบสิ่งที่รักและถนัดเฉพาะทาง',
      wealthStatus: 'การเงินอยู่ในเกณฑ์ราบรื่น รู้จักใช้จ่าย',
      loveStatus: 'พบปะมิตรสหายและเรียนรู้ความสัมพันธ์ที่ดี',
      advice: 'กล้าลองทำสิ่งใหม่ๆ และสร้างเครือข่ายมิตรแท้',
    },
    {
      ageRange: '21 - 30 ปี',
      stageName: 'วัยสร้างตัว & จุดเริ่มต้นอาชีพ',
      score: Math.min(98, Math.max(55, (baseSeed * 8 + 60) % 100)),
      careerStatus: `ก้าวหน้าเร็วด้วยพลัง${profile.dominantAspect}`,
      wealthStatus: 'เริ่มตั้งตัว มีรายได้เพิ่มขึ้นต่อเนื่องจากการทำงาน',
      loveStatus: 'พบคนถูกใจ สร้างความสัมพันธ์จริงจังและวางแผนอนาคต',
      advice: profile.careerAdvice,
    },
    {
      ageRange: '31 - 40 ปี',
      stageName: 'วัยรุ่งโรจน์ & มหาโชคบารมี',
      score: Math.min(99, Math.max(68, (baseSeed * 9 + 65) % 100)),
      careerStatus: 'ก้าวสู่ระดับผู้บริหาร หรือธุรกิจเติบโตก้าวกระโดด',
      wealthStatus: 'ทรัพย์สินมั่นคง ซื้อบ้าน/รถ/อสังหาริมทรัพย์',
      loveStatus: 'ครอบครัวสมบูรณ์ มีความสุขเข้าใจกันดี',
      advice: profile.wealthAdvice,
    },
    {
      ageRange: '41 - 50 ปี',
      stageName: 'วัยเสถียรภาพ & ต่อยอดความสำเร็จ',
      score: Math.min(96, Math.max(62, (baseSeed * 6 + 70) % 100)),
      careerStatus: 'เป็นที่เคารพนับถือในวงการ มีอำนาจตัดสินใจสำคัญ',
      wealthStatus: 'เงินเก็บและพอร์ตลงทุนสร้างปันผลสม่ำเสมอ',
      loveStatus: 'ความรักลุ่มลึก อบอุ่น และเป็นที่ปรึกษาซึ่งกันและกัน',
      advice: 'รักษาสุขภาพกายใจและถ่ายทอดประสบการณ์ให้รุ่นน้อง',
    },
    {
      ageRange: '51 - 60 ปี',
      stageName: 'วัยเสพสุข & บารมีมหาเศรษฐี',
      score: Math.min(98, Math.max(58, (baseSeed * 7 + 75) % 100)),
      careerStatus: 'บริหารภาพรวมแบบไร้กังวล หรือเป็นที่ปรึกษาใหญ่',
      wealthStatus: 'มั่งคั่งยั่งยืน อิสรภาพทางการเงินสมบูรณ์',
      loveStatus: 'คู่ชีวิตร่วมสุขร่วมเสพ เดินทางท่องเที่ยวพักผ่อน',
      advice: 'วางแผนมรดกและทำบุญสร้างกุศลส่งต่อให้สังคม',
    },
    {
      ageRange: '61 - 70 ปี',
      stageName: 'วัยเกษียณสุขสงบ & อายุวัฒนะ',
      score: Math.min(92, Math.max(52, (baseSeed * 4 + 60) % 100)),
      careerStatus: 'เกษียณอย่างภาคภูมิใจ เป็นที่ปรึกษากิตติมศักดิ์',
      wealthStatus: 'มีเงินสำรองเลี้ยงชีพและทรัพย์สินเหลือล้น',
      loveStatus: 'ความสุขในครอบครัว อบอุ่นกับลูกหลาน',
      advice: 'ใส่ใจอาหารการกิน ออกกำลังกายเบาๆ รักษาสุขภาพ',
    },
    {
      ageRange: '71+ ปี',
      stageName: 'วัยแห่งปัญญา & ความภาคภูมิใจ',
      score: Math.min(90, Math.max(48, (baseSeed * 3 + 52) % 100)),
      careerStatus: 'เสพสุขจากผลงานความสำเร็จและความดีในอดีต',
      wealthStatus: 'มั่นคงมหาศาล ส่งต่อบารมีให้ลูกหลาน',
      loveStatus: 'เป็นร่มโพธิ์ร่มไทรของครอบครัว',
      advice: 'ใช้ชีวิตด้วยสติ ความสงบ และความเบิกบานใจ',
    },
  ];

  // Find peak stage
  const peakStage = [...stages].sort((a, b) => b.score - a.score)[0];

  return {
    birthDate: birthDateStr,
    dayOfWeekTh: dayInfo.nameTh,
    elementTh: `ธาตุ${dayInfo.element}`,
    lifeGraphPoints: stages,
    peakAgeRange: peakStage.ageRange,
    dominantAspect: profile.dominantAspect,
    summaryGuidance: `ผู้เกิด${dayInfo.nameTh} (${dayInfo.rulingPlanet}, ธาตุ${dayInfo.element}): ${profile.summaryGuidance}`,
  };
}
