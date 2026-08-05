import React, { useState } from 'react';
import { analyzePhoneNumber } from '../data/numerologyData';
import type { PhoneAnalysisResult } from '../types/numerology';
import { Sparkles, Phone, Award, ShieldCheck } from 'lucide-react';

export const NumerologyPage: React.FC = () => {
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
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-medium">
          <Phone className="w-4 h-4 text-purple-400" />
          <span>ศาสตร์แห่งตัวเลข & มหาโชคลาภ</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-200 via-amber-200 to-purple-400 bg-clip-text text-transparent">
          วิเคราะห์เบอร์มงคล & เลขศาสตร์ (Numerology)
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          ตรวจสอบพลังงานตัวเลข ผลรวมมงคล และถอดรหัสคู่เลขในเบอร์โทรศัพท์ ทะเบียนรถ หรือเลขที่บ้าน
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            📱 กรอกเบอร์โทรศัพท์ หรือ ตัวเลขที่ต้องการวิเคราะห์:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="เช่น 0891234567 หรือ 3654"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono text-lg tracking-wider"
              maxLength={15}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !phoneNumber.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 hover:from-purple-500 hover:to-amber-400 text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-scale-up">
          {/* Top Grade Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-amber-950/60 border border-amber-500/30">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400 uppercase tracking-widest">ผลการวิเคราะห์เบอร์โทรศัพท์</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-300">{result.cleanDigits}</div>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-xl border border-amber-400/50">
              <span className="text-xs text-slate-400 font-medium">เกรดความมงคล:</span>
              <span className="text-3xl font-black text-amber-400">{result.overallGrade}</span>
            </div>
          </div>

          {/* Sum Value & Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/20 text-center flex flex-col justify-center">
              <span className="text-xs text-slate-400">ผลรวมตัวเลข (Sum)</span>
              <span className="text-4xl font-extrabold text-amber-300 font-mono my-1">{result.sumValue}</span>
              <span className="text-xs font-semibold text-purple-300">{result.sumMeaning.title}</span>
            </div>
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>คำทำนายผลรวมมงคล</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.sumMeaning.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {result.sumMeaning.auspiciousFor.map((item, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800/60">
                    👍 {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pair Analysis List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>ถอดรหัสคู่เลขในเบอร์โทร</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {result.pairAnalyses.map((pairItem, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {pairItem.pair}
                    </span>
                    <span className="text-xs text-amber-300 font-semibold">คะแนน {pairItem.score}/10</span>
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
