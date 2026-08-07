export type ModuleId = 'home' | 'tarot' | 'horoscope' | 'numerology' | 'thai-astrology' | 'feng-shui';

export interface ModuleTheme {
  id: ModuleId;
  nameTh: string;
  nameEn: string;
  primaryColor: string;
  secondaryColor: string;
  accentGlow: string;
  heroGradient: string;
  borderGlow: string;
  activeNavStyle: string;
  iconColor: string;
  secondaryIconColor: string;
  badgeBg: string;
  cardBg: string;
  subtleGradient: string;
  tagBg: string;
  primaryBtn: string;
  secondaryBtn: string;
  activeToggleBtn: string;
}

export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = {
  home: {
    id: 'home',
    nameTh: 'หน้าแรก',
    nameEn: 'Home',
    primaryColor: 'amber',
    secondaryColor: 'purple',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    heroGradient: 'from-amber-400 via-purple-400 to-indigo-400',
    borderGlow: 'border-amber-400/50',
    activeNavStyle: 'bg-amber-500/15 text-amber-100 border-amber-400/40',
    iconColor: 'text-amber-400',
    secondaryIconColor: 'text-purple-400',
    badgeBg: 'bg-amber-500/10 border border-amber-500/25 text-amber-200',
    cardBg: 'bg-slate-900/70 border-slate-700/80',
    subtleGradient: 'from-slate-950 via-slate-900 to-slate-950',
    tagBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    primaryBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm',
    secondaryBtn: 'bg-slate-900 text-amber-100 border border-amber-400/35',
    activeToggleBtn: 'bg-amber-500 text-slate-950 shadow-sm',
  },
  tarot: {
    id: 'tarot',
    nameTh: 'ไพ่ยิปซี',
    nameEn: 'Tarot Cards',
    primaryColor: 'amber',
    secondaryColor: 'purple',
    accentGlow: 'rgba(245, 158, 11, 0.12)',
    heroGradient: 'from-amber-200 to-amber-100',
    borderGlow: 'border-amber-400/35',
    activeNavStyle: 'bg-amber-500/15 text-amber-100 border-amber-400/40',
    iconColor: 'text-amber-400',
    secondaryIconColor: 'text-purple-400',
    badgeBg: 'bg-amber-500/10 border border-amber-500/25 text-amber-200',
    cardBg: 'bg-slate-900/80 border-amber-500/25',
    subtleGradient: 'from-slate-950 via-slate-900 to-slate-950',
    tagBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    primaryBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm',
    secondaryBtn: 'bg-slate-900 text-amber-100 border border-amber-400/35',
    activeToggleBtn: 'bg-amber-500 text-slate-950 shadow-sm',
  },
  horoscope: {
    id: 'horoscope',
    nameTh: '12 ราศี',
    nameEn: 'Zodiac Horoscope',
    primaryColor: 'purple',
    secondaryColor: 'indigo',
    accentGlow: 'rgba(168, 85, 247, 0.12)',
    heroGradient: 'from-purple-200 to-indigo-200',
    borderGlow: 'border-purple-400/35',
    activeNavStyle: 'bg-purple-500/15 text-purple-100 border-purple-400/40',
    iconColor: 'text-purple-400',
    secondaryIconColor: 'text-pink-400',
    badgeBg: 'bg-purple-500/10 border border-purple-500/25 text-purple-200',
    cardBg: 'bg-slate-900/80 border-purple-500/25',
    subtleGradient: 'from-slate-950 via-slate-900 to-slate-950',
    tagBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    primaryBtn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm',
    secondaryBtn: 'bg-slate-900 text-purple-100 border border-purple-400/35',
    activeToggleBtn: 'bg-purple-600 text-white shadow-sm',
  },
  numerology: {
    id: 'numerology',
    nameTh: 'เลขศาสตร์',
    nameEn: 'Numerology',
    primaryColor: 'cyan',
    secondaryColor: 'teal',
    accentGlow: 'rgba(6, 182, 212, 0.12)',
    heroGradient: 'from-cyan-200 to-teal-200',
    borderGlow: 'border-cyan-400/35',
    activeNavStyle: 'bg-cyan-500/15 text-cyan-100 border-cyan-400/40',
    iconColor: 'text-cyan-400',
    secondaryIconColor: 'text-teal-400',
    badgeBg: 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-200',
    cardBg: 'bg-slate-900/80 border-cyan-500/25',
    subtleGradient: 'from-slate-950 via-slate-900 to-slate-950',
    tagBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    primaryBtn: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm',
    secondaryBtn: 'bg-slate-900 text-cyan-100 border border-cyan-400/35',
    activeToggleBtn: 'bg-cyan-600 text-white shadow-sm',
  },
  'thai-astrology': {
    id: 'thai-astrology',
    nameTh: 'กราฟชีวิต',
    nameEn: 'Thai Life Graph',
    primaryColor: 'rose',
    secondaryColor: 'amber',
    accentGlow: 'rgba(244, 63, 94, 0.12)',
    heroGradient: 'from-rose-200 to-amber-200',
    borderGlow: 'border-rose-400/35',
    activeNavStyle: 'bg-rose-500/15 text-rose-100 border-rose-400/40',
    iconColor: 'text-rose-400',
    secondaryIconColor: 'text-amber-400',
    badgeBg: 'bg-rose-500/10 border border-rose-500/25 text-rose-200',
    cardBg: 'bg-slate-900/80 border-rose-500/25',
    subtleGradient: 'from-slate-950 via-slate-900 to-slate-950',
    tagBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    primaryBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm',
    secondaryBtn: 'bg-slate-900 text-rose-100 border border-rose-400/35',
    activeToggleBtn: 'bg-rose-600 text-white shadow-sm',
  },
  'feng-shui': {
    id: 'feng-shui',
    nameTh: 'ฮวงจุ้ย',
    nameEn: 'Feng Shui',
    primaryColor: 'emerald',
    secondaryColor: 'teal',
    accentGlow: 'rgba(16, 185, 129, 0.12)',
    heroGradient: 'from-emerald-200 to-teal-200',
    borderGlow: 'border-emerald-400/35',
    activeNavStyle: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/40',
    iconColor: 'text-emerald-400',
    secondaryIconColor: 'text-teal-400',
    badgeBg: 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-200',
    cardBg: 'bg-slate-900/80 border-emerald-500/25',
    subtleGradient: 'from-slate-950 via-slate-900 to-slate-950',
    tagBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm',
    secondaryBtn: 'bg-slate-900 text-emerald-100 border border-emerald-400/35',
    activeToggleBtn: 'bg-emerald-600 text-white shadow-sm',
  },
};

export const getModuleThemeByPath = (pathname: string): ModuleTheme => {
  if (pathname.startsWith('/tarot')) return MODULE_THEMES.tarot;
  if (pathname.startsWith('/horoscope')) return MODULE_THEMES.horoscope;
  if (pathname.startsWith('/numerology')) return MODULE_THEMES.numerology;
  if (pathname.startsWith('/thai-astrology')) return MODULE_THEMES['thai-astrology'];
  if (pathname.startsWith('/feng-shui')) return MODULE_THEMES['feng-shui'];
  return MODULE_THEMES.home;
};

