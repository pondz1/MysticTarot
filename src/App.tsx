import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SpreadSelector } from './components/SpreadSelector';
import { QuestionInput } from './components/QuestionInput';
import { TarotDeck } from './components/TarotDeck';
import { CardDisplay } from './components/CardDisplay';
import { ReadingResult } from './components/ReadingResult';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { CardListModal } from './components/CardListModal';
import { CardDetailModal } from './components/CardDetailModal';
import { HistoryModal } from './components/HistoryModal';
import type { SavedReading } from './components/HistoryModal';
import type { ApiSettings, DrawnCard } from './services/aiService';
import { DEFAULT_API_SETTINGS, analyzeTarotReading } from './services/aiService';
import type { TarotCard } from './data/tarotCards';
import { Sparkles, Wand2 } from 'lucide-react';

export function App() {
  // Mode selection ('single' | 'three')
  const [spreadMode, setSpreadMode] = useState<'single' | 'three'>('single');
  
  // User Question Input
  const [question, setQuestion] = useState<string>('');

  // Selected Drawn Cards
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);

  // AI Reading Result Text & Loading State
  const [readingResult, setReadingResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSavedCurrent, setIsSavedCurrent] = useState<boolean>(false);

  // Modals Visibility
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [isCardListOpen, setIsCardListOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [selectedInspectCard, setSelectedInspectCard] = useState<{ card: TarotCard; isReversed?: boolean } | null>(null);

  // Persistent API Settings in localStorage
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    try {
      const saved = localStorage.getItem('tarot_api_settings');
      return saved ? JSON.parse(saved) : DEFAULT_API_SETTINGS;
    } catch {
      return DEFAULT_API_SETTINGS;
    }
  });

  // Persistent Saved Readings in localStorage
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(() => {
    try {
      const saved = localStorage.getItem('tarot_saved_readings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Update localStorage when apiSettings changes
  const handleSaveApiSettings = (newSettings: ApiSettings) => {
    setApiSettings(newSettings);
    localStorage.setItem('tarot_api_settings', JSON.stringify(newSettings));
  };

  // Save Current Reading to History
  const handleSaveCurrentReading = () => {
    if (!readingResult || drawnCards.length === 0) return;
    const newEntry: SavedReading = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      question,
      spreadMode,
      drawnCards,
      resultText: readingResult
    };

    const updated = [newEntry, ...savedReadings];
    setSavedReadings(updated);
    localStorage.setItem('tarot_saved_readings', JSON.stringify(updated));
    setIsSavedCurrent(true);
  };

  // Clear Saved History
  const handleClearHistory = () => {
    setSavedReadings([]);
    localStorage.removeItem('tarot_saved_readings');
  };

  // Load a reading from history
  const handleLoadHistoryReading = (reading: SavedReading) => {
    setSpreadMode(reading.spreadMode);
    setQuestion(reading.question);
    setDrawnCards(reading.drawnCards);
    setReadingResult(reading.resultText);
    setIsSavedCurrent(true);
  };

  // Handle when cards are selected from TarotDeck
  const handleCardsSelected = async (cards: DrawnCard[]) => {
    setDrawnCards(cards);
    setIsAnalyzing(true);
    setReadingResult('');
    setIsSavedCurrent(false);

    try {
      const analysis = await analyzeTarotReading(question, cards, spreadMode, apiSettings);
      setReadingResult(analysis);
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
    <div className="min-h-screen flex flex-col justify-between text-slate-100 bg-[#050510] relative overflow-hidden">
      
      {/* Background Star Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      {/* Navbar Header */}
      <Navbar
        onOpenSettings={() => setIsApiSettingsOpen(true)}
        onOpenCardList={() => setIsCardListOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        hasCustomKey={!!apiSettings.apiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
        
        {/* Hero Section Banner */}
        <div className="text-center my-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Tarot Reading (OpenAI Compatible)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif-mystic text-gold-gradient tracking-tight leading-tight">
            หยั่งรู้ดวงชะตาสลักชะตาชีวิต
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-2 font-light leading-relaxed">
            เลือกรูปแบบไพ่ยิปซี พิมพ์เรื่องราวที่คุณอยากรู้ แล้วให้พลังแห่งสถิตไพ่และ AI ช่วยวิเคราะห์คำตอบและถอดรหัสชี้แนะเส้นทางชีวิต
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
            onOpenCardDetails={(dCard) => setSelectedInspectCard({ card: dCard.card, isReversed: dCard.isReversed })}
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

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-amber-500/20 glass-panel py-6 text-center text-xs text-purple-300/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 gap-2">
          <p className="flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Mystic Tarot AI Engine • Powered by OpenAI-compatible API</span>
          </p>
          <p>© 2026 Mystic Tarot AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        settings={apiSettings}
        onSaveSettings={handleSaveApiSettings}
      />

      <CardListModal
        isOpen={isCardListOpen}
        onClose={() => setIsCardListOpen(false)}
        onSelectCard={(card) => {
          setSelectedInspectCard({ card });
          setIsCardListOpen(false);
        }}
      />

      <CardDetailModal
        card={selectedInspectCard?.card || null}
        isReversed={selectedInspectCard?.isReversed}
        onClose={() => setSelectedInspectCard(null)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedReadings={savedReadings}
        onLoadReading={handleLoadHistoryReading}
        onClearHistory={handleClearHistory}
      />

    </div>
  );
}

export default App;
