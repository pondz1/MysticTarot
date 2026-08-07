import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ZODIAC_SIGNS,
  getZodiacClassicPrediction,
  getZodiacAspectScores,
  findZodiacSignByBirthdate,
  ELEMENT_STYLE_MAP,
} from '../data/zodiacData';
import type { ZodiacSign } from '../types/horoscope';
import {
  Sparkles,
  Star,
  Calendar,
  Moon,
  Search,
  Hash,
  Palette,
} from 'lucide-react';
import type { ApiSettings, SavedReading } from '../../../types';
import { analyzeZodiacHoroscope } from '../../../services/aiService';
import { storageService } from '../../../services/storageService';
import { getLastCreditsDeducted } from '../../../services/ai/aiClient';
import { MODULE_THEMES } from '../../../constants/moduleThemes';
import { isAbortError, useAiAbortController } from '../../../hooks/useAiAbortController';

import { BirthdateZodiacFinder } from '../components/BirthdateZodiacFinder';
import { ZodiacGrid } from '../components/ZodiacGrid';
import { ZodiacAspectBars } from '../components/ZodiacAspectBars';

import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';
import { ModulePageHeader } from '../../../components/common/ModulePageHeader';
import { AiModeToggle } from '../../../components/common/AiModeToggle';
import {
  PredictionLoading,
  PredictionPanel,
  PrimaryAnalyzeButton,
  analyzeButtonLabel,
} from '../../../components/common/PredictionPanel';

interface HoroscopePageProps {
  apiSettings: ApiSettings;
  onOpenSettings?: () => void;
  onOpenCreditCenter?: () => void;
  onSaveHistory?: (readings: SavedReading[]) => void;
}

export const HoroscopePage: React.FC<HoroscopePageProps> = ({
  apiSettings,
  onOpenSettings,
  onOpenCreditCenter,
  onSaveHistory,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const aiAbort = useAiAbortController();
  const theme = MODULE_THEMES.horoscope;
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(ZODIAC_SIGNS[0]);
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');
  const [useAi, setUseAi] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const currentReadingIdRef = useRef<string | null>(null);

  // Load saved reading if :id parameter exists in URL
  useEffect(() => {
    if (id && id !== currentReadingIdRef.current) {
      currentReadingIdRef.current = id;
      storageService.getReadingByIdAsync(id).then((match) => {
        if (match) {
          if (match.meta?.signId) {
            const found = ZODIAC_SIGNS.find((s) => s.id === match.meta?.signId);
            if (found) setSelectedSign(found);
          }
          if (match.meta?.timeframe) {
            setTimeframe(match.meta.timeframe);
          }
          if (match.resultText) {
            setPrediction(match.resultText);
            setUseAi(true);
          }
        }
      });
    }
  }, [id]);

  // Birthdate Finder state
  const [birthMonth, setBirthMonth] = useState<number>(6);
  const [birthDay, setBirthDay] = useState<number>(15);
  const [showFinder, setShowFinder] = useState<boolean>(false);

  // Copy prediction state
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyPrediction = () => {
    if (!prediction) return;
    navigator.clipboard.writeText(prediction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleFetchHoroscope = async (
    sign: ZodiacSign = selectedSign,
    mode: 'daily' | 'monthly' = timeframe,
    withAi: boolean = useAi
  ) => {
    if (isLoading) return; // Prevent spamming API requests while processing
    setSelectedSign(sign);
    setAiError(null);
    if (!withAi) {
      // Classic Offline Interpretation (Instant 0ms response)
      const classicText = getZodiacClassicPrediction(sign, mode);
      setPrediction(classicText);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPrediction('');

    const tempId = Date.now().toString();
    currentReadingIdRef.current = tempId;
    const historyEntryDraft: SavedReading = {
      id: tempId,
      timestamp: Date.now(),
      category: 'horoscope',
      title: `ดวง${sign.nameTh} (${mode === 'daily' ? 'ประจำวัน' : 'รายเดือน'})`,
      subtitle: `ราศี${sign.nameTh} (${sign.dateRange})`,
      question: `ดวงชะตาราศี${sign.nameTh} (${mode === 'daily' ? 'ประจำวัน' : 'รายเดือน'})`,
      meta: { signId: sign.id, signName: sign.nameTh, timeframe: mode },
    };

    try {
      const res = await analyzeZodiacHoroscope(
        sign.nameTh,
        sign.elementTh,
        mode,
        apiSettings,
        (chunk) => {
          setPrediction((prev) => prev + chunk);
        },
        historyEntryDraft,
        aiAbort.start()
      );
      setPrediction(res);
      setAiError(null);

      // Save reading locally and update state
      if (res) {
        const isCustomKey = apiSettings?.mode === 'custom' && !!apiSettings?.apiKey;
        const newEntry: SavedReading = {
          ...historyEntryDraft,
          resultText: res,
          creditsUsed: isCustomKey ? 0 : getLastCreditsDeducted(),
        };
        const updated = storageService.saveReading(newEntry);
        if (onSaveHistory) onSaveHistory(updated);
        navigate(`/horoscope/reading/${tempId}`, { replace: true });
      }
    } catch (err: any) {
      if (isAbortError(err)) return;
      console.error('Failed AI completion in HoroscopePage:', err);
      const errMsg = err?.message || 'ไม่สามารถประมวลผลคำขอ AI ดูดวงราศีได้ในขณะนี้';
      setAiError(errMsg);
      setPrediction('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindZodiac = (e: React.FormEvent) => {
    e.preventDefault();
    const foundSign = findZodiacSignByBirthdate(birthMonth, birthDay);
    setSelectedSign(foundSign);
    setShowFinder(false);
    if (!useAi) {
      setPrediction(getZodiacClassicPrediction(foundSign, timeframe));
    } else {
      handleFetchHoroscope(foundSign, timeframe, true);
    }
    if (resultCardRef.current) {
      resultCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handleFetchHoroscope(selectedSign, timeframe, false);
  }, []);

  const aspectScores = getZodiacAspectScores(selectedSign, timeframe);
  const activeElementStyle = ELEMENT_STYLE_MAP[selectedSign.element];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      <ModulePageHeader
        icon={Star}
        iconClassName={theme.iconColor}
        eyebrow="12 ราศี · รายวัน / รายเดือน"
        title="ทำนายดวงชะตา 12 ราศี"
        description="เลือกราศี ดูดวงประจำวันหรือรายเดือน — ใช้มาตรฐานฟรี หรือ AI ลึกขึ้น"
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowFinder(!showFinder)}
          aria-expanded={showFinder}
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Search className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
          <span>{showFinder ? 'ปิดตัวค้นหาราศี' : 'ค้นหาราศีจากวันเกิด'}</span>
        </button>
      </div>

      {showFinder && (
        <BirthdateZodiacFinder
          birthDay={birthDay}
          setBirthDay={setBirthDay}
          birthMonth={birthMonth}
          setBirthMonth={setBirthMonth}
          onSubmit={handleFindZodiac}
          primaryBtnStyle={theme.primaryBtn}
        />
      )}

      <AiModeToggle
        useAi={useAi}
        disabled={isLoading}
        accentClassName={theme.iconColor}
        statusText={
          isLoading
            ? 'กำลังประมวลผล…'
            : useAi
              ? 'ใช้เครดิตเมื่อขอคำทำนาย AI'
              : 'อ่านผลคลาสสิกทันที'
        }
        onChange={(next) => {
          setUseAi(next);
          if (!next) {
            setPrediction(getZodiacClassicPrediction(selectedSign, timeframe));
          }
        }}
      />

      {/* Zodiac Grid Selection */}
      <ZodiacGrid
        zodiacSigns={ZODIAC_SIGNS}
        selectedSign={selectedSign}
        onSelectSign={(sign) => {
          setSelectedSign(sign);
          if (!useAi) {
            setPrediction(getZodiacClassicPrediction(sign, timeframe));
          }
        }}
        isLoading={isLoading}
      />

      {/* Timeframe + primary CTA */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setTimeframe('daily');
              if (!useAi) {
                setPrediction(getZodiacClassicPrediction(selectedSign, 'daily'));
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed text-slate-500'
                : timeframe === 'daily'
                  ? 'bg-amber-500 text-slate-950 cursor-pointer'
                  : 'text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>ประจำวัน</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setTimeframe('monthly');
              if (!useAi) {
                setPrediction(getZodiacClassicPrediction(selectedSign, 'monthly'));
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed text-slate-500'
                : timeframe === 'monthly'
                  ? 'bg-amber-500 text-slate-950 cursor-pointer'
                  : 'text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <Moon className="w-4 h-4" aria-hidden="true" />
            <span>รายเดือน</span>
          </button>
        </div>

        <PrimaryAnalyzeButton
          loading={isLoading}
          disabled={isLoading}
          onClick={() => handleFetchHoroscope(selectedSign, timeframe, useAi)}
          label={analyzeButtonLabel(useAi, selectedSign.nameTh)}
        />
      </div>

      <div
        ref={resultCardRef}
        className="rounded-2xl p-4 sm:p-6 border border-slate-800 bg-slate-900/40 space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/30 border border-purple-400/40 flex items-center justify-center overflow-hidden shadow-xl shrink-0 relative">
            <img
              src={`/zodiac/${selectedSign.id}.png`}
              alt={selectedSign.nameTh}
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = 'block';
              }}
            />
            <span className="hidden text-4xl sm:text-5xl">{selectedSign.symbol}</span>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-purple-200">{selectedSign.nameTh} ({selectedSign.nameEn})</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeElementStyle.badgeBg}`}>
                {selectedSign.elementTh}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">ช่วงวันที่: {selectedSign.dateRange} | ดาวครองราศี: {selectedSign.rulingPlanet}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
              {selectedSign.traits.map((trait, idx) => (
                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Sparkles className={`w-3 h-3 ${theme.iconColor} shrink-0`} />
                  <span>{trait}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Aspect Rating Bars (คะแนนดวงมงคล 4 ด้าน) */}
        <ZodiacAspectBars
          aspectScores={aspectScores}
          timeframe={timeframe}
          iconColorClass={theme.iconColor}
        />

        {/* AI Error Fallback Banner */}
        {aiError && (
          <AiErrorFallbackCard
            errorMessage={aiError}
            onRetry={() => handleFetchHoroscope(selectedSign, timeframe, true)}
            onOpenCreditCenter={onOpenCreditCenter}
            onOpenSettings={onOpenSettings}
          />
        )}

        <div className="space-y-4">
          {isLoading && !prediction ? (
            <PredictionLoading message="กำลังวิเคราะห์ดวงราศี…" />
          ) : prediction ? (
            <PredictionPanel
              title={`ดวง${selectedSign.nameTh} · ${timeframe === 'daily' ? 'ประจำวัน' : 'รายเดือน'}`}
              isStreaming={isLoading}
              onCopy={handleCopyPrediction}
              copied={copied}
              markdown={prediction}
            />
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
              เลือกราศี แล้วกด「{analyzeButtonLabel(useAi)}」เพื่อดูผล
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
                เลขนำโชค
              </span>
              <span className="text-sm font-semibold text-slate-200 tabular-nums">
                {selectedSign.luckyNumber.join(', ')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
                สีมงคล
              </span>
              <span className="text-sm font-semibold text-slate-200 text-right">
                {selectedSign.luckyColor.join(' / ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
