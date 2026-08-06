import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ElementType | React.ReactNode;
}

export type CustomSelectOption<T = string | number> = SelectOption<T>;

interface CustomSelectProps<T = string | number> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  accentColor?: 'rose' | 'emerald' | 'amber' | 'purple' | 'blue' | 'cyan';
  icon?: React.ReactNode;
  ariaLabel?: string;
}

const ACCENT_STYLES = {
  rose: {
    border: 'focus-within:border-rose-500/80 hover:border-rose-500/50',
    activeBg: 'bg-rose-500/15 text-rose-200 font-semibold',
    iconColor: 'text-rose-400',
    ring: 'ring-rose-500/20',
  },
  emerald: {
    border: 'focus-within:border-emerald-500/80 hover:border-emerald-500/50',
    activeBg: 'bg-emerald-500/15 text-emerald-200 font-semibold',
    iconColor: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    border: 'focus-within:border-amber-500/80 hover:border-amber-500/50',
    activeBg: 'bg-amber-500/15 text-amber-200 font-semibold',
    iconColor: 'text-amber-400',
    ring: 'ring-amber-500/20',
  },
  purple: {
    border: 'focus-within:border-purple-500/80 hover:border-purple-500/50',
    activeBg: 'bg-purple-500/15 text-purple-200 font-semibold',
    iconColor: 'text-purple-400',
    ring: 'ring-purple-500/20',
  },
  blue: {
    border: 'focus-within:border-blue-500/80 hover:border-blue-500/50',
    activeBg: 'bg-blue-500/15 text-blue-200 font-semibold',
    iconColor: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
  cyan: {
    border: 'focus-within:border-cyan-500/80 hover:border-cyan-500/50',
    activeBg: 'bg-cyan-500/15 text-cyan-200 font-semibold',
    iconColor: 'text-cyan-400',
    ring: 'ring-cyan-500/20',
  },
};

export function CustomSelect<T = string | number>({
  options,
  value,
  onChange,
  label,
  placeholder = 'เลือกรายการ...',
  disabled = false,
  className = '',
  accentColor = 'emerald',
  icon,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.emerald;

  // Auto-scroll dropdown list to the selected item when opened
  useEffect(() => {
    if (isOpen && selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const renderIcon = (iconInput?: React.ElementType | React.ReactNode) => {
    if (!iconInput) return null;
    if (typeof iconInput === 'function' || (typeof iconInput === 'object' && iconInput !== null && 'render' in (iconInput as any))) {
      const IconComp = iconInput as React.ElementType;
      return <IconComp className="w-4 h-4 shrink-0" />;
    }
    return iconInput as React.ReactNode;
  };

  return (
    <div className={`w-full space-y-1.5 ${isOpen ? 'relative z-[999]' : ''} ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}

      {/* Button & Popover Wrapper */}
      <div className={`relative w-full ${isOpen ? 'z-[999]' : 'z-10'}`} ref={containerRef}>
        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-3 px-4 h-[46px] rounded-xl sm:rounded-2xl bg-slate-950/90 border text-slate-100 text-sm font-medium transition-all duration-200 outline-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-md'
          } ${accent.border} ${isOpen ? `ring-2 ${accent.ring} border-slate-700 bg-slate-900` : 'border-slate-800'}`}
        >
          <div className="flex items-center gap-2.5 truncate min-w-0">
            {icon && <span className={`${accent.iconColor} shrink-0`}>{renderIcon(icon)}</span>}
            {selectedOption?.icon && <span className="shrink-0">{renderIcon(selectedOption.icon)}</span>}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div className="absolute z-[9999] top-full left-0 w-full mt-1.5 py-1.5 rounded-2xl bg-slate-950/98 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl max-h-64 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={idx}
                  ref={isSelected ? selectedOptionRef : null}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                    isSelected
                      ? `${accent.activeBg}`
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    {opt.icon && <span className="shrink-0">{renderIcon(opt.icon)}</span>}
                    <div className="truncate">
                      <div className="font-medium truncate">{opt.label}</div>
                      {opt.sublabel && <div className="text-[11px] text-slate-400 font-normal truncate">{opt.sublabel}</div>}
                    </div>
                  </div>

                  {isSelected && <Check className={`w-4 h-4 ${accent.iconColor} shrink-0`} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
