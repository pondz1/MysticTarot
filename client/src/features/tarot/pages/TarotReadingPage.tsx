import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpreadSelector } from '../components/SpreadSelector';
import { QuestionInput } from '../components/QuestionInput';
import { TarotDeck } from '../components/TarotDeck';
import { CardDisplay } from '../components/CardDisplay';
import { ReadingResult } from '../components/ReadingResult';
import type { DrawnCard, SpreadMode } from '../types/tarot';
import type { ApiSettings, ChatMessage, SavedReading } from '../../../types';
import { getSpreadConfig } from '../data/tarotSpreads';
import { analyzeTarotReading, analyzeTarotFollowUp, generateFallbackReading } from '../../../services/aiService';
import { storageService } from '../../../services/storageService';
import { getLastCreditsDeducted } from '../../../services/ai/aiClient';
import type { TarotCard } from '../data/tarotCards';
import { TarotSubNav } from '../components/TarotSubNav';
import { ReadingProgressSteps, type ReadingStep } from '../components/ReadingProgressSteps';
import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';
import { isAbortError, useAiAbortController } from '../../../hooks/useAiAbortController';

interface ReadingPageProps {
  apiSettings: ApiSettings;
  onOpenCardDetails: (card: { card: TarotCard; isReversed?: boolean }) => void;
  savedReadings: SavedReading[];
  setSavedReadings: React.Dispatch<React.SetStateAction<SavedReading[]>>;
  onOpenSettings?: () => void;
  onOpenCreditCenter?: () => void;
}

export const TarotReadingPage: React.FC<ReadingPageProps> = ({
  apiSettings,
  onOpenCardDetails,
  savedReadings,
  setSavedReadings,
  onOpenSettings,
  onOpenCreditCenter,
}) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const aiAbort = useAiAbortController();
  const followUpAbort = useAiAbortController();

  // Mode selection ('single' | 'three' | 'four' | 'five' | 'celtic')
  const [spreadMode, setSpreadModeState] = useState<SpreadMode>(
    () => storageService.getDeckPreferences().spreadMode || 'three'
  );

  const setSpreadMode = (mode: SpreadMode) => {
    setSpreadModeState(mode);
    storageService.saveDeckPreferences({ spreadMode: mode });
  };

  // User Question Input
  const [question, setQuestion] = useState<string>('');

  // Selected Drawn Cards
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);

  // AI Reading Result Text & Loading State
  const [readingResult, setReadingResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSavedCurrent, setIsSavedCurrent] = useState<boolean>(false);

  // AI Follow-up Chat History & Sending state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filter settings from localStorage
  const deckFilter = storageService.getDeckPreferences().deckFilter || 'all';

  // Load existing reading by ID from URL params (/tarot/reading/:id)
  useEffect(() => {
    if (id) {
      storageService.getReadingByIdAsync(id).then((match) => {
        if (match) {
          setQuestion(match.question || '');
          if (match.spreadMode) setSpreadModeState(match.spreadMode);
          setDrawnCards(match.drawnCards || []);
          setReadingResult(match.resultText || '');
          setChatHistory(match.chatHistory || []);
          setIsSavedCurrent(true);
          setAiError(null);
        }
      });
    }
  }, [id, savedReadings]);

  // Execute reading analysis
  const handleCardsSelected = async (cards: DrawnCard[], useAi: boolean = true) => {
    setDrawnCards(cards);
    setIsAnalyzing(true);
    setReadingResult('');
    setAiError(null);
    const newId = Date.now().toString();

    try {
      let analysis = '';
      const historyEntryDraft: SavedReading = {
        id: newId,
        timestamp: Date.now(),
        category: 'tarot',
        title: `ไพ่ยิปซี: ${getSpreadConfig(spreadMode).titleTh}`,
        subtitle: question || 'ดวงชะตาและภาพรวมชีวิตประจำวัน',
        question: question || 'ดวงชะตาและภาพรวมชีวิตประจำวัน',
        spreadMode,
        drawnCards: cards,
      };

      if (useAi) {
        analysis = await analyzeTarotReading(
          question,
          cards,
          spreadMode,
          apiSettings,
          deckFilter,
          (chunk) => {
            setReadingResult((prev) => prev + chunk);
          },
          historyEntryDraft,
          aiAbort.start()
        );
      } else {
        analysis = generateFallbackReading(question, cards, spreadMode);
      }
      setReadingResult(analysis);
      setAiError(null);

      // Auto save reading
      const isCustomKey = apiSettings?.mode === 'custom' && !!apiSettings?.apiKey;
      const newEntry: SavedReading = {
        ...historyEntryDraft,
        resultText: analysis,
        chatHistory: [],
        creditsUsed: isCustomKey ? 0 : getLastCreditsDeducted(),
      };

      const updated = storageService.saveReading(newEntry);
      setSavedReadings(updated);
      setIsSavedCurrent(true);
      navigate(`/tarot/reading/${newId}`, { replace: true });
    } catch (err: any) {
      if (isAbortError(err)) return;
      console.error('Failed AI completion in TarotReadingPage:', err);
      const msg = err?.message || 'ไม่สามารถประมวลผลคำขอ AI ได้ในขณะนี้';
      setAiError(msg);
      setReadingResult('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send AI Follow-up Question
  const handleSendFollowUp = async (userQuestion: string) => {
    if (!userQuestion || isSendingFollowUp) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuestion,
      timestamp: Date.now(),
    };

    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholderMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const updatedHistoryWithUser = [...chatHistory, userMsg, aiPlaceholderMsg];
    setChatHistory(updatedHistoryWithUser);
    setIsSendingFollowUp(true);

    try {
      const readingId = id || Date.now().toString();
      const followUpHistoryEntry: Partial<SavedReading> = {
        id: readingId,
        timestamp: Date.now(),
        category: 'tarot',
        question: question || 'ดวงชะตาและภาพรวมชีวิตประจำวัน',
        spreadMode,
        drawnCards,
        resultText: readingResult,
        // User turns so far (no empty assistant placeholder) — server appends AI reply
        chatHistory: [...chatHistory, userMsg],
      };

      const aiResponseText = await analyzeTarotFollowUp({
        question,
        drawnCards,
        spreadMode,
        initialResult: readingResult,
        chatHistory: [...chatHistory, userMsg],
        newQuestion: userQuestion,
        settings: apiSettings,
        signal: followUpAbort.start(),
        historyEntry: followUpHistoryEntry,
        onChunk: (chunk) => {
          setChatHistory((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, content: msg.content + chunk } : msg
            )
          );
        },
      });

      const finalChatHistory = updatedHistoryWithUser.map((msg) =>
        msg.id === aiMsgId ? { ...msg, content: aiResponseText } : msg
      );
      setChatHistory(finalChatHistory);

      // Save updated reading with chat history
      if (readingResult && drawnCards.length > 0) {
        const currentId = id || Date.now().toString();
        const updatedReading: SavedReading = {
          id: currentId,
          timestamp: Date.now(),
          question: question || 'ดวงชะตาและภาพรวมชีวิตประจำวัน',
          spreadMode,
          drawnCards,
          resultText: readingResult,
          chatHistory: finalChatHistory,
        };
        const updatedList = storageService.saveReading(updatedReading);
        setSavedReadings(updatedList);
        setIsSavedCurrent(true);
      }
    } catch (err: any) {
      if (isAbortError(err)) {
        setChatHistory((prev) =>
          prev.filter((msg) => !(msg.id === aiMsgId && !msg.content))
        );
        return;
      }
      console.error('Failed follow-up Q&A:', err);
      // Remove empty assistant placeholder so UI does not look stuck mid-reply
      setChatHistory((prev) =>
        prev.filter((msg) => !(msg.id === aiMsgId && !msg.content))
      );
      // Re-throw so AiFollowUpChat can show recovery UI
      throw err;
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  // Save current reading to history
  const handleSaveCurrentReading = () => {
    if (readingResult && drawnCards.length > 0) {
      const currentId = id || Date.now().toString();
      const newEntry: SavedReading = {
        id: currentId,
        timestamp: Date.now(),
        question: question || 'ดวงชะตาและภาพรวมชีวิตประจำวัน',
        spreadMode,
        drawnCards,
        resultText: readingResult,
        chatHistory,
      };
      const updated = storageService.saveReading(newEntry);
      setSavedReadings(updated);
      setIsSavedCurrent(true);
    }
  };

  // Reset all for a new reading
  const handleResetNewReading = () => {
    setDrawnCards([]);
    setReadingResult('');
    setChatHistory([]);
    setIsSavedCurrent(false);
    setQuestion('');
    setAiError(null);
    navigate('/tarot');
  };

  const cardsDrawn = drawnCards.length > 0;
  const hasResult = Boolean(readingResult) || isAnalyzing;
  // Defaults cover steps 1–2; primary action before draw is pick cards (step 3)
  const progressStep: ReadingStep = cardsDrawn ? (hasResult ? 4 : 3) : 3;

  return (
    <div className="w-full flex flex-col items-center animate-fade-in pb-12">
      <TarotSubNav />

      {/* Compact header — less marketing, clearer job-to-be-done */}
      <header className="text-center my-2 sm:my-3 max-w-xl mx-auto px-2">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif-mystic text-amber-100 tracking-tight leading-snug">
          ทำนายดวงด้วยไพ่ยิปซี
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
          เลือกรูปแบบ · ตั้งคำถาม (ได้) · เลือกไพ่ · รับคำทำนาย
        </p>
      </header>

      <ReadingProgressSteps
        currentStep={progressStep}
        cardsDrawn={cardsDrawn}
        hasResult={hasResult}
      />

      {/* Setup: spread + question + deck */}
      {!cardsDrawn && (
        <>
          <SpreadSelector
            mode={spreadMode}
            onSelectMode={(m) => {
              setSpreadMode(m);
              setDrawnCards([]);
            }}
            disabled={isAnalyzing}
          />

          <QuestionInput
            question={question}
            setQuestion={setQuestion}
            disabled={isAnalyzing}
          />

          <div className="w-full max-w-5xl mx-auto px-2 mt-1 mb-1">
            <h2 className="text-xs sm:text-sm font-semibold text-amber-100/95 text-center sm:text-left px-1">
              ขั้นตอนที่ 3 · เลือกไพ่
            </h2>
          </div>

          <TarotDeck
            spreadMode={spreadMode}
            onCardsSelected={handleCardsSelected}
            isAnalyzing={isAnalyzing}
          />
        </>
      )}

      {cardsDrawn && (
        <CardDisplay
          drawnCards={drawnCards}
          onOpenCardDetails={(dCard) =>
            onOpenCardDetails({ card: dCard.card, isReversed: dCard.isReversed })
          }
        />
      )}

      {aiError && (
        <AiErrorFallbackCard
          errorMessage={aiError}
          onRetry={() => handleCardsSelected(drawnCards, true)}
          onOpenCreditCenter={onOpenCreditCenter}
          onOpenSettings={onOpenSettings}
        />
      )}

      {(isAnalyzing || readingResult) && (
        <ReadingResult
          resultText={readingResult}
          isAnalyzing={isAnalyzing}
          onNewReading={handleResetNewReading}
          onSaveReading={handleSaveCurrentReading}
          isSaved={isSavedCurrent}
          chatHistory={chatHistory}
          onSendFollowUp={handleSendFollowUp}
          isSendingFollowUp={isSendingFollowUp}
        />
      )}
    </div>
  );
};
