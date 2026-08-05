import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Scissors, Orbit, Sparkles, Crown, LayoutGrid, Check, Flame, Compass } from 'lucide-react';
import type { SelectionMode } from '../../types/tarot';

export interface ModeOptionInfo {
  id: SelectionMode;
  title: string;
  badge: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  previewTag: string;
  previewBg: string;
}

export interface FilterOptionInfo {
  id: 'all' | 'major' | 'minor';
  title: string;
  badge: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  cardCount: string;
  color: string;
}

const MODE_ITEMS: ModeOptionInfo[] = [
  {
    id: 'manual',
    title: 'คลี่ไพ่เลือกเอง',
    badge: 'ยอดนิยมสูงสุด',
    description: 'คลี่สำรับไพ่ทรงพัดเวทมนตร์ 3 แถวขลัง แตะเลือกหยิบไพ่ด้วยตัวเองตามจิตสัมผัส',
    icon: Layers,
    previewTag: '3-Row Fan Spread',
    previewBg: 'from-amber-500/20 via-purple-900/40 to-slate-900',
  },
  {
    id: 'orbit',
    title: 'กงล้อดวงดาว 3D',
    badge: 'ยอดฮิต 360°',
    description: 'กงล้อจักรวาล 360° หมุนสลับไพ่ด้วยแรงเหวี่ยงและละอองดาวทองคำทรงพลัง',
    icon: Orbit,
    previewTag: '360° Cosmic Wheel',
    previewBg: 'from-purple-900/40 via-amber-500/20 to-slate-900',
  },
  {
    id: 'cut3',
    title: 'ตัดสำรับ 3 กอง',
    badge: 'แบ่งพลังงาน',
    description: 'ตัดสำรับไพ่ออกเป็น 3 กองพลังงานจิตสัมผัส แล้วเลือกกองไพ่ที่ดึงดูดใจที่สุดเพื่อทำนาย',
    icon: Scissors,
    previewTag: '3 Energy Piles',
    previewBg: 'from-indigo-900/40 via-purple-900/30 to-slate-900',
  },
  {
    id: 'hold',
    title: 'ตั้งจิตอธิษฐาน',
    badge: 'สมาธิลึกซึ้ง',
    description: 'กดค้างส่งคลื่นพลังงานจิตอธิษฐาน ให้จักรวาลระเบิดแสงสแกนเลือกไพ่ที่ใช่ให้คุณ',
    icon: Sparkles,
    previewTag: 'Mindful Energy Burst',
    previewBg: 'from-amber-600/30 via-indigo-900/40 to-slate-900',
  },
  {
    id: 'jump',
    title: 'เสี่ยงทายไพ่กระโดด',
    badge: 'สายขลังศักดิ์สิทธิ์',
    description: 'สลับเขย่าสำรับไพ่ให้ไพ่ประจำชะตากระโดดพุ่งออกมาเอง ตามหลักพิธีกรรม Jumping Card',
    icon: Flame,
    previewTag: 'Spirit Jump Card',
    previewBg: 'from-amber-600/30 via-red-950/40 to-slate-900',
  },
  {
    id: 'compass',
    title: 'เข็มทิศดวงดาวชี้ชะตา',
    badge: '12 ราศีโหราศาสตร์',
    description: 'หมุนกงล้อเข็มทิศ 12 ราศี สแกนตำแหน่งเรือนชะตาเปิดไพ่ที่เชื่อมโยงกับคุณ',
    icon: Compass,
    previewTag: 'Astral Compass Wheel',
    previewBg: 'from-indigo-900/40 via-amber-500/20 to-slate-900',
  },
];

const FILTER_ITEMS: FilterOptionInfo[] = [
  {
    id: 'major',
    title: 'สำรับ Major Arcana',
    badge: 'ไพ่ชุดใหญ่ (22 ใบ)',
    description: 'ไพ่ประธาน 22 ใบ สะท้อนบทเรียนชะตากรรม เหตุการณ์สำคัญ และทิศทางชีวิตหลัก',
    icon: Crown,
    cardCount: '22 ใบ',
    color: 'from-amber-500/20 border-amber-400/50 text-amber-300',
  },
  {
    id: 'minor',
    title: 'สำรับ Minor Arcana',
    badge: 'ไพ่ชุดเล็ก (56 ใบ)',
    description: 'ไพ่ประกอบ 56 ใบ สะท้อนสถานการณ์ รายละเอียดประจำวัน และอารมณ์ความรู้สึก',
    icon: LayoutGrid,
    cardCount: '56 ใบ',
    color: 'from-purple-900/30 border-purple-400/50 text-purple-300',
  },
  {
    id: 'all',
    title: 'ครบทั้งสำรับ (Full Deck)',
    badge: 'เต็มรูปแบบ (78 ใบ)',
    description: 'สำรับไพ่ยิปซีมาตรฐาน 78 ใบ ทำนายครอบคลุมทุกมิติชีวิตอย่างสมบูรณ์แบบ',
    icon: Layers,
    cardCount: '78 ใบ',
    color: 'from-indigo-900/30 border-amber-400/60 text-amber-200',
  },
];

interface DeckSelectionModalProps {
  isOpen: boolean;
  type: 'mode' | 'filter';
  currentMode?: SelectionMode;
  currentFilter?: 'all' | 'major' | 'minor';
  onSelectMode?: (mode: SelectionMode) => void;
  onSelectFilter?: (filter: 'all' | 'major' | 'minor') => void;
  onClose: () => void;
}

export const DeckSelectionModal: React.FC<DeckSelectionModalProps> = ({
  isOpen,
  type,
  currentMode,
  currentFilter,
  onSelectMode,
  onSelectFilter,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl max-h-[90vh] glass-panel-gold rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-400/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg md:text-xl font-bold font-serif-mystic text-gold-gradient">
                {type === 'mode' ? 'เลือกรูปแบบการคลี่ไพ่' : 'เลือกประเภทสำรับไพ่'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-purple-200/80 mb-4 sm:mb-5">
            {type === 'mode'
              ? 'เลือกสไตล์การเปิดไพ่ที่คุณชื่นชอบและรู้สึกเชื่อมโยงกับพลังงานจิตมากที่สุด'
              : 'เลือกจำนวนไพ่ที่ต้องการใช้ทำนายตามวัตถุประสงค์และเรื่องราวที่สนใจ'}
          </p>

          {/* Mode Selection Cards */}
          {type === 'mode' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {MODE_ITEMS.map((item) => {
                const isSelected = currentMode === item.id;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectMode) onSelectMode(item.id);
                      onClose();
                    }}
                    className={`relative group rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden bg-gradient-to-br ${item.previewBg} ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_30px_rgba(234,179,8,0.35)] scale-[1.02]'
                        : 'border-amber-400/30 hover:border-amber-400/70 hover:scale-[1.01] hover:shadow-lg'
                    }`}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Top Row Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-xl border ${isSelected ? 'bg-amber-400/30 border-amber-300 text-amber-200' : 'bg-purple-950/80 border-purple-800/60 text-purple-300'}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-amber-100 flex items-center gap-1.5">
                            {item.title}
                          </h3>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-2.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Preview Badge */}
                    <div className="mt-3.5 pt-2.5 border-t border-purple-800/40 flex items-center justify-between">
                      <span className="text-[10px] text-amber-200/90 font-medium bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-700/50">
                        {item.previewTag}
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold group-hover:underline">
                        {isSelected ? 'กำลังใช้งาน' : 'เลือกโหมดนี้ →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filter Selection Cards */}
          {type === 'filter' && (
            <div className="space-y-3">
              {FILTER_ITEMS.map((item) => {
                const isSelected = currentFilter === item.id;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectFilter) onSelectFilter(item.id);
                      onClose();
                    }}
                    className={`relative group rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between bg-gradient-to-r ${item.color} ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_25px_rgba(234,179,8,0.3)] scale-[1.01]'
                        : 'border-amber-400/30 hover:border-amber-400/70 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${isSelected ? 'bg-amber-400/30 border-amber-300 text-amber-200' : 'bg-purple-950/80 border-purple-800/60 text-purple-300'}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-amber-100">
                            {item.title}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400 font-semibold group-hover:underline hidden sm:inline">
                          เลือก
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-5 text-center">
            <button
              onClick={onClose}
              className="text-xs text-amber-300/80 hover:text-amber-100 underline cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
