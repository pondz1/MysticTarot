import React, { useState, useEffect } from 'react';
import { ZODIAC_SIGNS, getZodiacClassicPrediction } from '../data/zodiacData';
import type { ZodiacSign } from '../types/horoscope';
import { Sparkles, Star, BookOpen } from 'lucide-react';
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
      // Fallback to classic interpretation on error
      setPrediction(getZodiacClassicPrediction(sign, mode));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchHoroscope(selectedSign, timeframe, useAi);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>ดวงชะตา 12 ราศีประจำวัน & รายเดือน</span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-200 via-purple-200 to-amber-400 bg-clip-text text-transparent px-2">
          ทำนายดวงชะตา 12 ราศี <span className="block sm:inline text-base sm:text-2xl opacity-90">(Zodiac Horoscope)</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto px-2">
          อ่านทิศทางพลังงานดวงดาวและธาตุประจำราศี เพื่อเตรียมรับมือกับโอกาสและสิ่งดีๆ ในชีวิต
        </p>
      </div>

      {/* Mode Control Bar: AI vs Classic Offline Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
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

      {/* Zodiac Grid Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
        {ZODIAC_SIGNS.map((sign) => {
          const isSelected = selectedSign.id === sign.id;
          return (
            <button
              key={sign.id}
              onClick={() => handleFetchHoroscope(sign, timeframe, useAi)}
              className={`p-3 sm:p-4 rounded-xl border text-center transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/20 to-purple-900/40 border-amber-400/80 text-amber-200 shadow-lg shadow-amber-500/10 scale-105'
                  : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-2xl sm:text-3xl">{sign.symbol}</span>
              <div className="font-bold text-xs sm:text-sm">{sign.nameTh}</div>
              <div className="text-[10px] text-slate-400">{sign.dateRange}</div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 mt-1">
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
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            timeframe === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          📅 ดวงประจำวัน
        </button>
        <button
          onClick={() => {
            setTimeframe('monthly');
            handleFetchHoroscope(selectedSign, 'monthly', useAi);
          }}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            timeframe === 'monthly'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🌙 ดวงรายเดือน
        </button>
      </div>

      {/* Selected Sign Detail & Prediction Card */}
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-400/40 flex items-center justify-center text-4xl sm:text-5xl shadow-inner">
            {selectedSign.symbol}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-amber-200">{selectedSign.nameTh} ({selectedSign.nameEn})</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {selectedSign.elementTh}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">ช่วงวันที่: {selectedSign.dateRange} | ดาวครองราศี: {selectedSign.rulingPlanet}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
              {selectedSign.traits.map((trait, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ✨ {trait}
                </span>
              ))}
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
            <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 sm:p-6 rounded-xl border border-slate-800/80">
              {prediction}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              กดเลือกราศีด้านบนเพื่ออ่านคำทำนายดวงชะตาเชิงลึก
            </div>
          )}

          {/* Lucky Info Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">🔢 เลขนำโชคประจำราศี:</span>
              <span className="text-sm font-bold text-amber-300">{selectedSign.luckyNumber.join(', ')}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">🎨 สีมงคลเสริมโชค:</span>
              <span className="text-sm font-bold text-amber-300">{selectedSign.luckyColor.join(' / ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
