import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { calculateLifeGraph } from '../data/thaiAstrologyData';
import type { ThaiLifeChartResult } from '../types/thaiAstrology';
import {
  Sparkles,
  Calendar,
  BookOpen,
  Copy,
  Check,
  Briefcase,
  Coins,
  Heart,
  Stethoscope,
  Feather,
} from 'lucide-react';
import type { ApiSettings, SavedReading } from '../../../types';
import { storageService } from '../../../services/storageService';
import { getLastCreditsDeducted } from '../../../services/ai/aiClient';
import { MODULE_THEMES } from '../../../constants/moduleThemes';
import { analyzeThaiLifeGraph, generateFallbackThaiLifeGraph } from '../../../services/aiService';

import { ThaiAstrologyForm } from '../components/ThaiAstrologyForm';
import { LifeGraphVisualizer } from '../components/LifeGraphVisualizer';
import { LifeStageBreakdown } from '../components/LifeStageBreakdown';

import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';

interface ThaiAstrologyPageProps {
  apiSettings: ApiSettings;
  onOpenSettings?: () => void;
  onOpenCreditCenter?: () => void;
  onSaveHistory?: (readings: SavedReading[]) => void;
}

export const ThaiAstrologyPage: React.FC<ThaiAstrologyPageProps> = ({
  apiSettings,
  onOpenSettings,
  onOpenCreditCenter,
  onSaveHistory,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = MODULE_THEMES['thai-astrology'];
  const [birthDate, setBirthDate] = useState<string>('1995-06-15');
  const [dayIndex, setDayIndex] = useState<number>(3); // Wednesday default
  const [useAi, setUseAi] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionText, setPredictionText] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [result, setResult] = useState<ThaiLifeChartResult | null>(() => calculateLifeGraph('1995-06-15', 3));
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Load saved reading if :id parameter exists in URL
  useEffect(() => {
    if (id) {
      storageService.getReadingByIdAsync(id).then((match) => {
        if (match) {
          if (match.meta?.birthDate) {
            setBirthDate(match.meta.birthDate);
            const mathRes = calculateLifeGraph(match.meta.birthDate, dayIndex);
            setResult(mathRes);
          }
          if (match.resultText) {
            setPredictionText(match.resultText);
            setUseAi(true);
          }
        }
      });
    }
  }, [id]);

  const handleCopyPrediction = () => {
    if (!predictionText) return;
    navigator.clipboard.writeText(predictionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCalculate = async (e?: React.FormEvent, runAiMode: boolean = useAi) => {
    if (e) e.preventDefault();
    if (!birthDate) return;

    const mathRes = calculateLifeGraph(birthDate, dayIndex);
    setResult(mathRes);
    setAiError(null);

    if (!runAiMode) {
      const fallback = generateFallbackThaiLifeGraph(
        birthDate,
        mathRes.dayOfWeekTh,
        mathRes.peakAgeRange,
        mathRes.summaryGuidance
      );
      setPredictionText(fallback);
      return;
    }

    setIsLoading(true);
    setPredictionText('');

    const tempId = Date.now().toString();
    const historyEntryDraft: SavedReading = {
      id: tempId,
      timestamp: Date.now(),
      category: 'thai-astrology',
      title: `กราฟชีวิต & โหราศาสตร์ไทย`,
      subtitle: `วันเกิด ${birthDate} (วัน${mathRes.dayOfWeekTh})`,
      question: `กราฟชีวิต วันเกิด ${birthDate}`,
      meta: { birthDate, dayOfWeek: mathRes.dayOfWeekTh, peakAgeRange: mathRes.peakAgeRange },
    };

    try {
      const aiText = await analyzeThaiLifeGraph(
        birthDate,
        mathRes.dayOfWeekTh,
        mathRes.elementTh,
        mathRes.peakAgeRange,
        mathRes.summaryGuidance,
        apiSettings,
        (chunk) => {
          setPredictionText((prev) => prev + chunk);
        },
        historyEntryDraft
      );
      setPredictionText(aiText);
      setAiError(null);

      // Auto save AI Thai Astrology reading to history
      if (aiText && mathRes) {
        const isCustomKey = apiSettings?.mode === 'custom' && !!apiSettings?.apiKey;
        const newEntry: SavedReading = {
          ...historyEntryDraft,
          resultText: aiText,
          creditsUsed: isCustomKey ? 0 : getLastCreditsDeducted(),
        };
        const updated = storageService.saveReading(newEntry);
        if (onSaveHistory) onSaveHistory(updated);
        navigate(`/thai-astrology/reading/${tempId}`, { replace: true });
      }
    } catch (err: any) {
      console.error('Failed AI completion in ThaiAstrologyPage:', err);
      const errMsg = err?.message || 'ไม่สามารถประมวลผลคำขอ AI ดวงไทยโบราณได้ในขณะนี้';
      setAiError(errMsg);
      setPredictionText('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
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
          สำรวจจังหวะขึ้นลงของชีวิตทั้ง 9 ช่วงอายุ เพื่อวางแผนอนาคตและเสริมสร้างบารมีด้วยสติ
        </p>
      </div>

      {/* Mode Control Bar: AI vs Classic Offline Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
          <span className={`font-semibold ${theme.iconColor}`}>เลือกโหมดวิเคราะห์:</span>
          <span className="text-slate-400">
            {isLoading
              ? 'AI กำลังประมวลผลคำทำนาย... กรุณารอสักครู่'
              : useAi
                ? '(โหมด AI สังเคราะห์กราฟชีวิตลึกซึ้ง)'
                : '(โหมดคลาสสิก คำนวณทันที ไม่ใช้ AI)'}
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
              if (result) {
                setPredictionText(
                  generateFallbackThaiLifeGraph(
                    birthDate,
                    result.dayOfWeekTh,
                    result.peakAgeRange,
                    result.summaryGuidance
                  )
                );
              }
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

      {/* Birth Input Form */}
      <ThaiAstrologyForm
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        dayIndex={dayIndex}
        setDayIndex={setDayIndex}
        onSubmit={(e) => handleCalculate(e, useAi)}
        isLoading={isLoading}
        useAi={useAi}
        cardBgStyle={theme.cardBg}
        primaryBtnStyle={theme.primaryBtn}
      />

      {/* Result Display */}
      {result && (
        <div ref={resultCardRef} className={`rounded-2xl p-6 sm:p-8 backdrop-blur-xl space-y-8 animate-scale-up ${theme.cardBg}`}>
          {/* Summary Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/60 border border-rose-500/30 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-slate-400">ดวงชะตาผู้เกิด{result.dayOfWeekTh} ({result.elementTh})</span>
              <h3 className="text-lg font-bold text-rose-300">{result.summaryGuidance}</h3>
            </div>
            <div className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 font-bold text-xs sm:text-sm text-center shadow-xs whitespace-nowrap shrink-0">
              ช่วงพุ่งสูงสุด: {result.peakAgeRange}
            </div>
          </div>

          {/* Interactive Life Graph Visualizer */}
          <LifeGraphVisualizer
            lifeGraphPoints={result.lifeGraphPoints}
            iconColorClass={theme.iconColor}
          />

          {/* Stage Details Breakdown */}
          <LifeStageBreakdown
            lifeGraphPoints={result.lifeGraphPoints}
            secondaryIconColor={theme.secondaryIconColor}
          />

          {/* AI Error Fallback Banner */}
          {aiError && (
            <AiErrorFallbackCard
              errorMessage={aiError}
              onRetry={() => handleCalculate(undefined, true)}
              onOpenCreditCenter={onOpenCreditCenter}
              onOpenSettings={onOpenSettings}
            />
          )}

          {/* Initial AI Loading State before stream text arrives */}
          {isLoading && !predictionText && (
            <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-slate-950/90 border border-rose-500/40 shadow-xl text-center space-y-4 animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-purple-600 animate-spin blur-md" />
                <div className="absolute inset-1.5 rounded-full bg-slate-950 flex items-center justify-center border border-rose-300">
                  <Sparkles className="w-7 h-7 text-rose-300 animate-bounce" />
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-rose-300">
                โหราจารย์ AI กำลังผูกดวงชะตากราฟชีวิตโบราณ...
              </h4>
              <p className="text-xs text-rose-200/70 max-w-sm">
                กำลังคำนวณจังหวะชีวิต 9 ช่วงอายุและช่วงพีคสูงสุด โปรดรอสักครู่
              </p>
            </div>
          )}

          {/* AI / Classic Prediction Content View */}
          {predictionText && (
            <div className="relative rounded-2xl p-5 sm:p-7 bg-slate-900/95 border border-rose-500/40 shadow-2xl shadow-rose-900/20 overflow-hidden space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/30 pb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Feather className={`w-5 h-5 ${theme.iconColor} shrink-0`} />
                  <h3 className="text-base sm:text-lg font-bold text-rose-200 truncate">
                    บทวิเคราะห์ดวงชะตากราฟชีวิต (ผู้เกิด{result.dayOfWeekTh})
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
                      let colorClass = 'text-rose-300 border-rose-500/30';
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
                      let colorClass = 'text-rose-300 border-rose-500/30';
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
                      <h3 className="text-sm sm:text-base font-bold text-amber-300 mt-4 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        <span>{children}</span>
                      </h3>
                    ),
                    p: ({ children }) => <p className="mb-3.5 leading-relaxed text-slate-100 font-normal">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-rose-400 pl-4 py-3 my-4 text-rose-200 bg-gradient-to-r from-rose-500/15 via-purple-500/10 to-amber-500/15 rounded-r-xl border border-rose-500/30 shadow-md">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1.5 text-slate-100">{children}</ul>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                  }}
                >
                  {predictionText}
                </ReactMarkdown>

                {/* Active Streaming Badge */}
                {isLoading && (
                  <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-medium animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <Sparkles className="w-3.5 h-3.5 text-rose-300 animate-spin" />
                    <span>AI กำลังวิเคราะห์จังหวะดวงชะตากราฟชีวิตเพิ่มเติม...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
