import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateLifeGraph } from '../data/thaiAstrologyData';
import type { ThaiLifeChartResult } from '../types/thaiAstrology';
import { Calendar } from 'lucide-react';
import type { ApiSettings, SavedReading } from '../../../types';
import { storageService } from '../../../services/storageService';
import { getLastCreditsDeducted } from '../../../services/ai/aiClient';
import { MODULE_THEMES } from '../../../constants/moduleThemes';
import { analyzeThaiLifeGraph, generateFallbackThaiLifeGraph } from '../../../services/aiService';

import { ThaiAstrologyForm } from '../components/ThaiAstrologyForm';
import { LifeGraphVisualizer } from '../components/LifeGraphVisualizer';
import { LifeStageBreakdown } from '../components/LifeStageBreakdown';

import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';
import { ModulePageHeader } from '../../../components/common/ModulePageHeader';
import { AiModeToggle } from '../../../components/common/AiModeToggle';
import {
  PredictionLoading,
  PredictionPanel,
} from '../../../components/common/PredictionPanel';

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
  const currentReadingIdRef = useRef<string | null>(null);

  // Load saved reading if :id parameter exists in URL
  useEffect(() => {
    if (id && id !== currentReadingIdRef.current) {
      currentReadingIdRef.current = id;
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
    currentReadingIdRef.current = tempId;
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
      <ModulePageHeader
        icon={Calendar}
        iconClassName={theme.iconColor}
        eyebrow="โหราศาสตร์ไทย · กราฟชีวิต"
        title="กราฟชีวิต & ดวงไทย"
        description="ใส่วันเกิด ดูจังหวะ 9 ช่วงอายุ — คำนวณมาตรฐานฟรี หรือขอ AI เจาะลึก"
      />

      <AiModeToggle
        useAi={useAi}
        disabled={isLoading}
        accentClassName={theme.iconColor}
        statusText={
          isLoading
            ? 'กำลังประมวลผล…'
            : useAi
              ? 'ใช้เครดิตเมื่อขอคำทำนาย AI'
              : 'คำนวณกราฟทันที'
        }
        onChange={(next) => {
          setUseAi(next);
          if (!next && result) {
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
      />

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

          {isLoading && !predictionText && (
            <PredictionLoading message="กำลังวิเคราะห์กราฟชีวิต…" />
          )}

          {predictionText && (
            <PredictionPanel
              title={`กราฟชีวิต · เกิด${result.dayOfWeekTh}`}
              isStreaming={isLoading}
              onCopy={handleCopyPrediction}
              copied={copied}
              markdown={predictionText}
            />
          )}
        </div>
      )}
    </div>
  );
};
