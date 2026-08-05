export interface ModuleTheme {
  id: 'home' | 'tarot' | 'horoscope' | 'numerology' | 'thai-astrology' | 'feng-shui';
  nameTh: string;
  nameEn: string;
  primaryColor: string;
  accentGlow: string;
  heroGradient: string;
  borderGlow: string;
  activeNavStyle: string;
  iconColor: string;
  badgeBg: string;
  cardBg: string;
  primaryBtn: string;
  secondaryBtn: string;
  activeToggleBtn: string;
}

export const MODULE_THEMES: Record<string, ModuleTheme> = {
  home: {
    id: 'home',
    nameTh: 'หน้าแรก',
    nameEn: 'Home',
    primaryColor: 'amber',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    heroGradient: 'from-amber-400 via-purple-400 to-indigo-400',
    borderGlow: 'border-amber-400/50',
    activeNavStyle: 'bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    cardBg: 'bg-slate-900/80 border-amber-500/30',
    primaryBtn: 'bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-amber-500/20',
    secondaryBtn: 'bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-sm',
    activeToggleBtn: 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md',
  },
  tarot: {
    id: 'tarot',
    nameTh: 'ไพ่ยิปซี',
    nameEn: 'Tarot Cards',
    primaryColor: 'amber',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    heroGradient: 'from-amber-300 via-amber-400 to-purple-400',
    borderGlow: 'border-amber-400/50',
    activeNavStyle: 'bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    cardBg: 'glass-panel-gold border-amber-400/40',
    primaryBtn: 'bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-amber-500/20',
    secondaryBtn: 'bg-amber-500/20 text-amber-200 border-amber-400/60 shadow-sm',
    activeToggleBtn: 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md',
  },
  horoscope: {
    id: 'horoscope',
    nameTh: '12 ราศี',
    nameEn: 'Zodiac Horoscope',
    primaryColor: 'purple',
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    heroGradient: 'from-purple-300 via-indigo-400 to-pink-400',
    borderGlow: 'border-purple-400/50',
    activeNavStyle: 'bg-purple-500/25 text-purple-200 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    iconColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    cardBg: 'bg-slate-900/90 border-purple-500/40 shadow-purple-900/20',
    primaryBtn: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20',
    secondaryBtn: 'bg-purple-500/20 text-purple-200 border-purple-400/60 shadow-sm',
    activeToggleBtn: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md',
  },
  numerology: {
    id: 'numerology',
    nameTh: 'เลขศาสตร์',
    nameEn: 'Numerology',
    primaryColor: 'cyan',
    accentGlow: 'rgba(6, 182, 212, 0.3)',
    heroGradient: 'from-cyan-300 via-teal-400 to-emerald-400',
    borderGlow: 'border-cyan-400/50',
    activeNavStyle: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    iconColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    cardBg: 'bg-slate-900/90 border-cyan-500/40 shadow-cyan-900/20',
    primaryBtn: 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-500/20',
    secondaryBtn: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60 shadow-sm',
    activeToggleBtn: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md',
  },
  'thai-astrology': {
    id: 'thai-astrology',
    nameTh: 'กราฟชีวิต',
    nameEn: 'Thai Life Graph',
    primaryColor: 'rose',
    accentGlow: 'rgba(244, 63, 94, 0.3)',
    heroGradient: 'from-rose-300 via-amber-400 to-orange-400',
    borderGlow: 'border-rose-400/50',
    activeNavStyle: 'bg-rose-500/25 text-rose-200 border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    iconColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    cardBg: 'bg-slate-900/90 border-rose-500/40 shadow-rose-900/20',
    primaryBtn: 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-500/20',
    secondaryBtn: 'bg-rose-500/20 text-rose-200 border-rose-400/60 shadow-sm',
    activeToggleBtn: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md',
  },
  'feng-shui': {
    id: 'feng-shui',
    nameTh: 'ฮวงจุ้ย',
    nameEn: 'Feng Shui',
    primaryColor: 'emerald',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    heroGradient: 'from-emerald-300 via-teal-400 to-green-400',
    borderGlow: 'border-emerald-400/50',
    activeNavStyle: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    cardBg: 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-900/20',
    primaryBtn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20',
    secondaryBtn: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-sm',
    activeToggleBtn: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md',
  },
};
