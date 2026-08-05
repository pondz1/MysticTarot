import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T extends string> {
  value: T;
  label: string;
  icon?: React.FC<{ className?: string }>;
  badge?: string;
}

interface CustomSelectProps<T extends string> {
  options: CustomSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function CustomSelect<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  ariaLabel
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];
  const SelectedIcon = selectedOption?.icon;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left select-none ${isOpen ? 'z-[100]' : 'z-20'}`}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel || selectedOption.label}
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-md disabled:opacity-50 ${
          isOpen
            ? 'bg-purple-950/90 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
            : 'bg-purple-950/70 hover:bg-purple-900/90 border-amber-400/30 hover:border-amber-400/60 text-amber-100 hover:shadow-lg'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {SelectedIcon && <SelectedIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <span className="truncate">{selectedOption.label}</span>
          {selectedOption.badge && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-normal">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-amber-300 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full z-[100] min-w-[180px] w-max max-w-[240px] p-1.5 rounded-2xl bg-[#09081a]/95 backdrop-blur-xl border border-amber-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="space-y-0.5 max-h-60 overflow-y-auto scrollbar-none">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                const OptIcon = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] sm:text-xs text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 to-purple-900/60 border border-amber-400/50 text-amber-200 font-bold'
                        : 'text-purple-200/90 hover:bg-purple-900/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {OptIcon && (
                        <OptIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-purple-400'}`} />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
