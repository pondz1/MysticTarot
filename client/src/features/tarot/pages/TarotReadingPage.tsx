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
import { Sparkles } from 'lucide-react';
import { TarotSubNav } from '../components/TarotSubNav';
import { MODULE_THEMES } from '../../../constants/moduleThemes';
import { AiErrorFallbackCard } from '../../../components/common/AiErrorFallbackCard';

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
  const theme = MODULE_THEMES.tarot;
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

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
          historyEntryDraft
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
      console.error('Failed AI completion in TarotReadingPage:', err);
      const msg = err?.message || 'ไม่สามารถประมวลผลคำขอ AI ได้ในขณะนี้';
      setAiError(msg);
      setReadingResult('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseOfflineFallback = () => {
    if (drawnCards.length > 0) {
      const fallbackText = generateFallbackReading(question, drawnCards, spreadMode);
      setReadingResult(fallbackText);
      setAiError(null);
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
      const aiResponseText = await analyzeTarotFollowUp({
        question,
        drawnCards,
        spreadMode,
        initialResult: readingResult,
        chatHistory: [...chatHistory, userMsg],
        newQuestion: userQuestion,
        settings: apiSettings,
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
      console.error('Failed follow-up Q&A:', err);
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

  return (
    <div className="w-full flex flex-col items-center animate-fade-in pb-12">
      {/* Tarot Feature Sub Navigation Tabs */}
      <TarotSubNav />

      {/* Hero Section Banner */}
      <div className="text-center my-2 sm:my-4 max-w-2xl mx-auto">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full ${theme.badgeBg} text-[10px] sm:text-xs mb-2 sm:mb-3 shadow-inner`}>
          <Sparkles className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${theme.iconColor}`} />
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

      {/* AI Error Fallback Banner */}
      {aiError && (
        <AiErrorFallbackCard
          errorMessage={aiError}
          onRetry={() => handleCardsSelected(drawnCards, true)}
          onUseOfflineFallback={handleUseOfflineFallback}
          onOpenCreditCenter={onOpenCreditCenter}
          onOpenSettings={onOpenSettings}
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
          chatHistory={chatHistory}
          onSendFollowUp={handleSendFollowUp}
          isSendingFollowUp={isSendingFollowUp}
        />
      )}
    </div>
  );
};
