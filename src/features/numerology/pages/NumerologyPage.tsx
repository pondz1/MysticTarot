import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzePhoneNumber, analyzeNumerologyInput } from '../data/numerologyData';
import type { PhoneAnalysisResult } from '../types/numerology';
import {
  Sparkles,
  Hash,
  Award,
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  TrendingUp,
  Phone,
  Car,
  Home as HomeIcon,
  CreditCard,
  Zap,
  Coins,
  Heart,
  Briefcase,
} from 'lucide-react';
import type { ApiSettings } from '../../tarot/types/tarot';
import { analyzeNumerology, generateFallbackNumerology } from '../../../services/aiService';
import { MODULE_THEMES } from '../../../constants/moduleThemes';

interface NumerologyPageProps {
  apiSettings?: ApiSettings;
}

const SAMPLE_NUMBERS = [
  { label: 'เบอร์มหาเสน่ห์ค้าขาย', number: '0958889999', icon: Sparkles, type: 'phone' as const },
  { label: 'เบอร์มหาเศรษฐีโชคลาภ', number: '0624567890', icon: Coins, type: 'phone' as const },
  { label: 'เบอร์ผู้ใหญ่อุปถัมภ์', number: '0891545636', icon: BookOpen, type: 'phone' as const },
  { label: 'ทะเบียนรถนำโชค', number: '9กข3654', icon: Car, type: 'car' as const },
  { label: 'บ้านเลขที่รับทรัพย์', number: '88/45', icon: HomeIcon, type: 'house' as const },
];

export const NumerologyPage: React.FC<NumerologyPageProps> = ({ apiSettings }) => {
  const theme = MODULE_THEMES.numerology;
  const [phoneNumber, setPhoneNumber] = useState<string>('0958889999');
  const [numberType, setNumberType] = useState<'phone' | 'car' | 'house' | 'card'>('phone');
  const [useAi, setUseAi] = useState<boolean>(false);
  const [result, setResult] = useState<PhoneAnalysisResult | null>(() => analyzePhoneNumber('0958889999'));
  const [predictionText, setPredictionText] = useState<string>(() =>
    generateFallbackNumerology('0958889999', 75, 'เลขมหาจักรพรรดิแห่งสติปัญญาและโชคลาภ')
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleCopyPrediction = () => {
    if (!predictionText && !result) return;
    const textToCopy = predictionText || `${result?.sumMeaning.title}\n${result?.sumMeaning.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async (
    numStr: string = phoneNumber,
    withAi: boolean = useAi
  ) => {
    if (!numStr.trim() || isAnalyzing) return;

    const mathResult = analyzePhoneNumber(numStr);
    setResult(mathResult);

    if (!mathResult) {
      setPredictionText('');
      return;
    }

    if (!withAi) {
      const fallback = generateFallbackNumerology(
        mathResult.cleanDigits || numStr,
        mathResult.sumValue,
        mathResult.sumMeaning.title
      );
      setPredictionText(fallback);
      return;
    }

    setIsAnalyzing(true);
    try {
      const pairsSummary = mathResult.pairAnalyses
        .map((p) => `${p.pair} (${p.meaning})`)
        .slice(0, 5)
        .join(', ');

      const aiText = await analyzeNumerology(
        mathResult.cleanDigits || numStr,
        mathResult.sumValue,
        mathResult.sumMeaning.title,
        pairsSummary,
        apiSettings || { apiKey: '', baseUrl: '', model: '' }
      );
      setPredictionText(aiText);
    } catch (err) {
      console.error(err);
      setPredictionText(
        generateFallbackNumerology(
          mathResult.cleanDigits || numStr,
          mathResult.sumValue,
          mathResult.sumMeaning.title
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sampleNum: string, catType?: 'phone' | 'car' | 'house' | 'card') => {
    if (catType) {
      setNumberType(catType);
    }
    setPhoneNumber(sampleNum);
    const mathRes = analyzeNumerologyInput(sampleNum);
    setResult(mathRes);
  };

  const handleSelectCategory = (cat: 'phone' | 'car' | 'house' | 'card') => {
    setNumberType(cat);
    let sample = '0958889999';
    if (cat === 'car') sample = '9กข3654';
    if (cat === 'house') sample = '88/45';
    if (cat === 'card') sample = '456987123';
    setPhoneNumber(sample);
    const mathRes = analyzeNumerologyInput(sample);
    setResult(mathRes);
  };

  // Derive aspects scores from numerology sum & pair calculations
  const calculateAspectScores = (res: PhoneAnalysisResult | null) => {
    if (!res) return { work: 85, wealth: 90, love: 88, karma: 92 };
    const sum = res.sumValue;
    const work = Math.min(99, Math.max(60, (sum * 7) % 40 + 60));
    const wealth = Math.min(99, Math.max(65, (sum * 11) % 35 + 65));
    const love = Math.min(99, Math.max(60, (sum * 13) % 40 + 60));
    const karma = Math.min(99, Math.max(70, (sum * 9) % 30 + 70));
    return { work, wealth, love, karma };
  };

  const aspectScores = calculateAspectScores(result);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-2.5">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.badgeBg} text-xs sm:text-sm font-semibold shadow-xs`}>
          <Hash className={`w-3.5 h-3.5 ${theme.iconColor}`} />
          <span>ศาสตร์แห่งตัวเลข & มหาโชคลาภ</span>
          <Sparkles className={`w-3.5 h-3.5 ${theme.secondaryIconColor}`} />
        </div>
        <h1 className={`text-xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${theme.heroGradient} bg-clip-text text-transparent px-2`}>
          วิเคราะห์ตัวเลข & เบอร์มงคล <span className="block sm:inline text-base sm:text-2xl opacity-90">(Numerology Prophet)</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto px-2">
          ถอดรหัสพลังงานความมงคลและสติปัญญาที่แฝงอยู่ในเบอร์โทรศัพท์ ทะเบียนรถ หรือเลขบ้านของคุณ
        </p>

        {/* Quick Sample Presets */}
        <div className="pt-2 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {SAMPLE_NUMBERS.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s.number, s.type)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-teal-400 text-cyan-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              >
                <IconComp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{s.label}</span>
                <span className="font-mono text-teal-300">({s.number})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Control Bar: AI vs Classic Mode */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r ${theme.subtleGradient} border ${theme.borderGlow} shadow-lg`}>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
          <span className={`font-semibold ${theme.iconColor}`}>เลือกโหมดวิเคราะห์:</span>
          <span className="text-slate-400">
            {isAnalyzing
              ? 'AI กำลังประมวลผลวิเคราะห์ตัวเลข... กรุณารอสักครู่'
              : useAi
                ? '(โหมด AI สังเคราะห์คำทำนายลึกซึ้ง)'
                : '(โหมดคลาสสิก คำนวณรวดเร็วทันที)'}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => setUseAi(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAnalyzing
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
            disabled={isAnalyzing}
            onClick={() => setUseAi(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAnalyzing
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

      {/* Input Form Card */}
      <div className={`${theme.cardBg} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
        {/* Category selector pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectCategory('phone')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              numberType === 'phone'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>เบอร์โทรศัพท์</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('car')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              numberType === 'car'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>ทะเบียนรถ</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('house')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              numberType === 'house'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>บ้านเลขที่</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('card')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              numberType === 'card'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>เลขบัตร/บัญชี</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze(phoneNumber, useAi);
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์ เช่น 0891234567 หรือ 9กข3654..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-base sm:text-lg tracking-wider transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !phoneNumber.trim()}
              className={`px-6 py-3 rounded-xl ${theme.primaryBtn} font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0`}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>วิเคราะห์ตัวเลขมงคล</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Result Card Showcase */}
      {result && (
        <div
          ref={resultCardRef}
          className={`rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8 animate-scale-up ${theme.cardBg}`}
        >
          {/* Top Grade Banner */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r ${theme.subtleGradient} border ${theme.borderGlow} shadow-xl`}>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-cyan-300/80 font-semibold uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>ผลการถอดรหัสตัวเลข: {result.cleanDigits}</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{result.sumMeaning.title}</h2>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/90 px-5 py-3 rounded-2xl border border-teal-400/50 shadow-[0_0_15px_rgba(20,184,166,0.15)] shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">ผลรวม (Sum)</span>
                <span className="text-2xl font-black text-cyan-300 font-mono">{result.sumValue}</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">เกรดมงคล</span>
                <span className="text-3xl font-black text-teal-400">{result.overallGrade}</span>
              </div>
            </div>
          </div>

          {/* Aspect Rating Bars (ดวง 4 ด้านประจำตัวเลข) */}
          <div className="space-y-3 bg-slate-950/70 p-4 sm:p-6 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className={`flex items-center justify-between text-xs sm:text-sm font-bold ${theme.iconColor}`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${theme.iconColor}`} />
                <span>ระดับคะแนนส่งเสริมดวงชะตา 4 ด้านประจำตัวเลข</span>
              </div>
              <Sparkles className={`w-4 h-4 ${theme.secondaryIconColor}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Work */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-blue-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>การงาน & สติปัญญานำพาความก้าวหน้า:</span>
                  </span>
                  <span className="text-blue-300 font-mono">{aspectScores.work}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div style={{ width: `${aspectScores.work}%` }} className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500" />
                </div>
              </div>

              {/* Wealth */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-300 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>การเงิน & ทรัพย์สินมหาโชคลาภ:</span>
                  </span>
                  <span className="text-amber-300 font-mono">{aspectScores.wealth}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div style={{ width: `${aspectScores.wealth}%` }} className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500" />
                </div>
              </div>

              {/* Love */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-pink-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>เสน่ห์เมตตา & ความรักสมหวัง:</span>
                  </span>
                  <span className="text-pink-300 font-mono">{aspectScores.love}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div style={{ width: `${aspectScores.love}%` }} className="bg-gradient-to-r from-pink-600 to-rose-400 h-full rounded-full transition-all duration-500" />
                </div>
              </div>

              {/* Karma */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>บารมี & สิ่งศักดิ์สิทธิ์คุ้มครอง:</span>
                  </span>
                  <span className="text-emerald-300 font-mono">{aspectScores.karma}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div style={{ width: `${aspectScores.karma}%` }} className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Pair Analysis Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Award className={`w-5 h-5 ${theme.iconColor}`} />
                <span>ถอดรหัสคู่เลขในตัวเลข ({result.pairAnalyses.length} คู่)</span>
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${theme.tagBg} font-medium`}>
                แยกตามหมวดพลังงาน
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {result.pairAnalyses.map((pairItem, index) => {
                const getCategoryStyle = (cat: string) => {
                  switch (cat) {
                    case 'wealth':
                      return { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', card: 'hover:border-amber-400/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]', icon: Coins };
                    case 'love':
                      return { badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30', card: 'hover:border-pink-400/50 hover:shadow-[0_0_12px_rgba(236,72,153,0.2)]', icon: Heart };
                    case 'charm':
                      return { badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', card: 'hover:border-purple-400/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]', icon: Sparkles };
                    case 'karma':
                      return { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', card: 'hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]', icon: ShieldCheck };
                    case 'caution':
                      return { badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', card: 'hover:border-orange-400/50 hover:shadow-[0_0_12px_rgba(249,115,22,0.2)]', icon: ShieldCheck };
                    default:
                      return { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', card: 'hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]', icon: Briefcase };
                  }
                };
                const style = getCategoryStyle(pairItem.category);
                const PairIcon = style.icon;

                return (
                  <div key={index} className={`p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 ${style.card} transition-all space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-lg font-mono font-extrabold ${style.badge} px-2.5 py-0.5 rounded border`}>
                          {pairItem.pair}
                        </span>
                        <PairIcon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">คะแนน {pairItem.score}/10</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{pairItem.meaning}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Markdown AI / Classic Prediction Section */}
          {predictionText && (
            <div className="relative rounded-2xl p-6 sm:p-8 bg-slate-950/95 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden space-y-5 animate-fade-in backdrop-blur-xl ring-1 ring-cyan-500/20">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className={`w-5 h-5 ${theme.iconColor} shrink-0`} />
                  <h3 className="text-base sm:text-lg font-bold font-serif text-white truncate">
                    บทวิเคราะห์ศาสตร์แห่งตัวเลขประจำชุด <span className="text-cyan-300 font-mono font-extrabold">{result.cleanDigits}</span>
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
                      let colorClass = 'text-cyan-300 border-cyan-500/30';
                      if (textStr.includes('งาน')) {
                        iconComp = <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />;
                        colorClass = 'text-blue-300 border-blue-500/30';
                      } else if (textStr.includes('เงิน')) {
                        iconComp = <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
                        colorClass = 'text-amber-300 border-amber-500/30';
                      } else if (textStr.includes('รัก')) {
                        iconComp = <Heart className="w-4 h-4 text-pink-400 shrink-0" />;
                        colorClass = 'text-pink-300 border-pink-500/30';
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
                      let colorClass = 'text-cyan-300 border-cyan-500/30';
                      if (textStr.includes('งาน')) {
                        iconComp = <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />;
                        colorClass = 'text-blue-300 border-blue-500/30';
                      } else if (textStr.includes('เงิน')) {
                        iconComp = <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
                        colorClass = 'text-amber-300 border-amber-500/30';
                      } else if (textStr.includes('รัก')) {
                        iconComp = <Heart className="w-4 h-4 text-pink-400 shrink-0" />;
                        colorClass = 'text-pink-300 border-pink-500/30';
                      }
                      return (
                        <h2 className={`text-base sm:text-lg font-bold ${colorClass} mt-6 mb-3 pb-1.5 border-b flex items-center gap-2 tracking-wide`}>
                          {iconComp}
                          <span>{textStr}</span>
                        </h2>
                      );
                    },
                    h3: ({ children }) => (
                      <h3 className="text-sm sm:text-base font-semibold text-cyan-200 mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => <p className="mb-4 leading-relaxed text-slate-100 font-normal text-sm sm:text-base">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-amber-400 pl-4 py-3.5 italic my-5 text-amber-200 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-cyan-500/15 rounded-r-2xl border border-amber-400/30 shadow-md">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1.5 text-slate-100">{children}</ul>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                  }}
                >
                  {predictionText}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
