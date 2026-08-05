import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ApiSettingsModal } from './components/modals/ApiSettingsModal';
import { CardDetailModal } from './components/modals/CardDetailModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { ReadingPage } from './pages/ReadingPage';
import { EncyclopediaPage } from './pages/EncyclopediaPage';
import type { ApiSettings, SavedReading } from './types/tarot';
import { storageService } from './services/storageService';
import type { TarotCard } from './data/tarotCards';

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
    navigate(`/reading/${reading.id}`);
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
          {/* Home / Reading Route */}
          <Route
            path="/"
            element={
              <ReadingPage
                apiSettings={apiSettings}
                onOpenCardDetails={(inspect) => setSelectedInspectCard(inspect)}
                savedReadings={savedReadings}
                setSavedReadings={setSavedReadings}
              />
            }
          />
          <Route
            path="/reading/:id"
            element={
              <ReadingPage
                apiSettings={apiSettings}
                onOpenCardDetails={(inspect) => setSelectedInspectCard(inspect)}
                savedReadings={savedReadings}
                setSavedReadings={setSavedReadings}
              />
            }
          />

          {/* Encyclopedia Routes */}
          <Route path="/encyclopedia" element={<EncyclopediaPage />} />
          <Route path="/encyclopedia/:cardId" element={<EncyclopediaPage />} />

          {/* Fallback Route */}
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
