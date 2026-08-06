import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzePhoneNumber, analyzeNumerologyInput } from '../data/numerologyData';
import type { PhoneAnalysisResult } from '../types/numerology';
import {
  Sparkles,
  Hash,
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
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

import { NumerologyPresets, type SampleNumberItem } from '../components/NumerologyPresets';
import { NumerologyHeaderBanner } from '../components/NumerologyHeaderBanner';
import { NumerologyAspectBars } from '../components/NumerologyAspectBars';
import { NumerologyPairGrid } from '../components/NumerologyPairGrid';

interface NumerologyPageProps {
  apiSettings?: ApiSettings;
}

const SAMPLE_NUMBERS: SampleNumberItem[] = [
  { label: 'เบอร์มหาเสน่ห์ค้าขาย', number: '0958889999', icon: Sparkles, type: 'phone' },
  { label: 'เบอร์มหาเศรษฐีโชคลาภ', number: '0624567890', icon: Coins, type: 'phone' },
  { label: 'เบอร์ผู้ใหญ่อุปถัมภ์', number: '0891545636', icon: BookOpen, type: 'phone' },
  { label: 'ทะเบียนรถนำโชค', number: '9กข3654', icon: Car, type: 'car' },
  { label: 'บ้านเลขที่รับทรัพย์', number: '88/45', icon: HomeIcon, type: 'house' },
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
        <NumerologyPresets
          sampleNumbers={SAMPLE_NUMBERS}
          onSelectSample={handleSelectSample}
        />
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
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1.5 scrollbar-none max-w-full">
          <button
            type="button"
            onClick={() => handleSelectCategory('phone')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              numberType === 'phone'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">เบอร์โทรศัพท์</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('car')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              numberType === 'car'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <Car className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">ทะเบียนรถ</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('house')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              numberType === 'house'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">บ้านเลขที่</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('card')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              numberType === 'card'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-teal-500/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">เลขบัตร/บัญชี</span>
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
          <NumerologyHeaderBanner
            result={result}
            subtleGradientStyle={theme.subtleGradient}
            borderGlowStyle={theme.borderGlow}
          />

          {/* Aspect Rating Bars (ดวง 4 ด้านประจำตัวเลข) */}
          <NumerologyAspectBars
            aspectScores={aspectScores}
            iconColorClass={theme.iconColor}
            secondaryIconColorClass={theme.secondaryIconColor}
          />

          {/* Pair Analysis Grid */}
          <NumerologyPairGrid
            pairAnalyses={result.pairAnalyses}
            tagBgStyle={theme.tagBg}
            iconColorClass={theme.iconColor}
          />

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
