import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, ArrowRight, Sun } from 'lucide-react';

const DIVINATION_SERVICES = [
  {
    id: 'tarot',
    title: 'ไพ่ยิปซีออราเคิล (Tarot Cards)',
    tagline: 'ถอดรหัสชะตาชีวิต การงาน การเงิน ความรัก',
    description: 'เลือกไพ่ 1 ถึง 10 ใบ พร้อมธีมไพ่ 6 รูปแบบ คำนวณความหมายและสังเคราะห์ไพ่เชิงลึกด้วย AI ปรมาจารย์',
    icon: '🔮',
    badge: 'นิยมสูงสุด',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    link: '/tarot',
    gradient: 'from-purple-900/40 via-amber-900/20 to-slate-900',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    textColor: 'text-amber-200',
  },
  {
    id: 'horoscope',
    title: 'ดูดวง 12 ราศี (Zodiac Horoscope)',
    tagline: 'เช็กดวงประจำวัน & รายเดือน 12 ราศี',
    description: 'คำนวณการเคลื่อนตัวของดวงดาวประจำราศี ผสานพลังงานธาตุ ดิน น้ำ ลม ไฟ พร้อมเลขและสีมงคลประจำวัน',
    icon: '♈',
    badge: 'ดวงประจำวัน',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    link: '/horoscope',
    gradient: 'from-amber-900/40 via-purple-900/20 to-slate-900',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    textColor: 'text-amber-200',
  },
  {
    id: 'numerology',
    title: 'เลขศาสตร์ & เบอร์มงคล (Numerology)',
    tagline: 'วิเคราะห์เบอร์โทรศัพท์ ทะเบียนรถ เลขที่บ้าน',
    description: 'ถอดรหัสคู่เลข 2 หลัก ผลรวมเกรดความมงคล A+ ถึง D คำนวณพลังโชคลาภ ดึงดูดเงินทองและเสน่ห์',
    icon: '🔢',
    badge: 'วิเคราะห์เบอร์',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    link: '/numerology',
    gradient: 'from-purple-950/50 via-slate-900 to-slate-900',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    textColor: 'text-purple-200',
  },
  {
    id: 'thai-astrology',
    title: 'ดวงไทย & กราฟชีวิต (Thai Life Chart)',
    tagline: 'คำนวณกราฟชีวิต 9 ช่วงอายุตามวันเกิด',
    description: 'ศาสตร์การทำนายดวงชะตาไทยโบราณ ค้นหาจังหวะชีวิตพุ่งสูงสุด การงาน ทรัพย์สิน และความรัก',
    icon: '📜',
    badge: 'ศาสตร์ไทยโบราณ',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    link: '/thai-astrology',
    gradient: 'from-emerald-950/50 via-slate-900 to-slate-900',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    textColor: 'text-emerald-200',
  },
  {
    id: 'feng-shui',
    title: 'ฮวงจุ้ย & สี/ทิศมงคล (Daily Feng Shui)',
    tagline: 'ตารางสีเสื้อมงคลประจำวัน & ทิศนำโชค',
    description: 'ตารางสีเสื้อมงคลเสริมการงาน การเงิน ความรัก พร้อมเคล็ดลับจัดฮวงจุ้ยบ้านและโต๊ะทำงานรับทรัพย์',
    icon: '☯️',
    badge: 'อัปเดตทุกวัน',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    link: '/feng-shui',
    gradient: 'from-rose-950/50 via-slate-900 to-slate-900',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    textColor: 'text-rose-200',
  },
];

const DAILY_ORACLES = [
  '✨ วันนี้จังหวะชีวิตเปิดกว้าง เหมาะสำหรับการเริ่มต้นสิ่งใหม่และการเจรจาธุรกิจ',
  '💰 มีเกณฑ์ได้รับโชคลาภกะทันหัน หรือมีผู้ใหญ่อุปถัมภ์มอบโอกาสทางการเงิน',
  '❤️ เสน่ห์เมตตามหานิยมทำงานสูง การสื่อสารเจรจาจะได้ผลลัพธ์น่าพึงพอใจ',
  '🧘 ให้รักษาสติ ความสงบภายใน และหลีกเลี่ยงการตัดสินใจเรื่องใหญ่ด้วยความอารมณ์ชั่ววูบ',
  '🌟 มีพลังงานบวกหนุนหลัง ทำงานสิ่งใดก็มีสิทธิ์สำเร็จเกินเป้าหมายที่ตั้งไว้',
];

export const HomePage: React.FC = () => {
  const [randomOracle, setRandomOracle] = useState<string | null>(null);

  const handleDrawOracle = () => {
    const idx = Math.floor(Math.random() * DAILY_ORACLES.length);
    setRandomOracle(DAILY_ORACLES[idx]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-16">
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl p-6 sm:p-12 overflow-hidden border border-amber-500/30 bg-gradient-to-b from-purple-950/60 via-slate-950 to-slate-950 shadow-2xl text-center space-y-6">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>MysticVerse — ศูนย์รวมมูเทลู & โหราศาสตร์ AI ครบวงจร</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black bg-gradient-to-r from-amber-100 via-purple-200 to-amber-300 bg-clip-text text-transparent leading-tight px-1">
          เปิดประตูแห่งโชคชะตา <br className="hidden sm:block" />
          ผสานปัญญาจักรวาล & AI หยั่งรู้
        </h1>

        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
          เลือกทำนายดวงชะตาด้วยศาสตร์ที่คุณเชื่อมั่น ไม่ว่าจะเป็น **ไพ่ยิปซี**, **ดวง 12 ราศี**, **เลขศาสตร์เบอร์มงคล**, **กราฟชีวิตดวงไทย** และ **ตารางสีมงคลฮวงจุ้ย**
        </p>

        {/* Daily Quick Oracle Interactive Drawer */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>คำทำนายออราเคิลประจำวันสั้นๆ</span>
              </span>
              <button
                onClick={handleDrawOracle}
                className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-500/30 font-semibold transition-all cursor-pointer"
              >
                🔮 สุ่มสาส์นวันนี้
              </button>
            </div>
            {randomOracle ? (
              <p className="text-sm font-medium text-slate-100 bg-slate-950 p-3 rounded-xl border border-slate-800 text-left animate-fade-in">
                {randomOracle}
              </p>
            ) : (
              <p className="text-xs text-slate-400 text-left italic">
                กดปุ่ม "สุ่มสาส์นวันนี้" เพื่อรับคำแนะนำด่วนประจำวันจากจักรวาล...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-400" />
              <span>เลือกบริการทำนายดวงชะตา</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">ศาสตร์ดูดวงยอดนิยม ปรุงแต่งด้วยคำทำนายที่สละสลวย แม่นยำ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIVINATION_SERVICES.map((service) => (
            <Link
              key={service.id}
              to={service.link}
              className={`group relative rounded-2xl p-6 bg-gradient-to-b ${service.gradient} border ${service.borderColor} transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-4xl sm:text-5xl">{service.icon}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${service.badgeColor}`}>
                    {service.badge}
                  </span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${service.textColor} group-hover:text-white transition-colors`}>
                    {service.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">{service.tagline}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{service.description}</p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                <span>เข้าสู่การทำนาย</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
