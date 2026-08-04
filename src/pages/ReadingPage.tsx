import React, { useState } from 'react';
import { SpreadSelector } from '../components/reading/SpreadSelector';
import { QuestionInput } from '../components/reading/QuestionInput';
import { TarotDeck } from '../components/reading/TarotDeck';
import { CardDisplay } from '../components/reading/CardDisplay';
import { ReadingResult } from '../components/reading/ReadingResult';
import type { ApiSettings, DrawnCard, SavedReading, SpreadMode } from '../types/tarot';
import { analyzeTarotReading, generateFallbackReading } from '../services/aiService';
import { storageService } from '../services/storageService';
import type { TarotCard } from '../data/tarotCards';
import { Sparkles } from 'lucide-react';

interface ReadingPageProps {
  apiSettings: ApiSettings;
  onOpenCardDetails: (card: { card: TarotCard; isReversed?: boolean }) => void;
  savedReadings: SavedReading[];
  setSavedReadings: React.Dispatch<React.SetStateAction<SavedReading[]>>;
}

export const ReadingPage: React.FC<ReadingPageProps> = ({
  apiSettings,
  onOpenCardDetails,
  setSavedReadings
}) => {
  // Mode selection ('single' | 'three' | 'four' | 'five' | 'celtic')
  const [spreadMode, setSpreadMode] = useState<SpreadMode>('single');

  // User Question Input
  const [question, setQuestion] = useState<string>('');

  // Selected Drawn Cards
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);

  // AI Reading Result Text & Loading State
  const [readingResult, setReadingResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSavedCurrent, setIsSavedCurrent] = useState<boolean>(false);

  // Save Current Reading to History
  const handleSaveCurrentReading = () => {
    if (!readingResult || drawnCards.length === 0 || isSavedCurrent) return;

    const newEntry: SavedReading = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      question: question || 'ดวงชะตาและภาพรวมชีวิตประจำวัน',
      spreadMode,
      drawnCards,
      resultText: readingResult,
    };

    const updated = storageService.saveReading(newEntry);
    setSavedReadings(updated);
    setIsSavedCurrent(true);
  };

  // Handle when cards are selected from TarotDeck
  const handleCardsSelected = async (
    cards: DrawnCard[],
    useAi: boolean = true,
    deckFilter: 'all' | 'major' | 'minor' = 'all'
  ) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDrawnCards(cards);
    setIsAnalyzing(true);
    setReadingResult('');
    setIsSavedCurrent(false);

    try {
      if (useAi) {
        const analysis = await analyzeTarotReading(question, cards, spreadMode, apiSettings, deckFilter);
        setReadingResult(analysis);
      } else {
        // Direct classic offline interpretation (0ms instant response)
        const classicReading = generateFallbackReading(question, cards, spreadMode);
        setReadingResult(classicReading);
      }
    } catch (err) {
      console.error(err);
      setReadingResult('เกิดข้อผิดพลาดในการวิเคราะห์ไพ่ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset all for a new reading
  const handleResetNewReading = () => {
    setDrawnCards([]);
    setReadingResult('');
    setIsSavedCurrent(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section Banner */}
      <div className="text-center my-2 sm:my-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs mb-2 sm:mb-3 shadow-inner">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>ศาสตร์แห่งไพ่ยิปซี & ปัญญาประดิษฐ์จักรวาล</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif-mystic text-gold-gradient tracking-tight leading-tight pt-2">
          หยั่งรู้ดวงชะตาสลักชะตาชีวิต
        </h1>
        <p className="text-[11px] sm:text-sm text-purple-200/80 mt-1.5 sm:mt-2 font-light leading-relaxed max-w-xl mx-auto">
          เลือกรูปแบบไพ่ยิปซี พิมพ์เรื่องราวที่คุณอยากรู้ แล้วให้พลังแห่งสถิตไพ่และ AI ช่วยวิเคราะห์คำตอบ
        </p>
      </div>

      {/* Step 1: Select Spread Mode */}
      {drawnCards.length === 0 && (
        <>
          <SpreadSelector
            mode={spreadMode}
            onSelectMode={(m) => {
              setSpreadMode(m);
              setDrawnCards([]);
            }}
            disabled={isAnalyzing}
          />

          {/* Step 2: Question Input */}
          <QuestionInput
            question={question}
            setQuestion={setQuestion}
            disabled={isAnalyzing}
          />
        </>
      )}

      {/* Step 3: Interactive Card Deck */}
      {drawnCards.length === 0 && (
        <TarotDeck
          spreadMode={spreadMode}
          onCardsSelected={handleCardsSelected}
          isAnalyzing={isAnalyzing}
        />
      )}

      {/* Step 4: Display Selected Cards */}
      {drawnCards.length > 0 && (
        <CardDisplay
          drawnCards={drawnCards}
          onOpenCardDetails={(dCard) => onOpenCardDetails({ card: dCard.card, isReversed: dCard.isReversed })}
        />
      )}

      {/* Step 5: AI Reading Result Output */}
      {(isAnalyzing || readingResult) && (
        <ReadingResult
          resultText={readingResult}
          isAnalyzing={isAnalyzing}
          onNewReading={handleResetNewReading}
          onSaveReading={handleSaveCurrentReading}
          isSaved={isSavedCurrent}
        />
      )}
    </div>
  );
};
