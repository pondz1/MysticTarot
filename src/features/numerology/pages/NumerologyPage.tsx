import React, { useState } from 'react';
import { analyzePhoneNumber } from '../data/numerologyData';
import type { PhoneAnalysisResult } from '../types/numerology';
import { Sparkles, Hash, Award, ShieldCheck } from 'lucide-react';
import { MODULE_THEMES } from '../../../constants/moduleThemes';

export const NumerologyPage: React.FC = () => {
  const theme = MODULE_THEMES.numerology;
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [result, setResult] = useState<PhoneAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzePhoneNumber(phoneNumber);
      setResult(res);
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.badgeBg} text-xs sm:text-sm font-medium`}>
          <Hash className={`w-3.5 h-3.5 ${theme.iconColor}`} />
          <span>ศาสตร์แห่งตัวเลข & มหาโชคลาภ</span>
        </div>
        <h1 className={`text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${theme.heroGradient} bg-clip-text text-transparent px-2`}>
          วิเคราะห์ตัวเลข & เบอร์มงคล <span className="block sm:inline text-base sm:text-2xl opacity-90">(Numerology)</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto px-2">
          ถอดรหัสพลังงานความมงคลและสติปัญญาที่แฝงอยู่ในเบอร์โทรศัพท์ ทะเบียนรถ หรือเลขบ้านของคุณ
        </p>
      </div>

      {/* Input Form */}
      <div className={`${theme.cardBg} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            📱 กรอกเบอร์โทรศัพท์ หรือ ชุดตัวเลขที่ต้องการวิเคราะห์:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="เช่น 0891234567 หรือ 3654"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-lg tracking-wider"
              maxLength={15}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !phoneNumber.trim()}
              className={`px-6 py-3 rounded-xl ${theme.primaryBtn} font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer`}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>กำลังคำนวณ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>วิเคราะห์ตัวเลข</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className={`rounded-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6 animate-scale-up ${theme.cardBg}`}>
          {/* Top Grade Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-teal-950/60 border border-cyan-500/30">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase tracking-widest">ผลการวิเคราะห์เบอร์โทรศัพท์</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-300">{result.cleanDigits}</div>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-cyan-400/50">
              <span className="text-xs text-slate-400 font-medium">เกรดความมงคล:</span>
              <span className="text-3xl font-black text-cyan-400">{result.overallGrade}</span>
            </div>
          </div>

          {/* Sum Value & Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-center flex flex-col justify-center">
              <span className="text-xs text-slate-400">ผลรวมตัวเลข (Sum)</span>
              <span className="text-4xl font-extrabold text-cyan-300 font-mono my-1">{result.sumValue}</span>
              <span className="text-xs font-semibold text-cyan-300">{result.sumMeaning.title}</span>
            </div>
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className={`flex items-center gap-2 ${theme.iconColor} font-semibold text-sm`}>
                <ShieldCheck className={`w-4 h-4 ${theme.iconColor}`} />
                <span>คำทำนายผลรวมมงคล</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.sumMeaning.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {result.sumMeaning.auspiciousFor.map((item, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-800/60">
                    👍 {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pair Analysis List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Award className={`w-5 h-5 ${theme.iconColor}`} />
              <span>ถอดรหัสคู่เลขในเบอร์โทร</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {result.pairAnalyses.map((pairItem, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-mono font-bold ${theme.iconColor} bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20`}>
                      {pairItem.pair}
                    </span>
                    <span className="text-xs text-cyan-300 font-semibold">คะแนน {pairItem.score}/10</span>
                  </div>
                  <p className="text-xs text-slate-300">{pairItem.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
