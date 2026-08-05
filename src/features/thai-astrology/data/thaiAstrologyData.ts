import type { ThaiLifeChartResult, LifeStagePoint } from '../types/thaiAstrology';

export const DAYS_OF_WEEK = [
  { id: 'sun', nameTh: 'วันอาทิตย์', element: 'ไฟ', color: 'สีแดง' },
  { id: 'mon', nameTh: 'วันจันทร์', element: 'ดิน', color: 'สีเหลือง' },
  { id: 'tue', nameTh: 'วันอังคาร', element: 'ลม', color: 'สีชมพู' },
  { id: 'wed', nameTh: 'วันพุธ', element: 'น้ำ', color: 'สีเขียว' },
  { id: 'thu', nameTh: 'วันพฤหัสบดี', element: 'ดิน', color: 'สีส้ม' },
  { id: 'fri', nameTh: 'วันศุกร์', element: 'น้ำ', color: 'สีฟ้า' },
  { id: 'sat', nameTh: 'วันเสาร์', element: 'ไฟ', color: 'สีม่วง' },
];

export function calculateLifeGraph(birthDateStr: string, dayOfWeekIndex: number): ThaiLifeChartResult {
  const dateObj = new Date(birthDateStr);
  const day = dateObj.getDate() || 15;
  const month = dateObj.getMonth() + 1 || 6;
  const year = dateObj.getFullYear() || 1995;

  const dayInfo = DAYS_OF_WEEK[dayOfWeekIndex % 7] || DAYS_OF_WEEK[0];

  // Calculate 8 life stages based on numerology cycle formula
  const baseSeed = (day + month + (year % 100)) % 12;

  const stages: LifeStagePoint[] = [
    {
      ageRange: '1 - 10 ปี',
      stageName: 'ปฐมวัย & รากฐานชีวิต',
      score: Math.min(95, Math.max(40, (baseSeed * 7 + 45) % 100)),
      careerStatus: 'เริ่มเรียนรู้ มีพรสวรรค์ติดตัว',
      wealthStatus: 'ครอบครัวเกื้อหนุน อบอุ่น',
      loveStatus: 'ได้รับความรักจากบิดามารดาเต็มเปี่ยม',
      advice: 'สั่งสมความรู้และพัฒนาศักยภาพตนเองตั้งแต่เยาว์วัย',
    },
    {
      ageRange: '11 - 20 ปี',
      stageName: 'วัยเรียนรู้ & การค้นหาตัวตน',
      score: Math.min(95, Math.max(45, (baseSeed * 5 + 55) % 100)),
      careerStatus: 'การศึกษาโดดเด่น ค้นพบทางที่ชอบ',
      wealthStatus: 'การเงินอยู่ในเกณฑ์ราบรื่น',
      loveStatus: 'พบปะมิตรสหายและเรียนรู้ความรักวัยใส',
      advice: 'กล้าลองทำสิ่งใหม่ๆ และสร้างเครือข่ายเพื่อนที่ดี',
    },
    {
      ageRange: '21 - 30 ปี',
      stageName: 'วัยสร้างตัว & จุดเริ่มต้นอาชีพ',
      score: Math.min(98, Math.max(50, (baseSeed * 8 + 60) % 100)),
      careerStatus: 'ก้าวหน้าเร็ว มีผู้ใหญ่ดันสนับสนุน',
      wealthStatus: 'เริ่มตั้งตัว มีรายได้เพิ่มขึ้นต่อเนื่อง',
      loveStatus: 'พบคนถูกใจ สร้างความสัมพันธ์จริงจัง',
      advice: 'ลงทุนในความรู้ และสร้างวินัยทางการเงินอย่างเคร่งครัด',
    },
    {
      ageRange: '31 - 40 ปี',
      stageName: 'วัยรุ่งโรจน์ & มหาโชคบารมี',
      score: Math.min(99, Math.max(65, (baseSeed * 9 + 65) % 100)),
      careerStatus: 'ก้าวสู่ระดับผู้บริหาร หรือธุรกิจเติบโตก้าวกระโดด',
      wealthStatus: 'ทรัพย์สินมั่นคง ซื้อบ้าน/รถ/อสังหาฯ',
      loveStatus: 'ครอบครัวสมบูรณ์ มีบริวารลูกหลาน',
      advice: 'ขยายธุรกิจและกระจายความเสี่ยงอย่างชาญฉลาด',
    },
    {
      ageRange: '41 - 50 ปี',
      stageName: 'วัยเสถียรภาพ & ต่อยอดความสำเร็จ',
      score: Math.min(95, Math.max(60, (baseSeed * 6 + 70) % 100)),
      careerStatus: 'เป็นที่เคารพนับถือในวงการ มีอำนาจตัดสินใจ',
      wealthStatus: 'เงินเก็บและพอร์ตลงทุนสร้างปันผลสม่ำเสมอ',
      loveStatus: 'ความรักลุ่มลึก เข้าอกเข้าใจกันสูง',
      advice: 'รักษาสุขภาพกายใจและถ่ายทอดประสบการณ์ให้รุ่นน้อง',
    },
    {
      ageRange: '51 - 60 ปี',
      stageName: 'วัยเสพสุข & บารมีมหาเศรษฐี',
      score: Math.min(98, Math.max(55, (baseSeed * 7 + 75) % 100)),
      careerStatus: 'เกษียณก่อนกำหนด หรือบริหารภาพรวมแบบไร้กังวล',
      wealthStatus: 'มั่งคั่งยั่งยืน อิสรภาพทางการเงินสมบูรณ์',
      loveStatus: 'คู่ชีวิตร่วมสุขร่วมสุข ร่วมเดินทางท่องเที่ยว',
      advice: 'วางแผนมรดกและทำบุญสร้างกุศลส่งต่อให้สังคม',
    },
    {
      ageRange: '61 - 70 ปี',
      stageName: 'วัยเกษียณสุขสงบ & อายุวัฒนะ',
      score: Math.min(90, Math.max(50, (baseSeed * 4 + 60) % 100)),
      careerStatus: 'เป็นที่ปรึกษากิตติมศักดิ์',
      wealthStatus: 'มีเงินสำรองเลี้ยงชีพเหลือล้น',
      loveStatus: 'ความสุขในครอบครัวอบอุ่น',
      advice: 'ใส่ใจอาหารการกิน ออกกำลังกายเบาๆ รักษาสุขภาพ',
    },
    {
      ageRange: '71+ ปี',
      stageName: 'วัยแห่งปัญญา & ความภาคภูมิใจ',
      score: Math.min(88, Math.max(45, (baseSeed * 3 + 50) % 100)),
      careerStatus: 'เสพสุขจากผลงานความสำเร็จในอดีต',
      wealthStatus: 'มั่นคงมหาศาล',
      loveStatus: 'เป็นร่มโพธิ์ร่มไทรของลูกหลาน',
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
    dominantAspect: 'การงานและการสร้างบารมี',
    summaryGuidance: `ดวงชะตาของท่านที่เกิด${dayInfo.nameTh} (ธาตุ${dayInfo.element}) มีกราฟชีวิตโดดเด่นที่สุดในช่วงอายุ ${peakStage.ageRange} ซึ่งเป็นช่วงมหาโชคบารมีพุ่งสูงสุด`,
  };
}
