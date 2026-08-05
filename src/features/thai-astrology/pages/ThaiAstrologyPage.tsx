import React, { useState } from 'react';
import { calculateLifeGraph, DAYS_OF_WEEK } from '../data/thaiAstrologyData';
import type { ThaiLifeChartResult } from '../types/thaiAstrology';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { MODULE_THEMES } from '../../../constants/moduleThemes';

export const ThaiAstrologyPage: React.FC = () => {
  const theme = MODULE_THEMES['thai-astrology'];
  const [birthDate, setBirthDate] = useState<string>('1995-06-15');
  const [dayIndex, setDayIndex] = useState<number>(3); // Wednesday default
  const [result, setResult] = useState<ThaiLifeChartResult | null>(() => calculateLifeGraph('1995-06-15', 3));

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    const res = calculateLifeGraph(birthDate, dayIndex);
    setResult(res);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.badgeBg} text-xs sm:text-sm font-medium`}>
          <Calendar className={`w-3.5 h-3.5 ${theme.iconColor}`} />
          <span>ดวงไทยโบราณ & กราฟชีวิต 9 ช่วงอายุ</span>
        </div>
        <h1 className={`text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${theme.heroGradient} bg-clip-text text-transparent px-2`}>
          ถอดรหัสกราฟชีวิต & โหราศาสตร์ไทย <span className="block sm:inline text-base sm:text-2xl opacity-90">(Thai Life Chart)</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto px-2">
          สำรวจจังหวะขึ้นลงของชีวิตทั้ง 8 ช่วงอายุ เพื่อวางแผนอนาคตและเสริมสร้างบารมีด้วยสติ
        </p>
      </div>

      {/* Birth Input Form */}
      <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">📅 วัน/เดือน/ปี เกิด (ค.ศ.):</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">☀️ เกิดตรงกับวัน:</label>
            <select
              value={dayIndex}
              onChange={(e) => setDayIndex(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            >
              {DAYS_OF_WEEK.map((d, idx) => (
                <option key={d.id} value={idx}>
                  {d.nameTh} ({d.element})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>คำนวณกราฟชีวิต</span>
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8 animate-scale-up">
          {/* Summary Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400">ดวงชะตาผู้เกิด{result.dayOfWeekTh} ({result.elementTh})</span>
              <h3 className="text-lg font-bold text-emerald-300">{result.summaryGuidance}</h3>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold text-sm text-center">
              ⭐ ช่วงพุ่งสูงสุด: {result.peakAgeRange}
            </div>
          </div>

          {/* Interactive Life Graph Visualizer */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>ระดับดวงชะตาตามช่วงอายุ (Life Graph Curve)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-4">
              {result.lifeGraphPoints.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group">
                  <span className="text-xs font-bold text-amber-300 font-mono">{stage.score}%</span>
                  <div className="w-full bg-slate-950 h-36 rounded-xl border border-slate-800 p-1 flex items-end">
                    <div
                      style={{ height: `${stage.score}%` }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        stage.score >= 80
                          ? 'bg-gradient-to-t from-emerald-600 to-amber-400'
                          : stage.score >= 60
                          ? 'bg-gradient-to-t from-teal-700 to-emerald-400'
                          : 'bg-gradient-to-t from-slate-700 to-teal-600'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300 text-center">{stage.ageRange}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Details Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-200">เจาะลึกรายละเอียดแต่ละช่วงชีวิต</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.lifeGraphPoints.map((stage, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-300 text-sm">{stage.ageRange}: {stage.stageName}</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      คะแนนดวง {stage.score}/100
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>💼 <b>การงาน:</b> {stage.careerStatus}</p>
                    <p>💰 <b>การเงิน:</b> {stage.wealthStatus}</p>
                    <p>❤️ <b>ความรัก:</b> {stage.loveStatus}</p>
                  </div>
                  <p className="text-[11px] text-amber-300/90 pt-1">💡 <b>คำแนะนำ:</b> {stage.advice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
