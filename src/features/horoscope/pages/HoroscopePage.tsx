import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ZODIAC_SIGNS,
  getZodiacClassicPrediction,
  getZodiacAspectScores,
  findZodiacSignByBirthdate,
  ELEMENT_STYLE_MAP,
} from '../data/zodiacData';
import type { ZodiacSign } from '../types/horoscope';
import {
  Sparkles,
  Star,
  BookOpen,
  Calendar,
  Moon,
  Search,
  TrendingUp,
  Heart,
  Briefcase,
  Coins,
  Stethoscope,
  Hash,
  Palette,
  Feather,
  Copy,
  Check,
} from 'lucide-react';
import type { ApiSettings } from '../../tarot/types/tarot';
import { analyzeZodiacHoroscope } from '../../../services/aiService';
import { MODULE_THEMES } from '../../../constants/moduleThemes';

interface HoroscopePageProps {
  apiSettings: ApiSettings;
}

export const HoroscopePage: React.FC<HoroscopePageProps> = ({ apiSettings }) => {
  const theme = MODULE_THEMES.horoscope;
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');
  const [useAi, setUseAi] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Birthdate Finder state
  const [birthMonth, setBirthMonth] = useState<number>(6);
  const [birthDay, setBirthDay] = useState<number>(15);
  const [showFinder, setShowFinder] = useState<boolean>(false);

  // Copy prediction state
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyPrediction = () => {
    if (!prediction) return;
    navigator.clipboard.writeText(prediction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleFetchHoroscope = async (
    sign: ZodiacSign = selectedSign,
    mode: 'daily' | 'monthly' = timeframe,
    withAi: boolean = useAi
  ) => {
    if (isLoading) return; // Prevent spamming API requests while processing
    setSelectedSign(sign);
    if (!withAi) {
      // Classic Offline Interpretation (Instant 0ms response)
      const classicText = getZodiacClassicPrediction(sign, mode);
      setPrediction(classicText);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await analyzeZodiacHoroscope(sign.nameTh, sign.elementTh, mode, apiSettings);
      setPrediction(res);
    } catch (e) {
      setPrediction(getZodiacClassicPrediction(sign, mode));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindZodiac = (e: React.FormEvent) => {
    e.preventDefault();
    const foundSign = findZodiacSignByBirthdate(birthMonth, birthDay);
    setSelectedSign(foundSign);
    setShowFinder(false);
    if (!useAi) {
      setPrediction(getZodiacClassicPrediction(foundSign, timeframe));
    } else {
      handleFetchHoroscope(foundSign, timeframe, true);
    }
    if (resultCardRef.current) {
      resultCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handleFetchHoroscope(selectedSign, timeframe, false);
  }, []);

  const aspectScores = getZodiacAspectScores(selectedSign, timeframe);
  const activeElementStyle = ELEMENT_STYLE_MAP[selectedSign.element];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full ${theme.badgeBg} text-xs sm:text-sm font-medium`}>
          <Star className={`w-3.5 h-3.5 ${theme.iconColor}`} />
          <span>ดวงชะตา 12 ราศีประจำวัน & รายเดือน</span>
        </div>
        <h1 className={`text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${theme.heroGradient} bg-clip-text text-transparent px-2`}>
          ทำนายดวงชะตา 12 ราศี <span className="block sm:inline text-base sm:text-2xl opacity-90">(Zodiac Horoscope)</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto px-2">
          อ่านทิศทางพลังงานดวงดาวและธาตุประจำราศี เพื่อเตรียมรับมือกับโอกาสและสิ่งดีๆ ในชีวิต
        </p>

        {/* Quick Birthdate Zodiac Finder Toggle Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowFinder(!showFinder)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 hover:text-amber-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>ค้นหาราศีของคุณจากวันเกิด</span>
          </button>
        </div>
      </div>

      {/* Birthdate Zodiac Finder Card Drawer */}
      {showFinder && (
        <form
          onSubmit={handleFindZodiac}
          className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-4 animate-scale-up"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>ระบุวันเกิดของคุณเพื่อค้นหาราศีอัตโนมัติ:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">วันที่เกิด:</label>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    วันที่ {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">เดือนเกิด:</label>
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none"
              >
                {[
                  'มกราคม',
                  'กุมภาพันธ์',
                  'มีนาคม',
                  'เมษายน',
                  'พฤษภาคม',
                  'มิถุนายน',
                  'กรกฎาคม',
                  'สิงหาคม',
                  'กันยายน',
                  'ตุลาคม',
                  'พฤศจิกายน',
                  'ธันวาคม',
                ].map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={`sm:mt-5 p-2.5 rounded-xl ${theme.primaryBtn} font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <Search className="w-4 h-4" />
              <span>ค้นหาราศีทันที</span>
            </button>
          </div>
        </form>
      )}

      {/* Mode Control Bar: AI vs Classic Offline Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
          <span className={`font-semibold ${theme.iconColor}`}>เลือกโหมดทำนาย:</span>
          <span className="text-slate-400">
            {isLoading
              ? 'AI กำลังประมวลผลคำทำนาย... กรุณารอสักครู่'
              : useAi
                ? '(โหมด AI ประมวลผลลึกซึ้ง)'
                : '(โหมดคลาสสิก ทำนายทันที ไม่ใช้ AI)'}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setUseAi(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLoading
                ? 'opacity-50 cursor-not-allowed text-slate-500'
                : useAi
                  ? `${theme.secondaryBtn} cursor-pointer`
                  : 'text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${theme.iconColor}`} />
            <span>โหมด AI</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setUseAi(false);
              setPrediction(getZodiacClassicPrediction(selectedSign, timeframe));
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLoading
                ? 'opacity-50 cursor-not-allowed text-slate-500'
                : !useAi
                  ? `${theme.secondaryBtn} cursor-pointer`
                  : 'text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${theme.iconColor}`} />
            <span>โหมดคลาสสิก</span>
          </button>
        </div>
      </div>

      {/* Zodiac Grid Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5">
        {ZODIAC_SIGNS.map((sign) => {
          const isSelected = selectedSign.id === sign.id;
          const elementStyle = ELEMENT_STYLE_MAP[sign.element];
          return (
            <button
              key={sign.id}
              disabled={isLoading}
              onClick={() => {
                setSelectedSign(sign);
                if (!useAi) {
                  setPrediction(getZodiacClassicPrediction(sign, timeframe));
                }
              }}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-1.5 group ${
                isLoading
                  ? 'opacity-60 cursor-not-allowed'
                  : isSelected
                    ? `${elementStyle.activeBg} ${elementStyle.activeBorder} ${elementStyle.glow} scale-105 shadow-xl cursor-pointer`
                    : `${elementStyle.bg} ${elementStyle.border} text-slate-300 cursor-pointer`
              }`}
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-purple-400/50 shadow-lg shadow-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 relative bg-slate-950">
                <img
                  src={`/zodiac/${sign.id}.png`}
                  alt={sign.nameTh}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const sibling = target.nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-600/30 text-purple-300 font-serif text-2xl items-center justify-center">
                  {sign.symbol}
                </div>
              </div>
              <div className={`font-bold text-xs sm:text-sm ${isSelected ? elementStyle.text : 'text-slate-100'}`}>
                {sign.nameTh}
              </div>
              <div className="text-[10px] text-slate-400">{sign.dateRange}</div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border mt-0.5 font-medium ${elementStyle.badgeBg}`}>
                {sign.elementTh}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeframe Toggle Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            disabled={isLoading}
            onClick={() => {
              setTimeframe('daily');
              if (!useAi) {
                setPrediction(getZodiacClassicPrediction(selectedSign, 'daily'));
              }
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isLoading
                ? 'opacity-50 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500'
                : timeframe === 'daily'
                  ? `${theme.activeToggleBtn} cursor-pointer`
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <Calendar className={`w-4 h-4 ${theme.iconColor}`} />
            <span>ดวงประจำวัน</span>
          </button>
          <button
            disabled={isLoading}
            onClick={() => {
              setTimeframe('monthly');
              if (!useAi) {
                setPrediction(getZodiacClassicPrediction(selectedSign, 'monthly'));
              }
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isLoading
                ? 'opacity-50 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500'
                : timeframe === 'monthly'
                  ? `${theme.activeToggleBtn} cursor-pointer`
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <Moon className={`w-4 h-4 ${theme.iconColor}`} />
            <span>ดวงรายเดือน</span>
          </button>
        </div>

        {useAi && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleFetchHoroscope(selectedSign, timeframe, true)}
            className={`px-5 py-2.5 rounded-xl ${theme.primaryBtn} font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>เริ่มทำนายดวง{selectedSign.nameTh} ด้วย AI</span>
          </button>
        )}
      </div>

      {/* Selected Sign Detail & Prediction Card */}
      <div
        ref={resultCardRef}
        className={`rounded-2xl p-4 sm:p-8 backdrop-blur-xl space-y-6 ${theme.cardBg}`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/30 border border-purple-400/40 flex items-center justify-center overflow-hidden shadow-xl shrink-0 relative">
            <img
              src={`/zodiac/${selectedSign.id}.png`}
              alt={selectedSign.nameTh}
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = 'block';
              }}
            />
            <span className="hidden text-4xl sm:text-5xl">{selectedSign.symbol}</span>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-purple-200">{selectedSign.nameTh} ({selectedSign.nameEn})</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeElementStyle.badgeBg}`}>
                {selectedSign.elementTh}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">ช่วงวันที่: {selectedSign.dateRange} | ดาวครองราศี: {selectedSign.rulingPlanet}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
              {selectedSign.traits.map((trait, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Sparkles className={`w-3 h-3 ${theme.iconColor} shrink-0`} />
                  <span>{trait}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Aspect Rating Bars (คะแนนดวงมงคล 4 ด้าน) */}
        <div className="space-y-3 bg-slate-950/70 p-4 sm:p-6 rounded-xl border border-slate-800/80">
          <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${theme.iconColor}`}>
            <TrendingUp className={`w-4 h-4 ${theme.iconColor}`} />
            <span>ระดับคะแนนดวงชะตามงคล 4 ด้าน ({timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Love */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-pink-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>ความรัก & ความสัมพันธ์:</span>
                </span>
                <span className="text-pink-300 font-mono">{aspectScores.love}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div style={{ width: `${aspectScores.love}%` }} className="bg-gradient-to-r from-pink-600 to-rose-400 h-full rounded-full transition-all duration-500" />
              </div>
            </div>

            {/* Work */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>การงาน & การเรียน:</span>
                </span>
                <span className="text-blue-300 font-mono">{aspectScores.work}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div style={{ width: `${aspectScores.work}%` }} className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500" />
              </div>
            </div>

            {/* Finance */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>การเงิน & โชคลาภ:</span>
                </span>
                <span className="text-amber-300 font-mono">{aspectScores.finance}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div style={{ width: `${aspectScores.finance}%` }} className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500" />
              </div>
            </div>

            {/* Health */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>สุขภาพ & จิตใจ:</span>
                </span>
                <span className="text-emerald-300 font-mono">{aspectScores.health}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div style={{ width: `${aspectScores.health}%` }} className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${theme.iconColor} font-semibold text-lg`}>
              <Sparkles className={`w-5 h-5 ${theme.iconColor} animate-pulse`} />
              <span>คำทำนายดวงชะตา{timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'}</span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {useAi ? 'ผลทำนาย AI' : 'โหมดคลาสสิก (ไม่ต้องใช้อินเทอร์เน็ต/AI)'}
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className={`w-8 h-8 ${theme.iconColor} animate-spin`} />
              <p className="text-sm">กำลังประมวลผลคำทำนาย...</p>
            </div>
          ) : prediction ? (
            <div className="relative rounded-2xl p-5 sm:p-7 bg-slate-900/95 border border-purple-500/40 shadow-2xl shadow-purple-900/20 overflow-hidden space-y-4 animate-fade-in">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/30 pb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Feather className={`w-5 h-5 ${theme.iconColor} shrink-0`} />
                  <h3 className="text-base sm:text-lg font-bold font-serif text-purple-200 truncate">
                    บทวิเคราะห์ดวงชะตา{selectedSign.nameTh} ({timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPrediction}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${theme.secondaryBtn} transition-all cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-auto`}
                  title="คัดลอกคำทำนาย"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกคำทำนาย'}</span>
                </button>
              </div>

              {/* Formatted Markdown Content via ReactMarkdown */}
              <div className="prose prose-invert max-w-none font-prompt text-slate-100 text-sm sm:text-base leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => {
                      const textStr = typeof children === 'string' ? children.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/gu, '').trim() : String(children || '');
                      let iconComp = <Sparkles className={`w-4 h-4 ${theme.iconColor} shrink-0`} />;
                      let colorClass = 'text-purple-300 border-purple-500/30';
                      if (textStr.includes('งาน') || textStr.includes('เรียน')) {
                        iconComp = <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />;
                        colorClass = 'text-blue-300 border-blue-500/30';
                      } else if (textStr.includes('เงิน') || textStr.includes('โชค')) {
                        iconComp = <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
                        colorClass = 'text-amber-300 border-amber-500/30';
                      } else if (textStr.includes('รัก')) {
                        iconComp = <Heart className="w-4 h-4 text-pink-400 shrink-0" />;
                        colorClass = 'text-pink-300 border-pink-500/30';
                      } else if (textStr.includes('สุขภาพ') || textStr.includes('กาย')) {
                        iconComp = <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />;
                        colorClass = 'text-emerald-300 border-emerald-500/30';
                      }
                      return (
                        <h2 className={`text-base sm:text-lg font-bold ${colorClass} mt-6 mb-3 pb-1.5 border-b flex items-center gap-2 tracking-wide`}>
                          {iconComp}
                          <span>{textStr}</span>
                        </h2>
                      );
                    },
                    h2: ({ children }) => {
                      const textStr = typeof children === 'string' ? children.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/gu, '').trim() : String(children || '');
                      let iconComp = <Sparkles className={`w-4 h-4 ${theme.iconColor} shrink-0`} />;
                      let colorClass = 'text-purple-300 border-purple-500/30';
                      if (textStr.includes('งาน') || textStr.includes('เรียน')) {
                        iconComp = <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />;
                        colorClass = 'text-blue-300 border-blue-500/30';
                      } else if (textStr.includes('เงิน') || textStr.includes('โชค')) {
                        iconComp = <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
                        colorClass = 'text-amber-300 border-amber-500/30';
                      } else if (textStr.includes('รัก')) {
                        iconComp = <Heart className="w-4 h-4 text-pink-400 shrink-0" />;
                        colorClass = 'text-pink-300 border-pink-500/30';
                      } else if (textStr.includes('สุขภาพ') || textStr.includes('กาย')) {
                        iconComp = <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />;
                        colorClass = 'text-emerald-300 border-emerald-500/30';
                      }
                      return (
                        <h2 className={`text-base sm:text-lg font-bold ${colorClass} mt-6 mb-3 pb-1.5 border-b flex items-center gap-2 tracking-wide`}>
                          {iconComp}
                          <span>{textStr}</span>
                        </h2>
                      );
                    },
                    h3: ({ children }) => (
                      <h3 className="text-sm sm:text-base font-bold text-indigo-300 mt-4 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>{children}</span>
                      </h3>
                    ),
                    p: ({ children }) => <p className="mb-3.5 leading-relaxed text-slate-100 font-normal">{children}</p>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {children}
                      </strong>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-amber-400 pl-4 py-3 my-4 text-amber-200 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-pink-500/15 rounded-r-xl border border-indigo-500/30 shadow-md">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1.5 text-slate-100">{children}</ul>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                  }}
                >
                  {prediction}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              กดเลือกราศีด้านบนเพื่ออ่านคำทำนายดวงชะตาเชิงลึก
            </div>
          )}

          {/* Lucky Info Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Hash className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
                <span>เลขนำโชคประจำราศี:</span>
              </span>
              <span className="text-sm font-bold text-purple-300">{selectedSign.luckyNumber.join(', ')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Palette className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
                <span>สีมงคลเสริมโชค:</span>
              </span>
              <span className="text-sm font-bold text-purple-300">{selectedSign.luckyColor.join(' / ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
