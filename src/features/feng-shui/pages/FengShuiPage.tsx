import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DAILY_LUCKY_COLORS_TABLE, DAILY_AUSPICIOUS_DIRECTIONS_MAP, getDynamicFengShuiTips } from '../data/fengShuiData';
import {
  Compass,
  Palette,
  Home,
  CheckCircle2,
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
import type { ApiSettings } from '../../tarot/types/tarot';
import { MODULE_THEMES } from '../../../constants/moduleThemes';
import { analyzeFengShui, generateFallbackFengShui } from '../../../services/aiService';

interface FengShuiPageProps {
  apiSettings?: ApiSettings;
}

const SPACE_OPTIONS = [
  { id: 'desk', label: 'โต๊ะทำงาน / มุมทำงาน' },
  { id: 'bedroom', label: 'ห้องนอน / ทิศทางเตียง' },
  { id: 'entrance', label: 'ประตูหน้าบ้าน / ทางเข้าหลัก' },
  { id: 'cashier', label: 'ร้านค้า / โต๊ะแคชเชียร์' },
  { id: 'overall', label: 'ภาพรวมบ้าน & ที่อยู่อาศัย' },
];

export const FengShuiPage: React.FC<FengShuiPageProps> = ({ apiSettings }) => {
  const theme = MODULE_THEMES['feng-shui'];
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedSpace, setSelectedSpace] = useState<string>('โต๊ะทำงาน / มุมทำงาน');
  const [useAi, setUseAi] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionText, setPredictionText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const currentDayInfo = DAILY_LUCKY_COLORS_TABLE[selectedDayIndex];
  const resultCardRef = useRef<HTMLDivElement>(null);

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
    try {
      const aiText = await analyzeFengShui(
        currentDayInfo.dayNameTh,
        luckyWorkStr,
        luckyWealthStr,
        luckyLoveStr,
        unluckyStr,
        selectedSpace,
        apiSettings
      );
      setPredictionText(aiText);
    } catch (err) {
      console.error(err);
      setPredictionText(
        generateFallbackFengShui(
          currentDayInfo.dayNameTh,
          luckyWorkStr,
          luckyWealthStr,
          luckyLoveStr,
          unluckyStr,
          selectedSpace
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className={`${theme.cardBg} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-emerald-400" />
              <span>เลือกตำแหน่งพื้นที่ต้องการจัดฮวงจุ้ย:</span>
            </label>
            <select
              value={selectedSpace}
              onChange={(e) => {
                setSelectedSpace(e.target.value);
                if (!useAi) {
                  setPredictionText(
                    generateFallbackFengShui(
                      currentDayInfo.dayNameTh,
                      currentDayInfo.luckyWork.join(', '),
                      currentDayInfo.luckyWealth.join(', '),
                      currentDayInfo.luckyLove.join(', '),
                      currentDayInfo.unluckyForbidden.join(', '),
                      e.target.value
                    )
                  );
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-400 text-sm font-medium"
            >
              {SPACE_OPTIONS.map((sp) => (
                <option key={sp.id} value={sp.label}>
                  {sp.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAnalyzeFengShui(useAi)}
            className={`w-full px-6 py-2.5 rounded-xl ${theme.primaryBtn} font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{useAi ? 'ขอคำแนะนำฮวงจุ้ยด้วย AI' : 'ดูคำทำนายออฟไลน์'}</span>
          </button>
        </div>
      </div>

      {/* Daily Color Grid Card */}
      <div className={`${theme.cardBg} rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className={`w-10 h-10 rounded-xl ${theme.badgeBg} flex items-center justify-center shadow-xs`}>
            <Palette className={`w-5 h-5 ${theme.iconColor}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-200">ตารางสีมงคลประจำ{currentDayInfo.dayNameTh}</h2>
            <p className="text-xs text-slate-400">เลือกแต่งกายด้วยสีมงคลดึงดูดพลังงานบวกในแต่ละด้าน</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2 shadow-xs">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>การงานเลื่อนขั้น:</span>
            </span>
            <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyWork.join(', ')}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2 shadow-xs">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>การเงินโชคลาภ:</span>
            </span>
            <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyWealth.join(', ')}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-pink-500/30 space-y-2 shadow-xs">
            <span className="text-xs font-semibold text-pink-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>ความรักเมตตา:</span>
            </span>
            <div className="text-sm font-bold text-slate-200">{currentDayInfo.luckyLove.join(', ')}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-800/60 space-y-2 bg-rose-950/15 shadow-xs">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
              <span>สีต้องห้าม/ฉุดดวง:</span>
            </span>
            <div className="text-sm font-bold text-rose-300">{currentDayInfo.unluckyForbidden.join(', ')}</div>
          </div>
        </div>
      </div>

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
          </div>
        </div>
      )}

      {/* Dynamic Auspicious Directions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Compass className={`w-5 h-5 ${theme.iconColor}`} />
            <span>ทิศมงคลประจำ{currentDayInfo.dayNameTh} (Auspicious Directions)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            อัปเดตทิศมงคลและทิศกาลกิณีตามวันประจำสัปดาห์
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(DAILY_AUSPICIOUS_DIRECTIONS_MAP[selectedDayIndex] || DAILY_AUSPICIOUS_DIRECTIONS_MAP[0]).map((dir, idx) => {
            const isAvoid = dir.category === 'avoid';
            const isWork = dir.category === 'work';
            const isWealth = dir.category === 'wealth';
            const isLove = dir.category === 'love';

            const cardBorder = isAvoid
              ? 'border-rose-900/60 bg-rose-950/10 hover:border-rose-500/50'
              : isWork
              ? 'border-blue-500/30 hover:border-blue-400/60 bg-slate-900/80'
              : isWealth
              ? 'border-amber-500/30 hover:border-amber-400/60 bg-slate-900/80'
              : 'border-pink-500/30 hover:border-pink-400/60 bg-slate-900/80';

            const titleColor = isAvoid
              ? 'text-rose-300'
              : isWork
              ? 'text-blue-300'
              : isWealth
              ? 'text-amber-300'
              : 'text-pink-300';

            return (
              <div key={idx} className={`p-5 rounded-2xl border space-y-2.5 transition-all shadow-xs ${cardBorder}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-base flex items-center gap-2 ${titleColor}`}>
                    {isWork && <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />}
                    {isWealth && <Coins className="w-4 h-4 text-amber-400 shrink-0" />}
                    {isLove && <Heart className="w-4 h-4 text-pink-400 shrink-0" />}
                    {isAvoid && <Stethoscope className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{dir.directionTh}</span>
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${isAvoid ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-slate-950 text-emerald-300 border-slate-700'}`}>
                    {dir.angle}
                  </span>
                </div>
                <span className={`text-xs font-semibold block ${isAvoid ? 'text-rose-400' : 'text-emerald-400'}`}>{dir.energyType}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{dir.benefit}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Feng Shui Tips per Day & Space */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Home className={`w-5 h-5 ${theme.iconColor}`} />
            <span>เคล็ดลับจัดฮวงจุ้ย ({selectedSpace}) ประจำ{currentDayInfo.dayNameTh}</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            แนะนำวิธีปรับพลังงานชี่รับทรัพย์ตามตำแหน่งพื้นที่และวันเกิด
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {getDynamicFengShuiTips(selectedDayIndex, selectedSpace).map((tip, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition-all shadow-xs">
              <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{tip.title}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
