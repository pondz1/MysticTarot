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

export const DAILY_AUSPICIOUS_DIRECTIONS_MAP: Record<number, AuspiciousDirection[]> = {
  0: [ // วันอาทิตย์
    { directionTh: 'ทิศตะวันออก (เสริมการงาน)', directionEn: 'East', angle: '90°', energyType: 'ธาตุไม้แสงอาทิตย์', benefit: 'ส่งเสริมการงานเลื่อนขั้น เลื่อนตำแหน่ง มีพลังคิดสร้างสรรค์เด่น', category: 'work' },
    { directionTh: 'ทิศตะวันออกเฉียงเหนือ (เสริมการเงิน)', directionEn: 'North-East', angle: '45°', energyType: 'ธาตุดินมหาโชค', benefit: 'ดึงดูดโชคลาภการเงิน ขยายทรัพย์สินและการสะสมบุญบารมี', category: 'wealth' },
    { directionTh: 'ทิศใต้ (เสริมเสน่ห์ความรัก)', directionEn: 'South', angle: '180°', energyType: 'ธาตุไฟอบอุ่น', benefit: 'เสริมเสน่ห์เมตตามหานิยม ได้รับความเอ็นดูจากผู้ใหญ่และคนรัก', category: 'love' },
    { directionTh: 'ทิศตะวันตกเฉียงใต้ (ทิศอับโชค/ควรหลีกเลี่ยง)', directionEn: 'South-West', angle: '225°', energyType: 'ทิศกาลกิณีประจำวัน', benefit: 'หลีกเลี่ยงการตั้งโต๊ะทำงานหรือหันหัวนอนไปทางทิศนี้ในวันนี้', category: 'avoid' },
  ],
  1: [ // วันจันทร์
    { directionTh: 'ทิศใต้ (เสริมการงาน)', directionEn: 'South', angle: '180°', energyType: 'ธาตุไฟโชติช่วง', benefit: 'ส่งเสริมชื่อเสียง เกียรติยศ และผู้ใหญ่อุปถัมภ์ในงานบริหาร', category: 'work' },
    { directionTh: 'ทิศตะวันออก (เสริมการเงิน)', directionEn: 'East', angle: '90°', energyType: 'ธาตุไม้เจริญเติบโต', benefit: 'การเงินหมุนเวียนลื่นไหล ค้าขายได้กำไรต่อเนื่องไม่ขาดสาย', category: 'wealth' },
    { directionTh: 'ทิศตะวันตกเฉียงเหนือ (เสริมความรัก)', directionEn: 'North-West', angle: '315°', energyType: 'ธาตุทองบริสุทธิ์', benefit: 'ความสัมพันธ์นุ่มนวลราบรื่น ได้รับความเอ็นดูเมตตาจากคนใกล้ชิด', category: 'love' },
    { directionTh: 'ทิศตะวันตก (ทิศอับโชค/ควรหลีกเลี่ยง)', directionEn: 'West', angle: '270°', energyType: 'ทิศกาลกิณีประจำวัน', benefit: 'หลีกเลี่ยงการเจรจาสำคัญหรือตั้งโต๊ะทำงานหันไปทิศนี้', category: 'avoid' },
  ],
  2: [ // วันอังคาร
    { directionTh: 'ทิศตะวันตก (เสริมการงาน)', directionEn: 'West', angle: '270°', energyType: 'ธาตุทองแข็งแกร่ง', benefit: 'ส่งเสริมการลุยงาน ชนะคู่แข่งและผ่านพ้นอุปสรรคการงานได้เร็ว', category: 'work' },
    { directionTh: 'ทิศเหนือ (เสริมการเงิน)', directionEn: 'North', angle: '0°', energyType: 'ธาตุน้ำไหลสะพัด', benefit: 'ดึงดูดโชคลาภการเงินกะทันหัน หมุนเงินก้อนใหญ่ได้คล่องตัว', category: 'wealth' },
    { directionTh: 'ทิศตะวันออกเฉียงใต้ (เสริมความรัก)', directionEn: 'South-East', angle: '135°', energyType: 'ธาตุไม้หวานชื่น', benefit: 'เสริมเสน่ห์ดึงดูดความรักที่ดี และมิตรภาพที่ซื่อสัตย์', category: 'love' },
    { directionTh: 'ทิศตะวันออกเฉียงเหนือ (ทิศอับโชค/ควรหลีกเลี่ยง)', directionEn: 'North-East', angle: '45°', energyType: 'ทิศกาลกิณีประจำวัน', benefit: 'ควรระวังเรื่องอารมณ์ผันผวน หากหันหน้าไปทิศนี้', category: 'avoid' },
  ],
  3: [ // วันพุธ
    { directionTh: 'ทิศเหนือ (เสริมการงาน)', directionEn: 'North', angle: '0°', energyType: 'ธาตุน้ำสื่อสาร', benefit: 'การเจรจาเป็นเลิศ ค้าขายออนไลน์และการติดต่อต่างประเทศรุ่งเรือง', category: 'work' },
    { directionTh: 'ทิศตะวันออกเฉียงใต้ (เสริมการเงิน)', directionEn: 'South-East', angle: '135°', energyType: 'ธาตุไม้สมบูรณ์', benefit: 'ดึงดูดทรัพย์สิน เพิ่มพูนรายได้จากหลายทางพร้อมกัน', category: 'wealth' },
    { directionTh: 'ทิศตะวันออกเฉียงเหนือ (เสริมความรัก)', directionEn: 'North-East', angle: '45°', energyType: 'ธาตุดินมั่นคง', benefit: 'ความสัมพันธ์มั่นคง เป็นที่ปรึกษาและเกื้อกูลกันอย่างดี', category: 'love' },
    { directionTh: 'ทิศใต้ (ทิศอับโชค/ควรหลีกเลี่ยง)', directionEn: 'South', angle: '180°', energyType: 'ทิศกาลกิณีประจำวัน', benefit: 'หลีกเลี่ยงการเจรจาหรือเซ็นสัญญาสำคัญเมื่อหันหน้าทิศนี้', category: 'avoid' },
  ],
  4: [ // วันพฤหัสบดี
    { directionTh: 'ทิศตะวันออกเฉียงเหนือ (เสริมการงาน)', directionEn: 'North-East', angle: '45°', energyType: 'ธาตุดินสติปัญญา', benefit: 'เด่นด้านงานวิชาการ การสอบแข่งขัน และผู้ใหญ่เมตตาไว้วางใจ', category: 'work' },
    { directionTh: 'ทิศตะวันตกเฉียงเหนือ (เสริมการเงิน)', directionEn: 'North-West', angle: '315°', energyType: 'ธาตุทองมหาโชค', benefit: 'รับโชคลาภการเงินก้อนใหญ่ การลงทุนระยะยาวได้ผลตอบแทนดี', category: 'wealth' },
    { directionTh: 'ทิศเหนือ (เสริมความรัก)', directionEn: 'North', angle: '0°', energyType: 'ธาตุน้ำนุ่มนวล', benefit: 'ความสัมพันธ์อบอุ่น เข้าใจและเกื้อกูลกันในครอบครัว', category: 'love' },
    { directionTh: 'ทิศตะวันตกเฉียงใต้ (ทิศอับโชค/ควรหลีกเลี่ยง)', directionEn: 'South-West', angle: '225°', energyType: 'ทิศกาลกิณีประจำวัน', benefit: 'หลีกเลี่ยงการทำกิจกรรมสำคัญในทิศนี้ประจำวัน', category: 'avoid' },
  ],
  5: [ // วันศุกร์
    { directionTh: 'ทิศตะวันตกเฉียงเหนือ (เสริมการงาน)', directionEn: 'North-West', angle: '315°', energyType: 'ธาตุทองประณีต', benefit: 'ส่งเสริมความคิดสร้างสรรค์ การออกแบบ และงานบริหารธุรกิจ', category: 'work' },
    { directionTh: 'ทิศตะวันออก (เสริมการเงิน)', directionEn: 'East', angle: '90°', energyType: 'ธาตุไม้ลาภปาก', benefit: 'มีโชคลาภจากการเจรจา การเงินสะพัด มีลาภปากกะทันหัน', category: 'wealth' },
    { directionTh: 'ทิศใต้ (เสริมความรัก)', directionEn: 'South', angle: '180°', energyType: 'ทิศไฟเสน่ห์', benefit: 'มหาเสน่ห์ดึงดูดผู้คน ความรักสดใสหวานชื่นและสมหวัง', category: 'love' },
    { directionTh: 'ทิศเหนือ (ทิศอับโชค/ควรหลีกเลี่ยง)', directionEn: 'North', angle: '0°', energyType: 'ทิศกาลกิณีประจำวัน', benefit: 'หลีกเลี่ยงการตั้งโต๊ะหันหน้าเข้าทิศนี้ในวันนี้', category: 'avoid' },
  ],
  6: [ // วันเสาร์
    { directionTh: 'ทิศตะวันตกเฉียงใต้ (เสริมการงาน)', directionEn: 'South-West', angle: '225°', energyType: 'ธาตุดินมั่นคง', benefit: 'ส่งเสริมรากฐานการงานแข็งแกร่ง ลุยงานใหญ่ประสบความสำเร็จ', category: 'work' },
    { directionTh: 'ทิศใต้ (เสริมการเงิน)', directionEn: 'South', angle: '180°', energyType: 'ธาตุไฟมหาโชค', benefit: 'หมุนเงินก้อนโต มีโชคเสี่ยงดวง และบริวารช่วยเหลือ', category: 'wealth' },
    { directionTh: 'ทิศตะวันตก (เสริมความรัก)', directionEn: 'West', angle: '270°', energyType: 'ธาตุทองเกื้อกูล', benefit: 'คนรักช่วยสนับสนุนการงานและการเงินอย่างดีเยี่ยม', category: 'love' },
    { directionTh: 'ทิศตะวันออก (ทิศอับโชค/ควรหลีกเลี่ยง)', directionEn: 'East', angle: '90°', energyType: 'ทิศกาลกิณีประจำวัน', benefit: 'หลีกเลี่ยงการทำสมาธิหรือเจรจาหันหน้าเข้าทิศนี้', category: 'avoid' },
  ],
};

export const AUSPICIOUS_DIRECTIONS: AuspiciousDirection[] = DAILY_AUSPICIOUS_DIRECTIONS_MAP[0];

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
    title: 'เตียงนอนห้ามตั้งตรงกับกระจกเงาและประตูห้องน้ำ',
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

const DAY_ELEMENT_TIPS: Record<number, FengShuiTip> = {
  0: {
    category: 'home',
    title: 'เคล็ดลับธาตุไฟประจำวันอาทิตย์',
    description: 'เปิดรับแสงแดดแรกยามเช้า และเสริมโคมไฟแสงอุ่นทางทิศใต้เพื่อส่งเสริมเกียรติยศและชื่อเสียงในหน้าที่การงาน',
    iconName: 'Sun',
  },
  1: {
    category: 'home',
    title: 'เคล็ดลับธาตุดินประจำวันจันทร์',
    description: 'ประดับเครื่องปั้นดินเผาหรือแจกันหินทางทิศตะวันออกเฉียงเหนือ เพื่อเสริมความมั่นคงและเสน่ห์เมตตามหานิยม',
    iconName: 'Home',
  },
  2: {
    category: 'home',
    title: 'เคล็ดลับธาตุลมประจำวันอังคาร',
    description: 'เปิดหน้าต่างระบายอากาศและขจัดมุมอับในบ้าน ประดับกระดิ่งลมทางทิศตะวันตกเพื่อชนะอุปสรรคและคู่แข่ง',
    iconName: 'Sparkles',
  },
  3: {
    category: 'home',
    title: 'เคล็ดลับธาตุน้ำประจำวันพุธ',
    description: 'วางน้ำพุหมุนเล็กๆ หรือตู้ปลาสวยงามทางทิศเหนือ เพื่อดึงดูดพลังงานการเงิน การเจรจาค้าขาย และความคิดไหลลื่น',
    iconName: 'Coins',
  },
  4: {
    category: 'home',
    title: 'เคล็ดลับธาตุดินสติปัญญาประจำวันพฤหัสบดี',
    description: 'จัดวางชั้นหนังสือหรือต้นไม้มงคลใบเขียวสดทางทิศตะวันออกเฉียงเหนือ เพื่อรับพลังสติปัญญาและผู้ใหญ่อุปถัมภ์',
    iconName: 'Briefcase',
  },
  5: {
    category: 'home',
    title: 'เคล็ดลับธาตุน้ำมหาเสน่ห์ประจำวันศุกร์',
    description: 'ประดับแจกันดอกไม้สดสีหวานชื่นทางทิศใต้ เพื่อเสริมมหาเสน่ห์ ความรักหวานชื่น และการเงินสะพัด',
    iconName: 'Heart',
  },
  6: {
    category: 'home',
    title: 'เคล็ดลับธาตุไฟ/ดินประจำวันเสาร์',
    description: 'ตั้งโคมไฟหินเกลือหิมาลัยทางทิศตะวันตกเฉียงใต้ เพื่อสร้างรากฐานอสังหาริมทรัพย์และโชคลาภก้อนโต',
    iconName: 'Home',
  },
};

const SPACE_TIPS_MAP: Record<string, FengShuiTip[]> = {
  desk: [
    {
      category: 'workplace',
      title: 'วางคริสตัลหรือต้นไม้มงคลฝั่งซ้ายมือ (ฝั่งมังกรเขียว)',
      description: 'ทิศซ้ายมือของโต๊ะคือพลังมังกรเขียว การวางคริสตัลจุยบ่อหรือต้นไผ่กวนอิมช่วยส่งเสริมอำนาจบารมีและความคิดสร้างสรรค์',
      iconName: 'Sparkles',
    },
    {
      category: 'workplace',
      title: 'โต๊ะทำงานห้ามตรงกับประตู หรือหันหลังให้ประตู',
      description: 'การหันหลังให้ประตูทำให้ขาดความมั่นคง ควรมีผนังทึบอยู่ด้านหลังเพื่อเปรียบเสมือนมีภูเขาหนุนหลัง',
      iconName: 'Briefcase',
    },
    {
      category: 'workplace',
      title: 'จัดเก็บสายไฟและอุปกรณ์บนโต๊ะให้เป็นระเบียบ',
      description: 'สายไฟพันกันสะท้อนถึงความขัดแย้งในงาน ควรเก็บสายไฟให้เรียบร้อยเพื่อเปิดทางให้พลังงานไอเดียไหลลื่น',
      iconName: 'Layout',
    },
  ],
  bedroom: [
    {
      category: 'bedroom',
      title: 'หัวเตียงควรชิดผนังทึบ สร้างความมั่นคงในชีวิต',
      description: 'หัวเตียงห้ามลอยกลางห้องหรือชิดหน้าต่าง เพื่อสร้างรากฐานความมั่นคงในชีวิตคู่และการพักผ่อนที่สมบูรณ์',
      iconName: 'Bed',
    },
    {
      category: 'bedroom',
      title: 'เตียงนอนห้ามตั้งตรงกับกระจกเงาและประตูห้องน้ำ',
      description: 'กระจกเงาตรงปลายเตียงจะสะท้อนพลังงานรบกวนการนอนหลับ ส่งผลให้ตื่นมาไม่สดชื่นและมีเรื่องกังวลใจ',
      iconName: 'Bed',
    },
    {
      category: 'bedroom',
      title: 'หลีกเลี่ยงเครื่องใช้ไฟฟ้าปลายเตียงนอน',
      description: 'ปลั๊กไฟและทีวีปลายเตียงปล่อยคลื่นสนามแม่เหล็กรบกวน ควรย้ายหรือใช้ผ้าคลุมในยามค่ำคืน',
      iconName: 'Home',
    },
  ],
  entrance: [
    {
      category: 'home',
      title: 'เปิดประตูหน้าบ้านรับพลังงานชี่ (Chi Energy)',
      description: 'หน้าบ้านต้องสะอาด สว่าง ไม่มีขยะหรือรองเท้าขวางทางเดิน เพื่อให้พลังโชคลาภหมุนเวียนเข้าบ้านสะดวก',
      iconName: 'DoorOpen',
    },
    {
      category: 'home',
      title: 'ติดตั้งโคมไฟหน้าบ้านสว่างไสวตลอดค่ำคืน',
      description: 'ไฟหน้าบ้านที่สว่างไสวช่วยดึงดูดพลังงานบวกและโอกาสทองทางการเงินเข้าสู่ที่อยู่อาศัย',
      iconName: 'Sun',
    },
    {
      category: 'home',
      title: 'แขวนกระดิ่งลมเสียงใสบริเวณทางเข้าบ้าน',
      description: 'เสียงสั่นสะเทือนของกระดิ่งลมช่วยสลายพลังงานอับโชคและต้อนรับเงินทองเข้ามาในบ้าน',
      iconName: 'Sparkles',
    },
  ],
  cashier: [
    {
      category: 'workplace',
      title: 'ตั้งโต๊ะแคชเชียร์ในทิศมังกรประจำวัน',
      description: 'โต๊ะคิดเงินต้องมองเห็นประตูร้านชัดเจน ห้ามตั้งตรงกับประตูห้องน้ำหรือใต้คานบ้านเพื่อป้องกันเงินรั่วไหล',
      iconName: 'Coins',
    },
    {
      category: 'workplace',
      title: 'วางปี่เซียะหรือกบคาบเหรียญหันหน้าออกประตูร้าน',
      description: 'วัตถุมงคลดูดทรัพย์ควรวางในทิศมงคล หันหน้าออกทางประตูร้านเพื่อเรียกสิริมงคลและลูกค้าเข้าไม่ขาดสาย',
      iconName: 'Coins',
    },
    {
      category: 'workplace',
      title: 'ติดกระจกเงาสะท้อนลิ้นชักคิดเงิน',
      description: 'กระจกเงาด้านหลังหรือข้างเคาน์เตอร์คิดเงินช่วยสะท้อนคูณสองทรัพย์สินและความคึกคักทางการค้า',
      iconName: 'Sparkles',
    },
  ],
  overall: [
    {
      category: 'home',
      title: 'ห้องรับแขกต้องสว่างและอากาศถ่ายเทสะดวก',
      description: 'ศูนย์รวมพลังงานมั่งคั่งของบ้านคือห้องรับแขก ติดตั้งไฟแสงวอร์มไลท์เพื่อดึงดูดโชคลาภและรอยยิ้มของคนในบ้าน',
      iconName: 'Sun',
    },
    {
      category: 'home',
      title: 'ห้องครัวห้ามตั้งเตาไฟตรงกับอ่างล้างจาน',
      description: 'เตาไฟ (ธาตุไฟ) ตรงข้ามกับอ่างน้ำ (ธาตุน้ำ) เป็นพลังขัดแย้ง ควรมีฉากกั้นหรือเว้นระยะห่างเพื่อป้องกันการมีปากเสียงในบ้าน',
      iconName: 'Flame',
    },
    {
      category: 'home',
      title: 'ดูแลก๊อกน้ำและท่อน้ำทิ้ง ไม่ให้มีน้ำรั่วซึม',
      description: 'น้ำรั่วซึมเปรียบเสมือนการรั่วไหลของโชคลาภและเงินทอง ควรซ่อมแซมก๊อกน้ำทันทีเมื่อมีคราบซึม',
      iconName: 'Home',
    },
  ],
};

export function getDynamicFengShuiTips(dayIndex: number, spaceLabel: string): FengShuiTip[] {
  let spaceKey = 'overall';
  if (spaceLabel.includes('โต๊ะทำงาน')) spaceKey = 'desk';
  else if (spaceLabel.includes('ห้องนอน')) spaceKey = 'bedroom';
  else if (spaceLabel.includes('ประตู')) spaceKey = 'entrance';
  else if (spaceLabel.includes('ร้านค้า') || spaceLabel.includes('แคชเชียร์')) spaceKey = 'cashier';

  const baseSpaceTips = SPACE_TIPS_MAP[spaceKey] || SPACE_TIPS_MAP['overall'];
  const dayTip = DAY_ELEMENT_TIPS[dayIndex % 7] || DAY_ELEMENT_TIPS[0];

  return [...baseSpaceTips, dayTip];
}
