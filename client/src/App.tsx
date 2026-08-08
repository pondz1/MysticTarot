import { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ApiSettingsModal } from './components/modals/ApiSettingsModal';
import { CreditCenterModal } from './components/modals/CreditCenterModal';
import { CardDetailModal } from './components/modals/CardDetailModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { Sparkles } from 'lucide-react';

import { HomePage } from './pages/HomePage';
import type { ApiSettings, SavedReading } from './types';
import { storageService } from './services/storageService';
import type { TarotCard } from './features/tarot/data/tarotCards';
import {
  isTopupReturnSearch,
  resolveReturnOrderId,
  resolveTopupReturnStatus,
  type TopupReturnResult,
} from './services/topupReturn';

import { lazyWithRetry } from './utils/lazyWithRetry';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Code Splitting with lazyWithRetry (auto-reloads on stale chunk error)
const TarotReadingPage = lazyWithRetry(() =>
  import('./features/tarot/pages/TarotReadingPage').then((m) => ({ default: m.TarotReadingPage }))
);
const TarotEncyclopediaPage = lazyWithRetry(() =>
  import('./features/tarot/pages/TarotEncyclopediaPage').then((m) => ({ default: m.TarotEncyclopediaPage }))
);
const HoroscopePage = lazyWithRetry(() =>
  import('./features/horoscope/pages/HoroscopePage').then((m) => ({ default: m.HoroscopePage }))
);
const NumerologyPage = lazyWithRetry(() =>
  import('./features/numerology/pages/NumerologyPage').then((m) => ({ default: m.NumerologyPage }))
);
const ThaiAstrologyPage = lazyWithRetry(() =>
  import('./features/thai-astrology/pages/ThaiAstrologyPage').then((m) => ({ default: m.ThaiAstrologyPage }))
);
const FengShuiPage = lazyWithRetry(() =>
  import('./features/feng-shui/pages/FengShuiPage').then((m) => ({ default: m.FengShuiPage }))
);

const PageLoadingFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400" role="status">
    <Sparkles className="w-7 h-7 text-amber-400/80" aria-hidden="true" />
    <p className="text-xs sm:text-sm font-medium tracking-wide">กำลังโหลด…</p>
  </div>
);

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Modals Visibility
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [isCreditCenterOpen, setIsCreditCenterOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [selectedInspectCard, setSelectedInspectCard] = useState<{ card: TarotCard; isReversed?: boolean } | null>(null);
  /** After bank OTP / 3DS redirect back to the app */
  const [topupReturnResult, setTopupReturnResult] = useState<TopupReturnResult | null>(null);

  const handleOpenSettings = (defaultTab?: 'credit' | 'custom') => {
    if (defaultTab === 'credit') {
      setIsCreditCenterOpen(true);
    } else {
      setIsApiSettingsOpen(true);
    }
  };

  // Persistent API Settings in localStorage via storageService
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => storageService.getApiSettings());

  // Persistent Saved Readings in localStorage via storageService
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(() => storageService.getSavedReadings());

  // Async sync saved readings from backend on mount
  useEffect(() => {
    storageService.fetchSavedReadingsAsync().then((items) => {
      if (items && Array.isArray(items)) {
        setSavedReadings(items);
      }
    });
  }, []);

  // Resume top-up after 3-D Secure / bank OTP redirect (?topup=return&order=...)
  useEffect(() => {
    if (!isTopupReturnSearch(location.search)) return;

    const orderId = resolveReturnOrderId(location.search);
    const path = location.pathname || '/';
    // Clean query so refresh does not re-run forever (do not cancel the status fetch)
    navigate(path, { replace: true });

    if (!orderId) {
      setTopupReturnResult({
        orderId: '',
        status: 'error',
        message: 'ไม่พบหมายเลขออเดอร์หลังยืนยันธนาคาร — เปิดศูนย์เครดิตเพื่อตรวจสอบยอด',
      });
      setIsCreditCenterOpen(true);
      return;
    }

    setTopupReturnResult({
      orderId,
      status: 'checking',
      message: 'กำลังตรวจสอบผลการชำระเงินจากธนาคาร…',
    });
    setIsCreditCenterOpen(true);

    void resolveTopupReturnStatus(orderId).then((result) => {
      setTopupReturnResult(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when return query appears
  }, [location.search]);

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

  // Delete single reading from history
  const handleDeleteReading = (id: string) => {
    const updated = storageService.deleteReading(id);
    setSavedReadings(updated);
  };

  // Load a reading from history
  const handleLoadHistoryReading = (reading: SavedReading) => {
    setIsHistoryOpen(false);
    const cat = reading.category || 'tarot';
    if (cat === 'horoscope') {
      navigate(`/horoscope/reading/${reading.id}`);
    } else if (cat === 'numerology') {
      navigate(`/numerology/reading/${reading.id}`);
    } else if (cat === 'thai-astrology') {
      navigate(`/thai-astrology/reading/${reading.id}`);
    } else if (cat === 'feng-shui') {
      navigate(`/feng-shui/reading/${reading.id}`);
    } else {
      navigate(`/tarot/reading/${reading.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 bg-[#07060f] relative overflow-hidden">

      {/* Subtle star field — low contrast so content wins */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.04] pointer-events-none" aria-hidden="true" />

      {/* Navbar Header */}
      <Navbar
        onOpenSettings={handleOpenSettings}
        onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        hasCustomKey={!!apiSettings.apiKey}
      />

      {/* Main Content Area — pb for mobile bottom nav */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 md:pb-8 flex flex-col items-center outline-none"
      >
        <ErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
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
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
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
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                />
              }
            />
            <Route path="/tarot/encyclopedia" element={<TarotEncyclopediaPage />} />
            <Route path="/tarot/encyclopedia/:cardId" element={<TarotEncyclopediaPage />} />

            {/* Horoscope Module Route */}
            <Route
              path="/horoscope"
              element={
                <HoroscopePage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />
            <Route
              path="/horoscope/reading/:id"
              element={
                <HoroscopePage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />

            {/* Numerology Module Route */}
            <Route
              path="/numerology"
              element={
                <NumerologyPage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />
            <Route
              path="/numerology/reading/:id"
              element={
                <NumerologyPage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />

            {/* Thai Astrology Module Route */}
            <Route
              path="/thai-astrology"
              element={
                <ThaiAstrologyPage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />
            <Route
              path="/thai-astrology/reading/:id"
              element={
                <ThaiAstrologyPage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />

            {/* Feng Shui Module Route */}
            <Route
              path="/feng-shui"
              element={
                <FengShuiPage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />
            <Route
              path="/feng-shui/reading/:id"
              element={
                <FengShuiPage
                  apiSettings={apiSettings}
                  onOpenSettings={handleOpenSettings}
                  onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
                  onSaveHistory={setSavedReadings}
                />
              }
            />

            {/* Legacy Fallbacks */}
            <Route path="/reading/*" element={<Navigate to="/tarot" replace />} />
            <Route path="/encyclopedia/*" element={<Navigate to="/tarot/encyclopedia" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        settings={apiSettings}
        onSaveSettings={handleSaveApiSettings}
        onOpenCreditCenter={() => setIsCreditCenterOpen(true)}
      />

      <CreditCenterModal
        isOpen={isCreditCenterOpen}
        onClose={() => {
          setIsCreditCenterOpen(false);
          setTopupReturnResult(null);
        }}
        returnResult={topupReturnResult}
        onDismissReturnResult={() => setTopupReturnResult(null)}
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
        onDeleteReading={handleDeleteReading}
      />

    </div>
  );
}

export default App;
