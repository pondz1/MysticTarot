import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DAILY_LUCKY_COLORS_TABLE, DAILY_AUSPICIOUS_DIRECTIONS_MAP, getDynamicFengShuiTips } from '../data/fengShuiData';
import {
  Compass,
  Sparkles,
  Briefcase,
  Coins,
  Heart,
  Stethoscope,
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
import { ModulePageHeader } from '../../../components/common/ModulePageHeader';
import { AiModeToggle } from '../../../components/common/AiModeToggle';
import {
  PredictionLoading,
  PredictionPanel,
  PrimaryAnalyzeButton,
  analyzeButtonLabel,
} from '../../../components/common/PredictionPanel';

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

  const currentReadingIdRef = useRef<string | null>(null);

  // Load saved reading if :id parameter exists in URL
  useEffect(() => {
    if (id && id !== currentReadingIdRef.current) {
      currentReadingIdRef.current = id;
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
    currentReadingIdRef.current = tempId;
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
      <ModulePageHeader
        icon={Compass}
        iconClassName={theme.iconColor}
        eyebrow="ฮวงจุ้ย · สีมงคลประจำวัน"
        title="สีเสื้อมงคล & พลังงานฮวงจุ้ย"
        description="เลือกวันและพื้นที่ ดูตารางสี/ทิศทันที — ขอ AI ปรับคำแนะนำเฉพาะจุดได้"
      />

      <AiModeToggle
        useAi={useAi}
        disabled={isLoading}
        accentClassName={theme.iconColor}
        statusText={
          isLoading
            ? 'กำลังประมวลผล…'
            : useAi
              ? 'ใช้เครดิตเมื่อขอคำแนะนำ AI'
              : 'ดูตารางออฟไลน์ทันที'
        }
        onChange={(next) => {
          setUseAi(next);
          if (!next) {
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
          }
        }}
      />

      {/* Day & Space Control Center */}
      <div className="relative z-20 rounded-2xl p-5 sm:p-7 border border-slate-800 bg-slate-900/40 space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400">เลือกวันในสัปดาห์</label>
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

          <PrimaryAnalyzeButton
            fullWidth
            loading={isLoading}
            onClick={() => handleAnalyzeFengShui(useAi)}
            label={analyzeButtonLabel(useAi, 'ฮวงจุ้ย')}
          />
        </div>
      </div>

      <FengShuiColorGrid
        currentDayInfo={currentDayInfo}
        cardBgStyle={theme.cardBg}
        badgeBgStyle={theme.badgeBg}
        iconColorClass={theme.iconColor}
      />

      {aiError && (
        <AiErrorFallbackCard
          errorMessage={aiError}
          onRetry={() => handleAnalyzeFengShui(true)}
          onOpenCreditCenter={onOpenCreditCenter}
          onOpenSettings={onOpenSettings}
        />
      )}

      {isLoading && !predictionText && (
        <PredictionLoading message="กำลังวิเคราะห์ฮวงจุ้ย…" />
      )}

      {predictionText && (
        <div ref={resultCardRef}>
          <PredictionPanel
            title={`คำแนะนำฮวงจุ้ย · ${currentDayInfo.dayNameTh}`}
            isStreaming={isLoading}
            onCopy={handleCopyPrediction}
            copied={copied}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => {
                  const textStr =
                    typeof children === 'string'
                      ? children.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/gu, '').trim()
                      : String(children || '');
                  let iconComp = <Sparkles className={`w-4 h-4 ${theme.iconColor} shrink-0`} />;
                  if (textStr.includes('งาน') || textStr.includes('เรียน')) {
                    iconComp = <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />;
                  } else if (textStr.includes('เงิน') || textStr.includes('โชค')) {
                    iconComp = <Coins className="w-4 h-4 text-amber-400 shrink-0" />;
                  } else if (textStr.includes('รัก')) {
                    iconComp = <Heart className="w-4 h-4 text-pink-400 shrink-0" />;
                  } else if (textStr.includes('ระวัง') || textStr.includes('ต้องห้าม')) {
                    iconComp = <Stethoscope className="w-4 h-4 text-rose-400 shrink-0" />;
                  }
                  return (
                    <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 mt-5 mb-2 pb-1.5 flex items-center gap-2">
                      {iconComp}
                      <span>{textStr}</span>
                    </h2>
                  );
                },
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 mt-5 mb-2 pb-1.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-slate-200 mt-3 mb-1.5">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed text-slate-300">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-amber-200">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-amber-500/50 pl-3 py-2 my-3 text-slate-300 bg-slate-900/50 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1 text-slate-300">{children}</ul>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
              }}
            >
              {predictionText}
            </ReactMarkdown>
          </PredictionPanel>
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
