import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
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
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-16">
      {/* Hero Banner Section */}
      <section className={`relative rounded-3xl p-6 sm:p-12 overflow-hidden border ${homeTheme.cardBg} shadow-2xl text-center space-y-6`}>
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${homeTheme.badgeBg} text-xs sm:text-sm font-semibold tracking-wide`}>
          <Sparkles className={`w-4 h-4 ${homeTheme.iconColor} animate-spin`} />
          <span>MysticVerse — พื้นที่แห่งปัญญาจักรวาล & โหราศาสตร์ออราเคิล</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-amber-50 leading-tight px-1 text-pretty">
          ศูนย์รวมศาสตร์ทำนาย
          <span className="block text-lg sm:text-2xl md:text-3xl font-semibold text-amber-200/90 mt-2">
            ไพ่ยิปซี · ราศี · เลขศาสตร์ · ดวงไทย · ฮวงจุ้ย
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          เลือกศาสตร์ที่ใช่ ตั้งคำถาม แล้วรับคำทำนาย — เริ่มจากไพ่ยิปซีได้ทันที
        </p>

        {/* Daily Quick Oracle Interactive Drawer */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 min-w-0">
                <Sun className={`w-4 h-4 ${homeTheme.iconColor} shrink-0`} />
                <span className="whitespace-nowrap">สาส์นคำแนะนำประจำวัน</span>
              </span>
              <button
                type="button"
                onClick={handleDrawOracle}
                className={`text-xs px-3 py-1.5 rounded-lg ${homeTheme.secondaryBtn} font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>เปิดสาส์นนำทางประจำวัน</span>
              </button>
            </div>
            {randomOracle ? (
              <p className="text-sm font-medium text-slate-100 bg-slate-950 p-3 rounded-xl border border-slate-800 text-left animate-fade-in flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{randomOracle}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400 text-left italic">
                แตะปุ่ม "เปิดสาส์นนำทางประจำวัน" เพื่อรับข้อคิดและสาส์นนำทางชีวิตสั้นๆ ประจำวันนี้...
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
              className={`group relative block rounded-2xl p-5 sm:p-7 border ${theme.cardBg} border-amber-400/40 shadow-xl transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className={`p-3.5 rounded-2xl ${theme.badgeBg} border border-amber-500/25 shrink-0 inline-flex self-start`}>
                  <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${theme.iconColor}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-amber-100">{tarot.title}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
                      {tarot.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{tarot.tagline}</p>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{tarot.description}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 min-h-[44px] rounded-xl ${theme.primaryBtn} shadow-md`}>
                    เริ่มทำนายไพ่
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] text-slate-500">ค่าเริ่มต้น: เปิด 3 ใบ · คลี่ไพ่เลือกเอง</span>
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
                className={`group relative rounded-2xl p-5 border ${theme.cardBg} transition-transform duration-200 hover:-translate-y-0.5 shadow-lg flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-2.5 rounded-xl ${theme.badgeBg} border border-white/5 shrink-0 inline-flex`}>
                      <Icon className={`w-6 h-6 ${theme.iconColor}`} aria-hidden="true" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg}`}>
                      {service.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${theme.iconColor} group-hover:brightness-110 transition-all`}>
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{service.tagline}</p>
                  </div>
                </div>

                <span className="inline-flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white pt-1">
                  <span>เข้าใช้บริการ</span>
                  <ArrowRight className={`w-4 h-4 ${theme.iconColor} group-hover:translate-x-0.5 transition-transform`} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
