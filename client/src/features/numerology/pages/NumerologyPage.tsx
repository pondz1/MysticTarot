import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyzePhoneNumber, analyzeNumerologyInput } from '../data/numerologyData';
import type { PhoneAnalysisResult } from '../types/numerology';
import {
  Sparkles,
  Hash,
  BookOpen,
  Phone,
  Car,
  Home as HomeIcon,
  CreditCard,
  Coins,
} from 'lucide-react';
import type { ApiSettings, SavedReading } from '../../../types';
import { analyzeNumerology, generateFallbackNumerology } from '../../../services/aiService';
import { storageService } from '../../../services/storageService';
import { getLastCreditsDeducted } from '../../../services/ai/aiClient';
import { MODULE_THEMES } from '../../../constants/moduleThemes';

import { NumerologyPresets, type SampleNumberItem } from '../components/NumerologyPresets';
import { NumerologyHeaderBanner } from '../components/NumerologyHeaderBanner';
import { NumerologyAspectBars } from '../components/NumerologyAspectBars';
import { NumerologyPairGrid } from '../components/NumerologyPairGrid';

import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';
import { ModulePageHeader } from '../../../components/common/ModulePageHeader';
import { AiModeToggle } from '../../../components/common/AiModeToggle';
import {
  PredictionLoading,
  PredictionPanel,
  PrimaryAnalyzeButton,
  analyzeButtonLabel,
} from '../../../components/common/PredictionPanel';

interface NumerologyPageProps {
  apiSettings?: ApiSettings;
  onOpenSettings?: () => void;
  onOpenCreditCenter?: () => void;
  onSaveHistory?: (readings: SavedReading[]) => void;
}

const SAMPLE_NUMBERS: SampleNumberItem[] = [
  { label: 'เบอร์มหาเสน่ห์ค้าขาย', number: '0958889999', icon: Sparkles, type: 'phone' },
  { label: 'เบอร์มหาเศรษฐีโชคลาภ', number: '0624567890', icon: Coins, type: 'phone' },
  { label: 'เบอร์ผู้ใหญ่อุปถัมภ์', number: '0891545636', icon: BookOpen, type: 'phone' },
  { label: 'ทะเบียนรถนำโชค', number: '9กข3654', icon: Car, type: 'car' },
  { label: 'บ้านเลขที่รับทรัพย์', number: '88/45', icon: HomeIcon, type: 'house' },
];

export const NumerologyPage: React.FC<NumerologyPageProps> = ({
  apiSettings,
  onOpenSettings,
  onOpenCreditCenter,
  onSaveHistory,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = MODULE_THEMES.numerology;
  const [phoneNumber, setPhoneNumber] = useState<string>('0958889999');
  const [numberType, setNumberType] = useState<'phone' | 'car' | 'house' | 'card'>('phone');
  const [useAi, setUseAi] = useState<boolean>(false);
  const [result, setResult] = useState<PhoneAnalysisResult | null>(() => analyzePhoneNumber('0958889999'));
  const [predictionText, setPredictionText] = useState<string>(() =>
    generateFallbackNumerology('0958889999', 75, 'เลขมหาจักรพรรดิแห่งสติปัญญาและโชคลาภ')
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentReadingIdRef = useRef<string | null>(null);

  // Load saved reading if :id parameter exists in URL
  useEffect(() => {
    if (id && id !== currentReadingIdRef.current) {
      currentReadingIdRef.current = id;
      storageService.getReadingByIdAsync(id).then((match) => {
        if (match) {
          const num = match.meta?.number || match.question?.replace(/.*: /, '') || '';
          if (num) setPhoneNumber(num);
          if (match.meta?.numberType) setNumberType(match.meta.numberType);
          if (match.resultText) {
            setPredictionText(match.resultText);
            const math = analyzeNumerologyInput(num);
            setResult(math);
            setUseAi(true);
          }
        }
      });
    }
  }, [id]);

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
    setAiError(null);

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
    setPredictionText('');

    const tempId = Date.now().toString();
    currentReadingIdRef.current = tempId;
    const typeLabel = numberType === 'phone' ? 'เบอร์โทรศัพท์' : numberType === 'car' ? 'ทะเบียนรถ' : numberType === 'house' ? 'บ้านเลขที่' : 'เลขบัตร/บัญชี';
    const historyEntryDraft: SavedReading = {
      id: tempId,
      timestamp: Date.now(),
      category: 'numerology',
      title: `วิเคราะห์${typeLabel}: ${mathResult.cleanDigits || numStr}`,
      subtitle: `ผลรวม ${mathResult.sumValue} (${mathResult.sumMeaning.title})`,
      question: `วิเคราะห์${typeLabel} ${mathResult.cleanDigits || numStr}`,
      meta: { number: numStr, cleanDigits: mathResult.cleanDigits, sumValue: mathResult.sumValue, sumTitle: mathResult.sumMeaning.title, numberType },
    };

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
        apiSettings || { apiKey: '', baseUrl: '', model: '' },
        (chunk) => {
          setPredictionText((prev) => prev + chunk);
        },
        historyEntryDraft
      );
      setPredictionText(aiText);
      setAiError(null);

      // Auto save AI Numerology reading to history
      if (aiText && mathResult) {
        const isCustomKey = apiSettings?.mode === 'custom' && !!apiSettings?.apiKey;
        const newEntry: SavedReading = {
          ...historyEntryDraft,
          resultText: aiText,
          creditsUsed: isCustomKey ? 0 : getLastCreditsDeducted(),
        };
        const updated = storageService.saveReading(newEntry);
        if (onSaveHistory) onSaveHistory(updated);
        navigate(`/numerology/reading/${tempId}`, { replace: true });
      }
    } catch (err: any) {
      console.error('Failed AI completion in NumerologyPage:', err);
      const errMsg = err?.message || 'ไม่สามารถประมวลผลคำขอ AI ถอดรหัสตัวเลขได้ในขณะนี้';
      setAiError(errMsg);
      setPredictionText('');
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
      <ModulePageHeader
        icon={Hash}
        iconClassName={theme.iconColor}
        eyebrow="เลขศาสตร์ · เบอร์มงคล"
        title="วิเคราะห์ตัวเลข & เบอร์มงคล"
        description="ใส่เบอร์โทร ทะเบียนรถ หรือเลขบ้าน — คำนวณเกรดมงคลทันที เสริมด้วย AI ได้"
      />

      <NumerologyPresets sampleNumbers={SAMPLE_NUMBERS} onSelectSample={handleSelectSample} />

      <AiModeToggle
        useAi={useAi}
        disabled={isAnalyzing}
        accentClassName={theme.iconColor}
        statusText={
          isAnalyzing
            ? 'กำลังวิเคราะห์…'
            : useAi
              ? 'ใช้เครดิตเมื่อขอคำทำนาย AI'
              : 'คำนวณผลคลาสสิกทันที'
        }
        onChange={setUseAi}
      />

      {/* Input Form Card */}
      <div className="rounded-2xl p-5 sm:p-7 border border-slate-800 bg-slate-900/40 space-y-5">
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
          <button
            type="button"
            onClick={() => handleSelectCategory('phone')}
            className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              numberType === 'phone'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-cyan-500/40'
            }`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">เบอร์โทรศัพท์</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('car')}
            className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              numberType === 'car'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-cyan-500/40'
            }`}
          >
            <Car className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">ทะเบียนรถ</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('house')}
            className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              numberType === 'house'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-cyan-500/40'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">บ้านเลขที่</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('card')}
            className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              numberType === 'card'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-cyan-200 hover:border-cyan-500/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
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
            <PrimaryAnalyzeButton
              type="submit"
              loading={isAnalyzing}
              disabled={!phoneNumber.trim()}
              label={analyzeButtonLabel(useAi, 'ตัวเลข')}
              className="shrink-0"
            />
          </div>
        </form>
      </div>

      {/* Analysis Result Card Showcase */}
      {result && (
        <div
          ref={resultCardRef}
          className="rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/40 space-y-6"
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

          {/* AI Error Fallback Banner */}
          {aiError && (
            <AiErrorFallbackCard
              errorMessage={aiError}
              onRetry={() => handleAnalyze(phoneNumber, true)}
              onOpenCreditCenter={onOpenCreditCenter}
              onOpenSettings={onOpenSettings}
            />
          )}

          {isAnalyzing && !predictionText && (
            <PredictionLoading message="กำลังวิเคราะห์ตัวเลข…" />
          )}

          {predictionText && (
            <PredictionPanel
              title={`วิเคราะห์ตัวเลข · ${result.cleanDigits}`}
              isStreaming={isAnalyzing}
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
