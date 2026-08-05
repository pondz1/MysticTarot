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
} from 'lucide-react';
import type { ApiSettings } from '../../tarot/types/tarot';
import { analyzeZodiacHoroscope } from '../../../services/aiService';

interface HoroscopePageProps {
  apiSettings: ApiSettings;
}

export const HoroscopePage: React.FC<HoroscopePageProps> = ({ apiSettings }) => {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');
  const [useAi, setUseAi] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Birthdate Finder state
  const [birthMonth, setBirthMonth] = useState<number>(6);
  const [birthDay, setBirthDay] = useState<number>(15);
  const [showFinder, setShowFinder] = useState<boolean>(false);

  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleFetchHoroscope = async (
    sign: ZodiacSign = selectedSign,
    mode: 'daily' | 'monthly' = timeframe,
    withAi: boolean = useAi
  ) => {
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
    handleFetchHoroscope(foundSign, timeframe, useAi);
    if (resultCardRef.current) {
      resultCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handleFetchHoroscope(selectedSign, timeframe, useAi);
  }, []);

  const aspectScores = getZodiacAspectScores(selectedSign, timeframe);
  const activeElementStyle = ELEMENT_STYLE_MAP[selectedSign.element];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>ดวงชะตา 12 ราศีประจำวัน & รายเดือน</span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-200 via-purple-200 to-amber-400 bg-clip-text text-transparent px-2">
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
            <span>🔍 ค้นหาราศีของคุณจากวันเกิด</span>
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
              className="sm:mt-5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
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
          <span className="font-semibold text-amber-300">เลือกโหมดทำนาย:</span>
          <span className="text-slate-400">
            {useAi ? '(โหมด AI ประมวลผลลึกซึ้ง)' : '(โหมดคลาสสิก ทำนายทันที ไม่ใช้ AI)'}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setUseAi(true);
              handleFetchHoroscope(selectedSign, timeframe, true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              useAi
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>✨ โหมด AI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUseAi(false);
              handleFetchHoroscope(selectedSign, timeframe, false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !useAi
                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>📜 โหมดคลาสสิก (ไม่ใช้ AI)</span>
          </button>
        </div>
      </div>

      {/* Zodiac Grid Selection (With Element Color Accents) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
        {ZODIAC_SIGNS.map((sign) => {
          const isSelected = selectedSign.id === sign.id;
          const elementStyle = ELEMENT_STYLE_MAP[sign.element];
          return (
            <button
              key={sign.id}
              onClick={() => handleFetchHoroscope(sign, timeframe, useAi)}
              className={`p-3 sm:p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer ${
                isSelected
                  ? `${elementStyle.activeBg} ${elementStyle.activeBorder} ${elementStyle.glow} scale-105 shadow-xl`
                  : `${elementStyle.bg} ${elementStyle.border} text-slate-300`
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex items-center justify-center relative">
                <img
                  src={`/zodiac/${sign.id}.png`}
                  alt={sign.nameTh}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const sibling = target.nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = 'block';
                  }}
                />
                <span className="hidden text-2xl sm:text-3xl">{sign.symbol}</span>
              </div>
              <div className={`font-bold text-xs sm:text-sm ${isSelected ? elementStyle.text : 'text-slate-200'}`}>
                {sign.nameTh}
              </div>
              <div className="text-[10px] text-slate-400">{sign.dateRange}</div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border mt-1 font-medium ${elementStyle.badgeBg}`}>
                {sign.elementTh}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeframe Toggle Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            setTimeframe('daily');
            handleFetchHoroscope(selectedSign, 'daily', useAi);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            timeframe === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-300" />
          <span>ดวงประจำวัน</span>
        </button>
        <button
          onClick={() => {
            setTimeframe('monthly');
            handleFetchHoroscope(selectedSign, 'monthly', useAi);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            timeframe === 'monthly'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Moon className="w-4 h-4 text-purple-300" />
          <span>ดวงรายเดือน</span>
        </button>
      </div>

      {/* Selected Sign Detail & Prediction Card */}
      <div
        ref={resultCardRef}
        className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-400/40 flex items-center justify-center overflow-hidden shadow-xl shrink-0 relative">
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
              <h2 className="text-2xl font-bold text-amber-200">{selectedSign.nameTh} ({selectedSign.nameEn})</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeElementStyle.badgeBg}`}>
                {selectedSign.elementTh}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">ช่วงวันที่: {selectedSign.dateRange} | ดาวครองราศี: {selectedSign.rulingPlanet}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
              {selectedSign.traits.map((trait, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{trait}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Aspect Rating Bars (คะแนนดวงมงคล 4 ด้าน) */}
        <div className="space-y-3 bg-slate-950/70 p-4 sm:p-6 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
            <TrendingUp className="w-4 h-4 text-amber-400" />
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
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-lg">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>คำทำนายดวงชะตา{timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'}</span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {useAi ? '✨ ผลทำนาย AI' : '📜 โหมดคลาสสิก (ไม่ต้องใช้อินเทอร์เน็ต/AI)'}
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm">กำลังประมวลผลคำทำนาย...</p>
            </div>
          ) : prediction ? (
            <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed bg-slate-950/60 p-4 sm:p-6 rounded-xl border border-slate-800/80">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{prediction}</ReactMarkdown>
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
                <Hash className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>เลขนำโชคประจำราศี:</span>
              </span>
              <span className="text-sm font-bold text-amber-300">{selectedSign.luckyNumber.join(', ')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>สีมงคลเสริมโชค:</span>
              </span>
              <span className="text-sm font-bold text-amber-300">{selectedSign.luckyColor.join(' / ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
