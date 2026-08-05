import React from 'react';
import type { SelectionMode } from '../../types/tarot';
import { CustomSelect, type CustomSelectOption } from '../common/CustomSelect';
import { Layers, Zap, Scissors, Orbit, Sparkles } from 'lucide-react';

interface DeckModeSelectorProps {
  selectionMode: SelectionMode;
  onSelectMode: (mode: SelectionMode) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: CustomSelectOption<SelectionMode>[] = [
  { value: 'manual', label: 'คลี่ไพ่เลือกเอง', icon: Layers },
  { value: 'auto', label: 'ให้จักรวาลเลือก', icon: Zap },
  { value: 'cut3', label: 'ตัดสำรับ 3 กอง', icon: Scissors },
  { value: 'orbit', label: 'กงล้อดวงดาว 3D', icon: Orbit },
  { value: 'hold', label: 'ตั้งจิตอธิษฐาน', icon: Sparkles },
];

export const DeckModeSelector: React.FC<DeckModeSelectorProps> = ({
  selectionMode,
  onSelectMode,
  disabled = false
}) => {
  return (
    <CustomSelect
      options={MODE_OPTIONS}
      value={selectionMode}
      onChange={onSelectMode}
      disabled={disabled}
      ariaLabel="เลือกโหมดเปิดไพ่"
    />
  );
};
