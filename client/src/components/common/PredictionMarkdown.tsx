import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Briefcase,
  Coins,
  Heart,
  Stethoscope,
  Ban,
  Compass,
  Lightbulb,
  Layers,
} from 'lucide-react';

type SectionTone = {
  icon: React.ReactNode;
  text: string;
  border: string;
  bg: string;
  iconWrap: string;
  bar: string;
};

function stripLeadingEmoji(text: string): string {
  return text.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/gu, '').trim();
}

function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join('');
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return childrenToText(props.children);
  }
  return String(children ?? '');
}

function sectionTone(text: string): SectionTone {
  const t = text;
  if (t.includes('งาน') || t.includes('เรียน') || t.includes('อาชีพ') || t.includes('เกียรติ')) {
    return {
      icon: <Briefcase className="w-4 h-4" aria-hidden="true" />,
      text: 'text-sky-200',
      border: 'border-sky-500/35',
      bg: 'bg-sky-500/10',
      iconWrap: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      bar: 'bg-sky-400',
    };
  }
  if (t.includes('เงิน') || t.includes('โชค') || t.includes('การเงิน') || t.includes('ทรัพย์')) {
    return {
      icon: <Coins className="w-4 h-4" aria-hidden="true" />,
      text: 'text-amber-200',
      border: 'border-amber-500/35',
      bg: 'bg-amber-500/10',
      iconWrap: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      bar: 'bg-amber-400',
    };
  }
  if (t.includes('รัก') || t.includes('ความสัมพันธ์') || t.includes('ครอบครัว') || t.includes('เมตตา')) {
    return {
      icon: <Heart className="w-4 h-4" aria-hidden="true" />,
      text: 'text-pink-200',
      border: 'border-pink-500/35',
      bg: 'bg-pink-500/10',
      iconWrap: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
      bar: 'bg-pink-400',
    };
  }
  if (t.includes('สุขภาพ') || t.includes('กาย') || t.includes('จิต')) {
    return {
      icon: <Stethoscope className="w-4 h-4" aria-hidden="true" />,
      text: 'text-emerald-200',
      border: 'border-emerald-500/35',
      bg: 'bg-emerald-500/10',
      iconWrap: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      bar: 'bg-emerald-400',
    };
  }
  if (t.includes('ระวัง') || t.includes('ต้องห้าม') || t.includes('หลีก')) {
    return {
      icon: <Ban className="w-4 h-4" aria-hidden="true" />,
      text: 'text-rose-200',
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
      iconWrap: 'bg-rose-500/20 text-rose-300 border-rose-400/35',
      bar: 'bg-rose-400',
    };
  }
  if (t.includes('คำแนะนำ') || t.includes('สรุปคำตอบ') || t.includes('สรุป')) {
    return {
      icon: <Lightbulb className="w-4 h-4" aria-hidden="true" />,
      text: 'text-violet-200',
      border: 'border-violet-500/35',
      bg: 'bg-violet-500/10',
      iconWrap: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
      bar: 'bg-violet-400',
    };
  }
  if (t.includes('ไพ่') || t.includes('ตำแหน่ง') || t.includes('สเปรด')) {
    return {
      icon: <Layers className="w-4 h-4" aria-hidden="true" />,
      text: 'text-purple-200',
      border: 'border-purple-500/35',
      bg: 'bg-purple-500/10',
      iconWrap: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      bar: 'bg-purple-400',
    };
  }
  if (t.includes('ภาพรวม') || t.includes('พีค') || t.includes('ฮวงจุ้ย') || t.includes('พลังงาน')) {
    return {
      icon: <Compass className="w-4 h-4" aria-hidden="true" />,
      text: 'text-cyan-200',
      border: 'border-cyan-500/35',
      bg: 'bg-cyan-500/10',
      iconWrap: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      bar: 'bg-cyan-400',
    };
  }
  return {
    icon: <Sparkles className="w-4 h-4" aria-hidden="true" />,
    text: 'text-amber-100',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    iconWrap: 'bg-amber-500/15 text-amber-300 border-amber-400/25',
    bar: 'bg-amber-400',
  };
}

function SectionHeading({
  children,
  as: Tag = 'h2',
}: {
  children: React.ReactNode;
  as?: 'h2' | 'h3';
}) {
  const raw = childrenToText(children);
  const text = stripLeadingEmoji(raw) || raw;
  const tone = sectionTone(text);

  if (Tag === 'h3') {
    return (
      <h3
        className={`text-sm sm:text-base font-semibold mt-5 mb-2 flex items-center gap-2 ${tone.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.bar}`} aria-hidden="true" />
        <span>{text}</span>
      </h3>
    );
  }

  return (
    <h2
      className={`group relative text-base sm:text-lg font-bold mt-6 mb-3 first:mt-0 flex items-center gap-2.5 tracking-wide rounded-xl border px-3 py-2.5 ${tone.bg} ${tone.border} ${tone.text}`}
    >
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${tone.iconWrap}`}
      >
        {tone.icon}
      </span>
      <span className="min-w-0 leading-snug">{text}</span>
    </h2>
  );
}

/** Shared markdown styles for every prediction / history / chat result */
export const predictionMarkdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <SectionHeading>{children}</SectionHeading>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <SectionHeading>{children}</SectionHeading>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <SectionHeading as="h3">{children}</SectionHeading>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-sm font-semibold text-amber-100/90 mt-3 mb-1.5">{children}</h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-2.5 leading-relaxed text-slate-300 text-sm sm:text-[0.9375rem]">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-amber-200">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-violet-200/90">{children}</em>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-5 relative pl-4 pr-3 py-3 rounded-r-xl border border-amber-500/25 border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-500/15 via-violet-500/10 to-transparent text-amber-50/95 not-italic shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-300/80 mb-1">
        คำแนะนำสั้น
      </div>
      <div className="text-sm sm:text-[0.9375rem] leading-relaxed text-slate-100">{children}</div>
    </blockquote>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-3 space-y-2 text-slate-300 text-sm sm:text-[0.9375rem]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-3 ml-1 space-y-2 list-decimal list-inside text-slate-300 text-sm sm:text-[0.9375rem] marker:text-amber-400/90 marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed flex gap-2.5 items-start pl-0.5">
      <span
        className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400/90 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.45)]"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  ),
  hr: () => (
    <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-sky-300 underline-offset-2 hover:underline hover:text-sky-200"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className="block my-3 p-3 rounded-lg bg-slate-950 border border-violet-500/20 text-xs text-violet-100/90 overflow-x-auto font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-100 text-[0.85em] font-mono">
        {children}
      </code>
    );
  },
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-amber-500/25 bg-slate-950/90 shadow-inner">
      <table className="w-full text-xs sm:text-sm text-left text-slate-300 border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-amber-500/15 text-amber-100 font-semibold border-b border-amber-500/25">
      {children}
    </thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2.5 font-semibold border-b border-amber-500/20">{children}</th>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-slate-800/80 hover:bg-amber-500/5 transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2.5 align-top leading-relaxed">{children}</td>
  ),
};

interface PredictionMarkdownProps {
  content: string;
  className?: string;
  /** Compact size for chat bubbles / history list */
  compact?: boolean;
}

export const PredictionMarkdown: React.FC<PredictionMarkdownProps> = ({
  content,
  className = '',
  compact = false,
}) => {
  if (!content?.trim()) return null;

  return (
    <div
      className={`prediction-md font-prompt text-slate-200 leading-relaxed ${
        compact ? 'text-xs sm:text-sm [&_h2]:mt-4 [&_h2]:py-2 [&_h2]:px-2.5 [&_h2]:text-sm' : 'text-sm sm:text-[0.9375rem]'
      } ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={predictionMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
