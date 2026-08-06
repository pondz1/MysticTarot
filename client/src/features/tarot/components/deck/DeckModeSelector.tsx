import React from 'react';
import type { SelectionMode } from '../../types/tarot';
import { CustomSelect, type CustomSelectOption } from '../../../../components/common/CustomSelect';
import { Layers, Scissors, Orbit, Sparkles, Flame, Compass } from 'lucide-react';

interface DeckModeSelectorProps {
  selectionMode: SelectionMode;
  onSelectMode: (mode: SelectionMode) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: CustomSelectOption<SelectionMode>[] = [
  { value: 'manual', label: 'คลี่ไพ่เลือกเอง', icon: Layers },
  { value: 'cut3', label: 'ตัดสำรับ 3 กอง', icon: Scissors },
  { value: 'orbit', label: 'กงล้อดวงดาว 3D', icon: Orbit },
  { value: 'hold', label: 'ตั้งจิตอธิษฐาน', icon: Sparkles },
  { value: 'jump', label: 'เสี่ยงทายไพ่กระโดด', icon: Flame },
  { value: 'compass', label: 'เข็มทิศดวงดาว', icon: Compass },
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
