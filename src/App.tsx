import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ApiSettingsModal } from './components/modals/ApiSettingsModal';
import { CardDetailModal } from './components/modals/CardDetailModal';
import { HistoryModal } from './components/modals/HistoryModal';

import { HomePage } from './pages/HomePage';
import { TarotReadingPage } from './features/tarot/pages/TarotReadingPage';
import { TarotEncyclopediaPage } from './features/tarot/pages/TarotEncyclopediaPage';
import { HoroscopePage } from './features/horoscope/pages/HoroscopePage';
import { NumerologyPage } from './features/numerology/pages/NumerologyPage';
import { ThaiAstrologyPage } from './features/thai-astrology/pages/ThaiAstrologyPage';
import { FengShuiPage } from './features/feng-shui/pages/FengShuiPage';

import type { ApiSettings, SavedReading } from './features/tarot/types/tarot';
import { storageService } from './services/storageService';
import type { TarotCard } from './features/tarot/data/tarotCards';

export function App() {
  const navigate = useNavigate();

  // Modals Visibility
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [selectedInspectCard, setSelectedInspectCard] = useState<{ card: TarotCard; isReversed?: boolean } | null>(null);

  // Persistent API Settings in localStorage via storageService
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => storageService.getApiSettings());

  // Persistent Saved Readings in localStorage via storageService
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(() => storageService.getSavedReadings());

  // Save API Settings handler
  const handleSaveApiSettings = (newSettings: ApiSettings) => {
    setApiSettings(newSettings);
    storageService.saveApiSettings(newSettings);
  };

  // Clear Saved History
  const handleClearHistory = () => {
    storageService.clearSavedReadings();
    setSavedReadings([]);
  };

  // Load a reading from history
  const handleLoadHistoryReading = (reading: SavedReading) => {
    navigate(`/tarot/reading/${reading.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 bg-[#050510] relative overflow-hidden">

      {/* Background Star Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      {/* Navbar Header */}
      <Navbar
        onOpenSettings={() => setIsApiSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        hasCustomKey={!!apiSettings.apiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-col items-center">
        <Routes>
          {/* Platform Portal Home Route */}
          <Route path="/" element={<HomePage />} />

          {/* Tarot Module Routes */}
          <Route
            path="/tarot"
            element={
              <TarotReadingPage
                apiSettings={apiSettings}
                onOpenCardDetails={(inspect: { card: TarotCard; isReversed?: boolean }) => setSelectedInspectCard(inspect)}
                savedReadings={savedReadings}
                setSavedReadings={setSavedReadings}
              />
            }
          />
          <Route
            path="/tarot/reading/:id"
            element={
              <TarotReadingPage
                apiSettings={apiSettings}
                onOpenCardDetails={(inspect: { card: TarotCard; isReversed?: boolean }) => setSelectedInspectCard(inspect)}
                savedReadings={savedReadings}
                setSavedReadings={setSavedReadings}
              />
            }
          />
          <Route path="/tarot/encyclopedia" element={<TarotEncyclopediaPage />} />
          <Route path="/tarot/encyclopedia/:cardId" element={<TarotEncyclopediaPage />} />

          {/* Horoscope Module Route */}
          <Route path="/horoscope" element={<HoroscopePage apiSettings={apiSettings} />} />

          {/* Numerology Module Route */}
          <Route path="/numerology" element={<NumerologyPage />} />

          {/* Thai Astrology Module Route */}
          <Route path="/thai-astrology" element={<ThaiAstrologyPage />} />

          {/* Feng Shui Module Route */}
          <Route path="/feng-shui" element={<FengShuiPage />} />

          {/* Legacy Fallbacks */}
          <Route
            path="/reading/:id"
            element={
              <TarotReadingPage
                apiSettings={apiSettings}
                onOpenCardDetails={(inspect: { card: TarotCard; isReversed?: boolean }) => setSelectedInspectCard(inspect)}
                savedReadings={savedReadings}
                setSavedReadings={setSavedReadings}
              />
            }
          />
          <Route path="/encyclopedia/*" element={<Navigate to="/tarot/encyclopedia" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        settings={apiSettings}
        onSaveSettings={handleSaveApiSettings}
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
