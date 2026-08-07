import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ModulePageHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  eyebrow?: string;
  title: string;
  description: string;
}

/** Quiet, scannable page header shared across divination modules */
export const ModulePageHeader: React.FC<ModulePageHeaderProps> = ({
  icon: Icon,
  iconClassName = 'text-amber-400',
  eyebrow,
  title,
  description,
}) => {
  return (
    <header className="text-center space-y-2 max-w-2xl mx-auto px-1">
      {eyebrow && (
        <p className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500">
          <Icon className={`w-3.5 h-3.5 ${iconClassName}`} aria-hidden="true" />
          <span>{eyebrow}</span>
        </p>
      )}
      <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-slate-50 leading-snug text-pretty">
        {title}
      </h1>
      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{description}</p>
    </header>
  );
};
