import React, { useState } from 'react';
import { DAILY_LUCKY_COLORS_TABLE, AUSPICIOUS_DIRECTIONS, FENG_SHUI_TIPS } from '../data/fengShuiData';
import { Compass, Palette, Home, CheckCircle2 } from 'lucide-react';
import { MODULE_THEMES } from '../../../constants/moduleThemes';

export const FengShuiPage: React.FC = () => {
  const theme = MODULE_THEMES['feng-shui'];
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const currentDayInfo = DAILY_LUCKY_COLORS_TABLE[selectedDayIndex];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.badgeBg} text-xs sm:text-sm font-medium`}>
          <Compass className={`w-3.5 h-3.5 ${theme.iconColor}`} />
          <span>ศาสตร์แห่งพลังงานฮวงจุ้ย & สีมงคล</span>
        </div>
        <h1 className={`text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${theme.heroGradient} bg-clip-text text-transparent px-2`}>
          ตารางสีเสื้อมงคล & พลังงานฮวงจุ้ย <span className="block sm:inline text-base sm:text-2xl opacity-90">(Daily Feng Shui)</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto px-2">
          เสริมสิริมงคลให้ชีวิตในทุกวัน ด้วยตารางสีเสื้อมงคลประจำวัน ทิศนำโชค และเคล็ดลับฮวงจุ้ยรับทรัพย์
        </p>
      </div>

      {/* Day Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {DAILY_LUCKY_COLORS_TABLE.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedDayIndex === idx
                ? `${theme.activeToggleBtn} scale-105`
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {item.dayNameTh}
          </button>
        ))}
      </div>

      {/* Daily Color Grid Card */}
      <div className={`${theme.cardBg} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className={`w-10 h-10 rounded-xl ${theme.badgeBg} flex items-center justify-center`}>
            <Palette className={`w-5 h-5 ${theme.iconColor}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-rose-200">ตารางสีมงคลประจำ{currentDayInfo.dayNameTh}</h2>
            <p className="text-xs text-slate-400">เลือกแต่งกายด้วยสีมงคลดึงดูดพลังงานบวกในแต่ละด้าน</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">💼 การงานเลื่อนขั้น:</span>
            <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyWork.join(', ')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">💰 การเงินโชคลาภ:</span>
            <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyWealth.join(', ')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-pink-500/30 space-y-2">
            <span className="text-xs font-semibold text-pink-400 flex items-center gap-1">❤️ ความรักเมตตา:</span>
            <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyLove.join(', ')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/50 space-y-2 bg-rose-950/10">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">⚠️ สีต้องห้าม/ฉุดดวง:</span>
            <div className="text-sm font-bold text-rose-300">{currentDayInfo.unluckyForbidden.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* Auspicious Directions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span>ทิศมงคลนำโชค (Auspicious Directions)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AUSPICIOUS_DIRECTIONS.map((dir, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-rose-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-base">{dir.directionTh}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-rose-300 border border-slate-700">{dir.angle}</span>
              </div>
              <span className="text-xs font-semibold text-rose-400 block">{dir.energyType}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{dir.benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feng Shui Tips */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Home className="w-5 h-5 text-rose-400" />
          <span>เคล็ดลับจัดฮวงจุ้ยบ้าน & ที่ทำงานรับทรัพย์</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FENG_SHUI_TIPS.map((tip, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="font-bold text-rose-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{tip.title}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
