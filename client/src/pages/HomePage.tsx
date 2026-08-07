import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ArrowRight,
  Sun,
  BookOpen,
  Compass,
  Hash,
  Calendar,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { MODULE_THEMES, type ModuleId } from '../constants/moduleThemes';

interface DivinationService {
  id: ModuleId;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  link: string;
}

const DIVINATION_SERVICES: DivinationService[] = [
  {
    id: 'tarot',
    title: 'ไพ่ยิปซีออราเคิล (Tarot Cards)',
    tagline: 'ถอดรหัสชะตาชีวิต การงาน การเงิน ความรัก',
    description: 'เลือกไพ่ 1 ถึง 10 ใบ พร้อมธีมไพ่ 6 รูปแบบ คำนวณความหมายและสังเคราะห์ไพ่เชิงลึกด้วย AI ปรมาจารย์',
    icon: Compass,
    badge: 'นิยมสูงสุด',
    link: '/tarot',
  },
  {
    id: 'horoscope',
    title: 'ดูดวง 12 ราศี (Zodiac Horoscope)',
    tagline: 'เช็กดวงประจำวัน & รายเดือน 12 ราศี',
    description: 'คำนวณการเคลื่อนตัวของดวงดาวประจำราศี ผสานพลังงานธาตุ ดิน น้ำ ลม ไฟ พร้อมเลขและสีมงคลประจำวัน',
    icon: Star,
    badge: 'ดวงประจำวัน',
    link: '/horoscope',
  },
  {
    id: 'numerology',
    title: 'เลขศาสตร์ & เบอร์มงคล (Numerology)',
    tagline: 'วิเคราะห์เบอร์โทรศัพท์ ทะเบียนรถ เลขที่บ้าน',
    description: 'ถอดรหัสคู่เลข 2 หลัก ผลรวมเกรดความมงคล A+ ถึง D คำนวณพลังโชคลาภ ดึงดูดเงินทองและเสน่ห์',
    icon: Hash,
    badge: 'วิเคราะห์เบอร์',
    link: '/numerology',
  },
  {
    id: 'thai-astrology',
    title: 'ดวงไทย & กราฟชีวิต (Thai Life Chart)',
    tagline: 'คำนวณกราฟชีวิต 9 ช่วงอายุตามวันเกิด',
    description: 'ศาสตร์การทำนายดวงชะตาไทยโบราณ ค้นหาจังหวะชีวิตพุ่งสูงสุด การงาน ทรัพย์สิน และความรัก',
    icon: Calendar,
    badge: 'ศาสตร์ไทยโบราณ',
    link: '/thai-astrology',
  },
  {
    id: 'feng-shui',
    title: 'ฮวงจุ้ย & สี/ทิศมงคล (Daily Feng Shui)',
    tagline: 'ตารางสีเสื้อมงคลประจำวัน & ทิศนำโชค',
    description: 'ตารางสีเสื้อมงคลเสริมการงาน การเงิน ความรัก พร้อมเคล็ดลับจัดฮวงจุ้ยบ้านและโต๊ะทำงานรับทรัพย์',
    icon: Palette,
    badge: 'อัปเดตทุกวัน',
    link: '/feng-shui',
  },
];

const DAILY_ORACLES = [
  'วันนี้จังหวะชีวิตเปิดกว้าง เหมาะสำหรับการเริ่มต้นสิ่งใหม่และการเจรจาธุรกิจ',
  'มีเกณฑ์ได้รับโชคลาภกะทันหัน หรือมีผู้ใหญ่อุปถัมภ์มอบโอกาสทางการเงิน',
  'เสน่ห์เมตตามหานิยมทำงานสูง การสื่อสารเจรจาจะได้ผลลัพธ์น่าพึงพอใจ',
  'ให้รักษาสติ ความสงบภายใน และหลีกเลี่ยงการตัดสินใจเรื่องใหญ่ด้วยความอารมณ์ชั่ววูบ',
  'มีพลังงานบวกหนุนหลัง ทำงานสิ่งใดก็มีสิทธิ์สำเร็จเกินเป้าหมายที่ตั้งไว้',
];

export const HomePage: React.FC = () => {
  const [randomOracle, setRandomOracle] = useState<string | null>(null);
  const homeTheme = MODULE_THEMES.home;

  const handleDrawOracle = () => {
    const idx = Math.floor(Math.random() * DAILY_ORACLES.length);
    setRandomOracle(DAILY_ORACLES[idx]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 sm:space-y-12 animate-fade-in pb-16">
      {/* Hero — content first, one accent */}
      <section className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-10 overflow-hidden border border-slate-800/90 bg-slate-900/40 text-center space-y-5">
        <p className="text-[11px] sm:text-xs font-medium tracking-wide text-slate-500 uppercase">
          MysticVerse
        </p>

        <h1 className="text-2xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-50 leading-tight px-1 text-pretty">
          ศูนย์รวมศาสตร์ทำนาย
          <span className="block text-base sm:text-xl md:text-2xl font-medium text-slate-400 mt-2 tracking-normal font-sans">
            ไพ่ยิปซี · ราศี · เลขศาสตร์ · ดวงไทย · ฮวงจุ้ย
          </span>
        </h1>

        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          เลือกศาสตร์ ตั้งคำถาม รับคำทำนาย — เริ่มจากไพ่ยิปซีได้ทันที
        </p>

        {/* Daily oracle — secondary, not competing with primary CTA */}
        <div className="pt-2 max-w-lg mx-auto">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 min-w-0">
                <Sun className="w-3.5 h-3.5 text-amber-400/80 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">สาส์นประจำวัน</span>
              </span>
              <button
                type="button"
                onClick={handleDrawOracle}
                className="text-xs px-3 py-1.5 min-h-[36px] rounded-lg border border-slate-700 text-slate-300 hover:border-amber-400/40 hover:text-amber-100 font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>สุ่มข้อความ</span>
              </button>
            </div>
            {randomOracle ? (
              <p className="text-sm font-medium text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-left animate-fade-in">
                {randomOracle}
              </p>
            ) : (
              <p className="text-xs text-slate-600 text-left">
                แตะ「สุ่มข้อความ」เพื่อรับข้อคิดสั้นๆ ประจำวัน
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Primary path: Tarot */}
      <section className="space-y-4" aria-labelledby="primary-service-heading">
        <div className="border-b border-slate-800 pb-3">
          <h2 id="primary-service-heading" className="text-lg sm:text-xl font-bold text-slate-100">
            เริ่มต้นที่นี่
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            บริการหลักที่คนใช้บ่อยที่สุด — เริ่มได้ในไม่กี่ขั้นตอน
          </p>
        </div>

        {(() => {
          const tarot = DIVINATION_SERVICES.find((s) => s.id === 'tarot')!;
          const theme = MODULE_THEMES.tarot;
          const Icon = tarot.icon;
          return (
            <Link
              to={tarot.link}
              className="group relative block rounded-2xl p-5 sm:p-7 border border-amber-400/30 bg-slate-900/50 hover:border-amber-400/50 hover:bg-slate-900/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060f]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0 inline-flex self-start">
                  <Icon className={`w-8 h-8 sm:w-9 sm:h-9 ${theme.iconColor}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-50">{tarot.title}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/25">
                      {tarot.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{tarot.tagline}</p>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl hidden sm:block">{tarot.description}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <span className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-500 text-slate-950 group-hover:bg-amber-400 transition-colors">
                    เริ่มทำนายไพ่
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] text-slate-600">ค่าเริ่มต้น: เปิด 3 ใบ · คลี่ไพ่เลือกเอง</span>
                </div>
              </div>
            </Link>
          );
        })()}

        <div className="pt-1">
          <Link
            to="/tarot/encyclopedia"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-200/70 hover:text-amber-100 py-1 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>หรือเปิดสารานุกรมไพ่ 78 ใบก่อน</span>
          </Link>
        </div>
      </section>

      {/* Other services */}
      <section className="space-y-4" aria-labelledby="other-services-heading">
        <div className="border-b border-slate-800 pb-3">
          <h2 id="other-services-heading" className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Star className={`w-5 h-5 ${homeTheme.iconColor}`} aria-hidden="true" />
            <span>ศาสตร์อื่นๆ</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">ดวงราศี · เลขศาสตร์ · กราฟชีวิต · ฮวงจุ้ย</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DIVINATION_SERVICES.filter((s) => s.id !== 'tarot').map((service) => {
            const theme = MODULE_THEMES[service.id];
            const Icon = service.icon;

            return (
              <Link
                key={service.id}
                to={service.link}
                className="group relative rounded-2xl p-5 border border-slate-800 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50 transition-colors flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060f]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0 inline-flex">
                      <Icon className={`w-5 h-5 ${theme.iconColor}`} aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-slate-500 border border-slate-800">
                      {service.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{service.tagline}</p>
                  </div>
                </div>

                <span className="inline-flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-slate-300 pt-1">
                  <span>เข้าใช้บริการ</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
