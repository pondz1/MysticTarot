import type { DailyLuckyColors, AuspiciousDirection, FengShuiTip } from '../types/fengshui';

export const DAILY_LUCKY_COLORS_TABLE: DailyLuckyColors[] = [
  {
    dayNameTh: 'วันอาทิตย์',
    luckyWork: ['สีเขียวมรกต', 'สีเขียวสด'],
    luckyWealth: ['สีดำเงา', 'สีม่วงคราม'],
    luckyLove: ['สีเทา', 'สีบรอนซ์'],
    unluckyForbidden: ['สีน้ำเงิน', 'สีฟ้าสด'],
  },
  {
    dayNameTh: 'วันจันทร์',
    luckyWork: ['สีเทา', 'สีฟ้าพาสเทล'],
    luckyWealth: ['สีส้มสด', 'สีเหลืองทอง'],
    luckyLove: ['สีน้ำเงินเข้ม', 'สีคราม'],
    unluckyForbidden: ['สีแดงเลือดหมู'],
  },
  {
    dayNameTh: 'วันอังคาร',
    luckyWork: ['สีม่วงคราม', 'สีดำ'],
    luckyWealth: ['สีเทาควันบุหรี่', 'สีเงิน'],
    luckyLove: ['สีแดงสด', 'สีชมพูเข้ม'],
    unluckyForbidden: ['สีขาวมุก', 'สีเหลืองนวล'],
  },
  {
    dayNameTh: 'วันพุธ (กลางวัน)',
    luckyWork: ['สีส้มสด', 'สีทอง'],
    luckyWealth: ['สีฟ้าสด', 'สีน้ำเงิน'],
    luckyLove: ['สีเขียวมรกต', 'สีเหลืองสด'],
    unluckyForbidden: ['สีชมพูพาสเทล'],
  },
  {
    dayNameTh: 'วันพฤหัสบดี',
    luckyWork: ['สีฟ้า', 'สีน้ำเงินไพลิน'],
    luckyWealth: ['สีแดงสด', 'สีส้ม'],
    luckyLove: ['สีเขียวใบไม้', 'สีครีม'],
    unluckyForbidden: ['สีม่วงเข้ม', 'สีดำ'],
  },
  {
    dayNameTh: 'วันศุกร์',
    luckyWork: ['สีขาวมุก', 'สีเหลืองนวล'],
    luckyWealth: ['สีชมพูสด', 'สีบานเย็น'],
    luckyLove: ['สีส้มแสด', 'สีทอง'],
    unluckyForbidden: ['สีเทาดำ', 'สีบรอนซ์'],
  },
  {
    dayNameTh: 'วันเสาร์',
    luckyWork: ['สีดำเงา', 'สีม่วง'],
    luckyWealth: ['สีน้ำเงินสด', 'สีฟ้า'],
    luckyLove: ['สีชมพูอ่อน', 'สีแดง'],
    unluckyForbidden: ['สีเขียวมรกต'],
  },
];

export const AUSPICIOUS_DIRECTIONS: AuspiciousDirection[] = [
  {
    directionTh: 'ทิศตะวันออกเฉียงเหนือ (แปดทิศมหาโชค)',
    directionEn: 'North-East',
    angle: '45°',
    energyType: 'ธาตุดินมหาโชค',
    benefit: 'ส่งเสริมด้านโชคลาภการเงิน ทรัพย์สินเพิ่มพูน และการสะสมบุญบารมี',
  },
  {
    directionTh: 'ทิศใต้ (เกียรติยศชื่อเสียง)',
    directionEn: 'South',
    angle: '180°',
    energyType: 'ธาตุไฟรุ่งโรจน์',
    benefit: 'ส่งเสริมการงาน เลื่อนขั้นเลื่อนตำแหน่ง โดดเด่นในสายงาน',
  },
  {
    directionTh: 'ทิศตะวันออก (สุขภาพและรากฐาน)',
    directionEn: 'East',
    angle: '90°',
    energyType: 'ธาตุไม้เติบโต',
    benefit: 'ส่งเสริมสุขภาพร่างกายแข็งแรง ปราศจากโรคภัย ครอบครัวสุขสันต์',
  },
  {
    directionTh: 'ทิศตะวันตกเฉียงเหนือ (ผู้ใหญ่อุปถัมภ์)',
    directionEn: 'North-West',
    angle: '315°',
    energyType: 'ธาตุทองบริสุทธิ์',
    benefit: 'ได้รับความเมตตาจากผู้ใหญ่ ดึงดูดหุ้นส่วนและมิตรแท้ที่ดี',
  },
];

export const FENG_SHUI_TIPS: FengShuiTip[] = [
  {
    category: 'home',
    title: 'เปิดประตูหน้าบ้านรับพลังงานชี่ (Chi Energy)',
    description: 'หน้าบ้านต้องสะอาด สว่าง ไม่มีขยะหรือรองเท้าขวางทางเดิน เพื่อให้พลังโชคลาภหมุนเวียนเข้าบ้านสะดวก',
    iconName: 'DoorOpen',
  },
  {
    category: 'workplace',
    title: 'โต๊ะทำงานห้ามตั้งตรงกับประตู หรือหันหลังให้ประตู',
    description: 'การหันหลังให้ประตูทำให้ขาดความมั่นคง ควรมีผนังทึบอยู่ด้านหลังเพื่อเปรียบเสมือนมีภูเขาหนุนหลัง',
    iconName: 'Briefcase',
  },
  {
    category: 'bedroom',
    title: 'เตียงนอนห้ามตรงกับกระจกเงา',
    description: 'กระจกเงาตรงปลายเตียงจะสะท้อนพลังงานรบกวนการนอนหลับ ส่งผลให้ตื่นมาไม่สดชื่นและมีเรื่องกังวลใจ',
    iconName: 'Bed',
  },
  {
    category: 'wallet',
    title: 'กระเป๋าสตางค์เรียงแบงค์ให้เป็นระเบียบ',
    description: 'ห้ามปล่อยให้กระเป๋าเงินยับหรือมีใบเสร็จเก่าค้างไว้ ให้พกเงินธนบัตรขวัญถุงเลขมงคล 36 หรือ 65 ติดกระเป๋าเสมอ',
    iconName: 'Wallet',
  },
];
