import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TAROT_CARDS } from '../data/tarotCards';
import { TarotArt } from '../../../components/common/TarotArt';
import {
  Search,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Heart,
  Briefcase,
  Coins,
  ShieldAlert,
  Compass,
  SlidersHorizontal,
  X,
  Compass as ReadingIcon,
  Layers,
  Crown,
  LayoutGrid,
} from 'lucide-react';

import { storageService } from '../../../services/storageService';

type ArcanaFilter = 'all' | 'major' | 'minor';
type SuitFilter = 'all' | 'wands' | 'cups' | 'swords' | 'pentacles';
type ElementFilter = 'all' | 'fire' | 'water' | 'air' | 'earth';
type SortOption = 'number' | 'nameAsc' | 'nameDesc';

export const TarotEncyclopediaPage: React.FC = () => {
  const { cardId } = useParams<{ cardId?: string }>();
  const navigate = useNavigate();

  // Load saved preferences
  const savedEncPrefs = storageService.getEncyclopediaPreferences();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArcana, setSelectedArcanaState] = useState<ArcanaFilter>(savedEncPrefs.selectedArcana);
  const [selectedSuit, setSelectedSuitState] = useState<SuitFilter>(savedEncPrefs.selectedSuit);
  const [selectedElement, setSelectedElementState] = useState<ElementFilter>(savedEncPrefs.selectedElement);
  const [sortBy, setSortByState] = useState<SortOption>(savedEncPrefs.sortBy);

  const setSelectedArcana = (val: ArcanaFilter) => {
    setSelectedArcanaState(val);
    storageService.saveEncyclopediaPreferences({ selectedArcana: val });
  };

  const setSelectedSuit = (val: SuitFilter) => {
    setSelectedSuitState(val);
    storageService.saveEncyclopediaPreferences({ selectedSuit: val });
  };

  const setSelectedElement = (val: ElementFilter) => {
    setSelectedElementState(val);
    storageService.saveEncyclopediaPreferences({ selectedElement: val });
  };

  const setSortBy = (val: SortOption) => {
    setSortByState(val);
    storageService.saveEncyclopediaPreferences({ sortBy: val });
  };

  // Element pill filter mapper helper
  const getElementCategory = (elementStr: string): ElementFilter => {
    if (elementStr.includes('ไฟ') || elementStr.toLowerCase().includes('fire')) return 'fire';
    if (elementStr.includes('น้ำ') || elementStr.toLowerCase().includes('water')) return 'water';
    if (elementStr.includes('ลม') || elementStr.toLowerCase().includes('air')) return 'air';
    if (elementStr.includes('ดิน') || elementStr.toLowerCase().includes('earth')) return 'earth';
    return 'all';
  };

  // Counts for filters
  const majorCount = useMemo(() => TAROT_CARDS.filter((c) => c.arcana === 'major' || !c.arcana).length, []);
  const minorCount = useMemo(() => TAROT_CARDS.filter((c) => c.arcana === 'minor').length, []);

  // Filter & sort list of cards
  const filteredAndSortedCards = useMemo(() => {
    return TAROT_CARDS.filter((card) => {
      // Search query filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        card.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.romanNumeral.toLowerCase() === searchQuery.toLowerCase().trim() ||
        card.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));

      // Arcana filter
      const cardArcana = card.arcana || 'major';
      const matchesArcana =
        selectedArcana === 'all' || cardArcana === selectedArcana;

      // Suit filter (only active when Minor or All is selected)
      const matchesSuit =
        selectedSuit === 'all' || card.suit === selectedSuit;

      // Element filter
      const matchesElement =
        selectedElement === 'all' || getElementCategory(card.element) === selectedElement;

      return matchesSearch && matchesArcana && matchesSuit && matchesElement;
    }).sort((a, b) => {
      if (sortBy === 'number') return a.number - b.number;
      if (sortBy === 'nameAsc') return a.nameTh.localeCompare(a.nameTh, 'th');
      if (sortBy === 'nameDesc') return b.nameTh.localeCompare(a.nameTh, 'th');
      return 0;
    });
  }, [searchQuery, selectedArcana, selectedSuit, selectedElement, sortBy]);

  // Selected Card for deep detail view from URL param
  const selectedCard = useMemo(() => {
    if (!cardId) return null;
    return TAROT_CARDS.find((c) => c.id === cardId) || null;
  }, [cardId]);

  // Navigation handlers for next/prev card in detail view
  const currentCardIndex = useMemo(() => {
    if (!selectedCard) return -1;
    return TAROT_CARDS.findIndex((c) => c.id === selectedCard.id);
  }, [selectedCard]);

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      navigate(`/encyclopedia/${TAROT_CARDS[currentCardIndex - 1].id}`);
    } else {
      // Loop to last card
      navigate(`/encyclopedia/${TAROT_CARDS[TAROT_CARDS.length - 1].id}`);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex >= 0 && currentCardIndex < TAROT_CARDS.length - 1) {
      navigate(`/encyclopedia/${TAROT_CARDS[currentCardIndex + 1].id}`);
    } else {
      // Loop to first card
      navigate(`/encyclopedia/${TAROT_CARDS[0].id}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 min-h-[80vh] flex flex-col animate-fade-in">
      {/* If Detail View mode is active via URL cardId */}
      {selectedCard ? (
        <div className="animate-fade-in flex flex-col gap-6">
          {/* Breadcrumb & Sequential Navigation Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-amber-400/30">
            <button
              type="button"
              onClick={() => navigate('/encyclopedia')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-amber-200 hover:text-amber-100 border border-amber-400/30 text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่สารานุกรมไพ่</span>
            </button>

            {/* Pagination / Sequential Card Nav */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-300/80 hidden sm:inline">
                ใบที่ {currentCardIndex + 1} จาก {TAROT_CARDS.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  aria-label="ไพ่ก่อนหน้า"
                  title="ไพ่ก่อนหน้า"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-purple-500/30 hover:border-amber-400/60 text-xs text-purple-200 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextCard}
                  aria-label="ไพ่ถัดไป"
                  title="ไพ่ถัดไป"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-purple-500/30 hover:border-amber-400/60 text-xs text-purple-200 hover:text-white transition-all cursor-pointer"
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Deep Detail Card Layout */}
          <div className="glass-panel-gold rounded-3xl p-5 sm:p-8 border border-amber-400/40 shadow-2xl flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Card Visual Showcase */}
            <div className="w-full sm:w-72 lg:w-80 aspect-[1/1.68] shrink-0 mx-auto lg:sticky lg:top-24">
              <div className="w-full h-full relative group">
                <TarotArt card={selectedCard} isReversed={false} size="full" />
                <div className="absolute inset-x-0 -bottom-4 flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-purple-950/95 border border-amber-400/60 text-amber-300 text-xs font-semibold shadow-lg backdrop-blur-md">
                    {selectedCard.arcana === 'minor' ? 'Minor Arcana' : 'Major Arcana'} #{selectedCard.romanNumeral}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Detailed Meanings & Aspects */}
            <div className="flex-1 w-full flex flex-col gap-6 text-slate-100">
              {/* Header Title & Badges */}
              <div className="border-b border-amber-500/25 pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-400/30">
                    {selectedCard.arcana === 'minor' ? `Minor Arcana` : `Major Arcana (${selectedCard.romanNumeral})`}
                  </span>
                  <span className="text-xs bg-purple-900/60 text-purple-200 px-2.5 py-1 rounded-md border border-purple-500/30">
                    ธาตุ: {selectedCard.element}
                  </span>
                  <span className="text-xs bg-indigo-950/80 text-indigo-200 px-2.5 py-1 rounded-md border border-indigo-500/30">
                    {selectedCard.planetOrSign}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif-mystic text-gold-gradient tracking-tight">
                  {selectedCard.nameTh}
                </h1>
                <p className="text-sm text-purple-300/80 mt-1 font-mono">
                  {selectedCard.nameEn}
                </p>
              </div>

              {/* Card Illustration Story Description */}
              {selectedCard.description && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                  <span className="font-semibold text-amber-300 block mb-1">ภาพสัญลักษณ์หน้าไพ่:</span>
                  {selectedCard.description}
                </div>
              )}

              {/* Keywords */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-amber-300/90 uppercase tracking-wider">
                  คำสำคัญ (Keywords):
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCard.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-amber-500/10 text-amber-200 px-3 py-1 rounded-full border border-amber-400/30 shadow-xs"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upright & Reversed Meanings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 shadow-inner flex flex-col gap-2">
                  <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    ความหมายเมื่อไพ่ตั้งหัว (Upright)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {selectedCard.uprightMeaning}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/40 shadow-inner flex flex-col gap-2">
                  <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    ความหมายเมื่อไพ่กลับหัว (Reversed)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {selectedCard.reversedMeaning}
                  </p>
                </div>
              </div>

              {/* 4 Key Life Aspects */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  คำทำนายตามแง่มุมชีวิต
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-pink-950/20 border border-pink-500/30 flex items-start gap-2.5">
                    <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-pink-300 block mb-0.5">ความรัก (Love)</strong>
                      <p className="text-slate-200 text-xs leading-relaxed">{selectedCard.love}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                    <Briefcase className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block mb-0.5">การงาน (Work)</strong>
                      <p className="text-slate-200 text-xs leading-relaxed">{selectedCard.work}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-500/30 flex items-start gap-2.5">
                    <Coins className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-yellow-300 block mb-0.5">การเงิน (Finance)</strong>
                      <p className="text-slate-200 text-xs leading-relaxed">{selectedCard.finance}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-2.5">
                    <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 block mb-0.5">คำแนะนำ (Advice)</strong>
                      <p className="text-slate-200 text-xs leading-relaxed">{selectedCard.advice}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Start Reading */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
                >
                  <ReadingIcon className="w-4 h-4" />
                  <span>ไปที่หน้าทำนายไพ่ยิปซี</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Catalog Grid Mode */
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mt-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs mb-3 shadow-inner">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>คลังความรู้ไพ่ยิปซีครบสมบูรณ์ (78 ใบ)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-mystic text-gold-gradient tracking-tight leading-tight">
              สารานุกรมไพ่ยิปซี (78 ใบ)
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-2 font-light leading-relaxed">
              สำรวจความหมาย สัญลักษณ์ พลังแห่งธาตุ และคำทำนายในแต่ละแง่มุมชีวิตของไพ่ยิปซีชุดใหญ่ (Major 22 ใบ) และชุดย่อย (Minor 56 ใบ) ครบถ้วน 78 ใบ
            </p>
          </div>

          {/* Arcana Filter Tabs (ทั้งสำรับ 78 / Major 22 / Minor 56) */}
          <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md mx-auto grid grid-cols-3 gap-1 p-1 bg-black/60 backdrop-blur-md rounded-xl border border-amber-500/30 text-[10px] sm:text-xs shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSelectedArcana('all');
                setSelectedSuit('all');
              }}
              className={`px-1 sm:px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer truncate flex items-center justify-center gap-1 sm:gap-1.5 ${
                selectedArcana === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
              }`}
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>ทั้งสำรับ ({TAROT_CARDS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedArcana('major');
                setSelectedSuit('all');
              }}
              className={`px-1 sm:px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer truncate flex items-center justify-center gap-1 sm:gap-1.5 ${
                selectedArcana === 'major'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
              }`}
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Major ({majorCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedArcana('minor');
              }}
              className={`px-1 sm:px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer truncate flex items-center justify-center gap-1 sm:gap-1.5 ${
                selectedArcana === 'minor'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Minor ({minorCount})</span>
            </button>
          </div>

          {/* Search Bar & Filter Controls Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อไพ่ (ไทย/อังกฤษ) หรือคีย์เวิร์ด..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-black/60 border border-purple-500/40 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Element Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedElement('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedElement === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-purple-950/60 text-purple-300 border border-purple-500/30 hover:border-amber-400/40'
                }`}
              >
                ทุกธาตุ
              </button>

              <button
                type="button"
                onClick={() => setSelectedElement('fire')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedElement === 'fire'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-purple-950/60 text-orange-300 border border-purple-500/30 hover:border-orange-400/40'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>ธาตุไฟ</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedElement('water')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedElement === 'water'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-purple-950/60 text-blue-300 border border-purple-500/30 hover:border-blue-400/40'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>ธาตุน้ำ</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedElement('air')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedElement === 'air'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-purple-950/60 text-sky-300 border border-purple-500/30 hover:border-sky-400/40'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>ธาตุลม</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedElement('earth')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedElement === 'earth'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-purple-950/60 text-emerald-300 border border-purple-500/30 hover:border-emerald-400/40'
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>ธาตุดิน</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-black/60 border border-purple-500/40 text-xs text-amber-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="number">เรียงตามลำดับเลขไพ่</option>
                <option value="nameAsc">เรียงตามชื่อ (ก - ฮ)</option>
                <option value="nameDesc">เรียงตามชื่อ (ฮ - ก)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredAndSortedCards.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-purple-500/30 my-8">
              <Search className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
              <p className="text-base font-semibold text-purple-200">ไม่พบไพ่ยิปซีที่ตรงกับเงื่อนไขการค้นหา</p>
              <p className="text-xs text-purple-400 mt-1">ลองเปลี่ยนคำค้นหา หรือล้างตัวกรอง</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedArcana('all');
                  setSelectedSuit('all');
                  setSelectedElement('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-900/60 border border-amber-400/40 text-amber-200 text-xs hover:bg-purple-800 transition-all cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAndSortedCards.map((card) => (
                <div
                  key={card.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`อ่านรายละเอียดไพ่ ${card.nameTh}`}
                  onClick={() => navigate(`/encyclopedia/${card.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/encyclopedia/${card.id}`);
                    }
                  }}
                  className="group cursor-pointer flex flex-col items-center p-3 rounded-2xl glass-panel hover:glass-panel-gold border border-amber-500/20 hover:border-amber-400/70 transition-all hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(234,179,8,0.2)] will-change-transform outline-none focus-visible:ring-2 focus-visible:ring-amber-400 relative overflow-hidden"
                >
                  {/* Roman Numeral / Arcana Badge */}
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 border border-amber-400/40 text-amber-300 text-[10px] font-bold backdrop-blur-xs">
                    {card.arcana === 'minor' ? `#${card.number}` : card.romanNumeral}
                  </div>

                  {/* Card Thumbnail */}
                  <div className="w-full aspect-[1/1.65] mb-2.5 relative overflow-hidden rounded-xl">
                    <TarotArt card={card} size="sm" />
                  </div>

                  {/* Card Name & Subtitle */}
                  <h3 className="text-xs font-bold text-amber-200 text-center truncate w-full group-hover:text-amber-100 transition-colors">
                    {card.nameTh.split(' (')[0]}
                  </h3>
                  <p className="text-[10px] text-purple-300/70 text-center truncate w-full mt-0.5">
                    {card.nameEn}
                  </p>

                  {/* Element Pill */}
                  <span className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-200 border border-purple-500/30 truncate max-w-full">
                    {card.element}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
