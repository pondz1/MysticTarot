import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DAILY_LUCKY_COLORS_TABLE, DAILY_AUSPICIOUS_DIRECTIONS_MAP, getDynamicFengShuiTips } from '../data/fengShuiData';
import {
  Compass,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Briefcase,
  Coins,
  Heart,
  Stethoscope,
  Feather,
  Layout,
} from 'lucide-react';
import type { ApiSettings, SavedReading } from '../../../types';
import { storageService } from '../../../services/storageService';
import { getLastCreditsDeducted } from '../../../services/ai/aiClient';
import { MODULE_THEMES } from '../../../constants/moduleThemes';
import { analyzeFengShui, generateFallbackFengShui } from '../../../services/aiService';
import { CustomSelect } from '../../../components/common/CustomSelect';

import { FengShuiColorGrid } from '../components/FengShuiColorGrid';
import { FengShuiDirections } from '../components/FengShuiDirections';
import { FengShuiTips } from '../components/FengShuiTips';

import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';

interface FengShuiPageProps {
  apiSettings: ApiSettings;
  onOpenSettings?: () => void;
  onOpenCreditCenter?: () => void;
  onSaveHistory?: (readings: SavedReading[]) => void;
}

const SPACE_OPTIONS = [
  { id: 'desk', label: 'โต๊ะทำงาน / มุมทำงาน' },
  { id: 'bedroom', label: 'ห้องนอน / ทิศทางเตียง' },
  { id: 'entrance', label: 'ประตูหน้าบ้าน / ทางเข้าหลัก' },
  { id: 'cashier', label: 'ร้านค้า / โต๊ะแคชเชียร์' },
  { id: 'overall', label: 'ภาพรวมบ้าน & ที่อยู่อาศัย' },
];

export const FengShuiPage: React.FC<FengShuiPageProps> = ({
  apiSettings,
  onOpenSettings,
  onOpenCreditCenter,
  onSaveHistory,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = MODULE_THEMES['feng-shui'];
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedSpace, setSelectedSpace] = useState<string>('โต๊ะทำงาน / มุมทำงาน');
  const [useAi, setUseAi] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionText, setPredictionText] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentDayInfo = DAILY_LUCKY_COLORS_TABLE[selectedDayIndex];
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Load saved reading if :id parameter exists in URL
  useEffect(() => {
    if (id) {
      storageService.getReadingByIdAsync(id).then((match) => {
        if (match) {
          if (match.meta?.space) {
            setSelectedSpace(match.meta.space);
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

  const handleAnalyzeFengShui = async (runAiMode: boolean = useAi) => {
    const luckyWorkStr = currentDayInfo.luckyWork.join(', ');
    const luckyWealthStr = currentDayInfo.luckyWealth.join(', ');
    const luckyLoveStr = currentDayInfo.luckyLove.join(', ');
    const unluckyStr = currentDayInfo.unluckyForbidden.join(', ');
    setAiError(null);

    if (!runAiMode) {
      const fallback = generateFallbackFengShui(
        currentDayInfo.dayNameTh,
        luckyWorkStr,
        luckyWealthStr,
        luckyLoveStr,
        unluckyStr,
        selectedSpace
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
      category: 'feng-shui',
      title: `วิเคราะห์ฮวงจุ้ย: ${selectedSpace}`,
      subtitle: `วัน${currentDayInfo.dayNameTh}`,
      question: `ฮวงจุ้ย ${selectedSpace} (วัน${currentDayInfo.dayNameTh})`,
      meta: { space: selectedSpace, dayName: currentDayInfo.dayNameTh },
    };

    try {
      const aiText = await analyzeFengShui(
        currentDayInfo.dayNameTh,
        luckyWorkStr,
        luckyWealthStr,
        luckyLoveStr,
        unluckyStr,
        selectedSpace,
        apiSettings,
        (chunk) => {
          setPredictionText((prev) => prev + chunk);
        },
        historyEntryDraft
      );
      setPredictionText(aiText);
      setAiError(null);

      // Auto save AI Feng Shui reading to history
      if (aiText) {
        const isCustomKey = apiSettings?.mode === 'custom' && !!apiSettings?.apiKey;
        const newEntry: SavedReading = {
          ...historyEntryDraft,
          resultText: aiText,
          creditsUsed: isCustomKey ? 0 : getLastCreditsDeducted(),
        };
        const updated = storageService.saveReading(newEntry);
        if (onSaveHistory) onSaveHistory(updated);
        navigate(`/feng-shui/reading/${tempId}`, { replace: true });
      }
    } catch (err: any) {
      console.error('Failed AI completion in FengShuiPage:', err);
      const errMsg = err?.message || 'ไม่สามารถประมวลผลคำขอ AI ฮวงจุ้ย & สีมงคลได้ในขณะนี้';
      setAiError(errMsg);
      setPredictionText('');
    } finally {
      setIsLoading(false);
    }
  };

  const currentDirections = DAILY_AUSPICIOUS_DIRECTIONS_MAP[selectedDayIndex] || DAILY_AUSPICIOUS_DIRECTIONS_MAP[0];
  const currentTips = getDynamicFengShuiTips(selectedDayIndex, selectedSpace);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
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
          เสริมสิริมงคลให้ชีวิตในทุกวัน ด้วยตารางสีเสื้อมงคลประจำวัน ทิศนำโชค และเคล็ดลับจัดฮวงจุ้ยรับทรัพย์
        </p>
      </div>

      {/* Mode Control Bar: AI vs Classic Offline Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
          <span className={`font-semibold ${theme.iconColor}`}>เลือกโหมดคำแนะนำ:</span>
          <span className="text-slate-400">
            {isLoading
              ? 'AI กำลังประมวลผลคำแนะนำฮวงจุ้ย... กรุณารอสักครู่'
              : useAi
                ? '(โหมด AI ปรับพลังงานพื้นที่เฉพาะบุคคล)'
                : '(โหมดคลาสสิก ดูตารางออฟไลน์ทันที)'}
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
              setPredictionText(
                generateFallbackFengShui(
                  currentDayInfo.dayNameTh,
                  currentDayInfo.luckyWork.join(', '),
                  currentDayInfo.luckyWealth.join(', '),
                  currentDayInfo.luckyLove.join(', '),
                  currentDayInfo.unluckyForbidden.join(', '),
                  selectedSpace
                )
              );
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

      {/* Day & Space Control Center */}
      <div className={`relative z-20 ${theme.cardBg} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
        {/* Day Selector Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">เลือกวันประจำสัปดาห์:</label>
          <div className="flex flex-wrap justify-center gap-2">
            {DAILY_LUCKY_COLORS_TABLE.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedDayIndex(idx);
                  if (!useAi) {
                    setPredictionText(
                      generateFallbackFengShui(
                        item.dayNameTh,
                        item.luckyWork.join(', '),
                        item.luckyWealth.join(', '),
                        item.luckyLove.join(', '),
                        item.unluckyForbidden.join(', '),
                        selectedSpace
                      )
                    );
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selectedDayIndex === idx
                    ? `${theme.activeToggleBtn} scale-105 shadow-lg`
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {item.dayNameTh}
              </button>
            ))}
          </div>
        </div>

        {/* Space / Room Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-t border-slate-800/80 pt-6">
          <div className="sm:col-span-2">
            <CustomSelect
              label="เลือกตำแหน่งพื้นที่ต้องการจัดฮวงจุ้ย:"
              options={SPACE_OPTIONS.map((sp) => ({ value: sp.label, label: sp.label }))}
              value={selectedSpace}
              onChange={(val) => {
                setSelectedSpace(val);
                if (!useAi) {
                  setPredictionText(
                    generateFallbackFengShui(
                      currentDayInfo.dayNameTh,
                      currentDayInfo.luckyWork.join(', '),
                      currentDayInfo.luckyWealth.join(', '),
                      currentDayInfo.luckyLove.join(', '),
                      currentDayInfo.unluckyForbidden.join(', '),
                      val
                    )
                  );
                }
              }}
              accentColor="emerald"
              icon={<Layout className="w-4 h-4 text-emerald-400" />}
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAnalyzeFengShui(useAi)}
            className={`w-full h-[46px] px-6 rounded-xl sm:rounded-2xl ${theme.primaryBtn} font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{useAi ? 'ขอคำแนะนำฮวงจุ้ยด้วย AI' : 'ดูคำทำนายออฟไลน์'}</span>
          </button>
        </div>
      </div>

      {/* Daily Color Grid Card */}
      <FengShuiColorGrid
        currentDayInfo={currentDayInfo}
        cardBgStyle={theme.cardBg}
        badgeBgStyle={theme.badgeBg}
        iconColorClass={theme.iconColor}
      />

      {/* AI Error Fallback Banner */}
      {aiError && (
        <AiErrorFallbackCard
          errorMessage={aiError}
          onRetry={() => handleAnalyzeFengShui(true)}
          onUseOfflineFallback={() => {
            const luckyWorkStr = currentDayInfo.luckyWork.join(', ');
            const luckyWealthStr = currentDayInfo.luckyWealth.join(', ');
            const luckyLoveStr = currentDayInfo.luckyLove.join(', ');
            const unluckyStr = currentDayInfo.unluckyForbidden.join(', ');
            const fallback = generateFallbackFengShui(
              currentDayInfo.dayNameTh,
              luckyWorkStr,
              luckyWealthStr,
              luckyLoveStr,
              unluckyStr,
              selectedSpace
            );
            setPredictionText(fallback);
            setAiError(null);
          }}
          onOpenCreditCenter={onOpenCreditCenter}
          onOpenSettings={onOpenSettings}
        />
      )}

      {/* Initial AI Loading State before stream text arrives */}
      {isLoading && !predictionText && (
        <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-slate-950/90 border border-emerald-500/40 shadow-xl text-center space-y-4 animate-pulse">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-600 animate-spin blur-md" />
            <div className="absolute inset-1.5 rounded-full bg-slate-950 flex items-center justify-center border border-emerald-300">
              <Sparkles className="w-7 h-7 text-emerald-300 animate-bounce" />
            </div>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-emerald-300">
            ซินแส AI กำลังวิเคราะห์ฮวงจุ้ยและทิศรับทรัพย์...
          </h4>
          <p className="text-xs text-emerald-200/70 max-w-sm">
            กำลังคำนวณสมดุลเบญจธาตุและสีมงคลประจำวัน โปรดรอสักครู่
          </p>
        </div>
      )}

      {/* Prediction Markdown Output Display */}
      {predictionText && (
        <div ref={resultCardRef} className="relative rounded-2xl p-5 sm:p-7 bg-slate-900/95 border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 overflow-hidden space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
            <div className="flex items-center gap-2 min-w-0">
              <Feather className={`w-5 h-5 ${theme.iconColor} shrink-0`} />
              <h3 className="text-base sm:text-lg font-bold text-emerald-200 truncate">
                คำแนะนำฮวงจุ้ย & สีมงคล (ประจำ{currentDayInfo.dayNameTh})
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopyPrediction}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${theme.secondaryBtn} transition-all cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-auto`}
              title="คัดลอกคำทำนาย"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกคำแนะนำ'}</span>
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
                  let colorClass = 'text-emerald-300 border-emerald-500/30';
                  if (textStr.includes('งาน') || textStr.includes('เรียน')) {
                    iconComp = <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />;
                    colorClass = 'text-blue-300 border-blue-500/30';
                  } else if (textStr.includes('เงิน') || textStr.includes('โชค')) {
                    iconComp = <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
                    colorClass = 'text-amber-300 border-amber-500/30';
                  } else if (textStr.includes('รัก')) {
                    iconComp = <Heart className="w-4 h-4 text-pink-400 shrink-0" />;
                    colorClass = 'text-pink-300 border-pink-500/30';
                  } else if (textStr.includes('ระวัง') || textStr.includes('ต้องห้าม')) {
                    iconComp = <Stethoscope className="w-4 h-4 text-rose-400 shrink-0" />;
                    colorClass = 'text-rose-300 border-rose-500/30';
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
                  let colorClass = 'text-emerald-300 border-emerald-500/30';
                  if (textStr.includes('งาน') || textStr.includes('เรียน')) {
                    iconComp = <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />;
                    colorClass = 'text-blue-300 border-blue-500/30';
                  } else if (textStr.includes('เงิน') || textStr.includes('โชค')) {
                    iconComp = <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
                    colorClass = 'text-amber-300 border-amber-500/30';
                  } else if (textStr.includes('รัก')) {
                    iconComp = <Heart className="w-4 h-4 text-pink-400 shrink-0" />;
                    colorClass = 'text-pink-300 border-pink-500/30';
                  } else if (textStr.includes('ระวัง') || textStr.includes('ต้องห้าม')) {
                    iconComp = <Stethoscope className="w-4 h-4 text-rose-400 shrink-0" />;
                    colorClass = 'text-rose-300 border-rose-500/30';
                  }
                  return (
                    <h2 className={`text-base sm:text-lg font-bold ${colorClass} mt-6 mb-3 pb-1.5 border-b flex items-center gap-2 tracking-wide`}>
                      {iconComp}
                      <span>{textStr}</span>
                    </h2>
                  );
                },
                h3: ({ children }) => (
                  <h3 className="text-sm sm:text-base font-bold text-teal-300 mt-4 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{children}</span>
                  </h3>
                ),
                p: ({ children }) => <p className="mb-3.5 leading-relaxed text-slate-100 font-normal">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-400 pl-4 py-3 my-4 text-amber-200 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/15 rounded-r-xl border border-emerald-500/30 shadow-md">
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
              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
                <span>ซินแส AI กำลังคำนวณทิศและฮวงจุ้ยมงคลเพิ่มเติม...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Auspicious Directions */}
      <FengShuiDirections
        directions={currentDirections}
        dayNameTh={currentDayInfo.dayNameTh}
        iconColorClass={theme.iconColor}
      />

      {/* Dynamic Feng Shui Tips per Day & Space */}
      <FengShuiTips
        tips={currentTips}
        selectedSpace={selectedSpace}
        dayNameTh={currentDayInfo.dayNameTh}
        iconColorClass={theme.iconColor}
      />
    </div>
  );
};
