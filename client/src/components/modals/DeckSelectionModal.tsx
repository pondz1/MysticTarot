import React from 'react';
import {
  X,
  Layers,
  Scissors,
  Orbit,
  Sparkles,
  Crown,
  LayoutGrid,
  Check,
  Flame,
  Compass,
} from 'lucide-react';
import type { SelectionMode } from '../../features/tarot/types/tarot';
import { ModalShell } from '../common/ModalShell';

export interface ModeOptionInfo {
  id: SelectionMode;
  title: string;
  badge: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  previewTag: string;
}

export interface FilterOptionInfo {
  id: 'all' | 'major' | 'minor';
  title: string;
  badge: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  cardCount: string;
}

const MODE_ITEMS: ModeOptionInfo[] = [
  {
    id: 'manual',
    title: 'คลี่ไพ่เลือกเอง',
    badge: 'ยอดนิยม',
    description: 'คลี่สำรับ 3 แถว แตะเลือกหยิบไพ่ด้วยตัวเองตามจิตสัมผัส',
    icon: Layers,
    previewTag: '3-Row Fan',
  },
  {
    id: 'orbit',
    title: 'กงล้อดวงดาว 3D',
    badge: '360°',
    description: 'กงล้อจักรวาลหมุนสลับไพ่ เลือกใบที่ดึงดูดใจ',
    icon: Orbit,
    previewTag: 'Cosmic Wheel',
  },
  {
    id: 'cut3',
    title: 'ตัดสำรับ 3 กอง',
    badge: 'แบ่งกอง',
    description: 'ตัดสำรับเป็น 3 กอง แล้วเลือกกองที่ดึงดูดใจที่สุด',
    icon: Scissors,
    previewTag: '3 Piles',
  },
  {
    id: 'hold',
    title: 'ตั้งจิตอธิษฐาน',
    badge: 'สมาธิ',
    description: 'กดค้างส่งพลังงานจิต ให้ระบบเลือกไพ่ที่สอดคล้อง',
    icon: Sparkles,
    previewTag: 'Mindful Hold',
  },
  {
    id: 'jump',
    title: 'เสี่ยงทายไพ่กระโดด',
    badge: 'Jump',
    description: 'เขย่าสำรับให้ไพ่ประจำชะตากระโดดออกมาเอง',
    icon: Flame,
    previewTag: 'Jumping Card',
  },
  {
    id: 'compass',
    title: 'เข็มทิศดวงดาว',
    badge: '12 ราศี',
    description: 'หมุนเข็มทิศ 12 ราศี เปิดไพ่ที่เชื่อมโยงกับคุณ',
    icon: Compass,
    previewTag: 'Astral Compass',
  },
];

const FILTER_ITEMS: FilterOptionInfo[] = [
  {
    id: 'major',
    title: 'Major Arcana',
    badge: '22 ใบ',
    description: 'ไพ่ประธาน — บทเรียนชะตากรรมและทิศทางชีวิตหลัก',
    icon: Crown,
    cardCount: '22 ใบ',
  },
  {
    id: 'minor',
    title: 'Minor Arcana',
    badge: '56 ใบ',
    description: 'ไพ่ประกอบ — สถานการณ์รายวันและอารมณ์ความรู้สึก',
    icon: LayoutGrid,
    cardCount: '56 ใบ',
  },
  {
    id: 'all',
    title: 'ทั้งสำรับ',
    badge: '78 ใบ',
    description: 'สำรับมาตรฐานครบชุด ครอบคลุมทุกมิติ',
    icon: Layers,
    cardCount: '78 ใบ',
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

/** Shared card chrome — solid surfaces, no gradients (match rest of app) */
function optionCardClass(isSelected: boolean): string {
  return [
    'relative group rounded-xl p-3.5 border text-left transition-colors cursor-pointer',
    'bg-slate-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
    isSelected
      ? 'border-amber-400/70 bg-amber-500/10'
      : 'border-slate-700/80 hover:border-amber-400/40 hover:bg-slate-900/80',
  ].join(' ');
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
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="deck-selection-title"
      ariaLabel={type === 'mode' ? 'เลือกรูปแบบการคลี่ไพ่' : 'เลือกประเภทสำรับไพ่'}
      maxWidthClass="max-w-xl"
      zClass="z-[100]"
      align="center"
      panelClassName="glass-panel-gold rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-400/40 shadow-2xl select-none text-slate-100"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-400/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2
            id="deck-selection-title"
            className="text-base sm:text-lg font-bold text-amber-100 font-serif-mystic truncate"
          >
            {type === 'mode' ? 'เลือกรูปแบบการคลี่ไพ่' : 'เลือกประเภทสำรับไพ่'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="p-2 rounded-lg text-slate-400 hover:text-amber-100 hover:bg-slate-800/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        {type === 'mode'
          ? 'เลือกสไตล์การเปิดไพ่ที่ใช่สำหรับคุณ'
          : 'เลือกจำนวนไพ่ในสำรับตามที่ต้องการ'}
      </p>

      {type === 'mode' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {MODE_ITEMS.map((item) => {
            const isSelected = currentMode === item.id;
            const IconComponent = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onSelectMode?.(item.id);
                  onClose();
                }}
                aria-pressed={isSelected}
                className={optionCardClass(isSelected)}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                  </div>
                )}

                <div className="flex items-start gap-2.5 pr-6">
                  <div
                    className={`p-2 rounded-lg border shrink-0 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                        : 'bg-slate-900 border-slate-700 text-amber-400/80'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-amber-50 leading-snug">{item.title}</h3>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400">
                      {item.badge}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-2">{item.description}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">{item.previewTag}</span>
                  <span className="text-[10px] text-amber-400/90 font-semibold">
                    {isSelected ? 'ใช้งานอยู่' : 'เลือก →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {type === 'filter' && (
        <div className="space-y-2.5">
          {FILTER_ITEMS.map((item) => {
            const isSelected = currentFilter === item.id;
            const IconComponent = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onSelectFilter?.(item.id);
                  onClose();
                }}
                aria-pressed={isSelected}
                className={`${optionCardClass(isSelected)} flex items-center justify-between w-full`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-lg border shrink-0 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                        : 'bg-slate-900 border-slate-700 text-amber-400/80'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-amber-50">{item.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                    </div>
                  ) : (
                    <span className="text-xs text-amber-400/80 font-semibold hidden sm:inline">
                      เลือก
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
};
