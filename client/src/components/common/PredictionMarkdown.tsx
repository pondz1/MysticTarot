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
} from 'lucide-react';

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

function sectionIcon(text: string): React.ReactNode {
  const t = text;
  if (t.includes('งาน') || t.includes('เรียน') || t.includes('อาชีพ')) {
    return <Briefcase className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />;
  }
  if (t.includes('เงิน') || t.includes('โชค') || t.includes('การเงิน') || t.includes('ทรัพย์')) {
    return <Coins className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />;
  }
  if (t.includes('รัก') || t.includes('ความสัมพันธ์')) {
    return <Heart className="w-4 h-4 text-pink-400 shrink-0" aria-hidden="true" />;
  }
  if (t.includes('สุขภาพ') || t.includes('กาย') || t.includes('จิต')) {
    return <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />;
  }
  if (t.includes('ระวัง') || t.includes('ต้องห้าม') || t.includes('หลีก')) {
    return <Ban className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />;
  }
  return <Sparkles className="w-4 h-4 text-amber-400/90 shrink-0" aria-hidden="true" />;
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
  const Icon = sectionIcon(text);

  if (Tag === 'h3') {
    return (
      <h3 className="text-sm sm:text-base font-semibold text-slate-100 mt-4 mb-2 flex items-center gap-2">
        <span className="text-amber-400/80" aria-hidden="true">
          ·
        </span>
        <span>{text}</span>
      </h3>
    );
  }

  return (
    <h2 className="text-base sm:text-lg font-bold text-slate-50 mt-6 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2 tracking-wide first:mt-0">
      {Icon}
      <span>{text}</span>
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
    <h4 className="text-sm font-semibold text-slate-200 mt-3 mb-1.5">{children}</h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-2.5 leading-relaxed text-slate-300 text-sm sm:text-[0.9375rem]">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-amber-100">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-slate-300">{children}</em>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 pl-4 border-l-2 border-amber-500/50 bg-slate-900/60 py-2.5 pr-3 rounded-r-xl text-slate-300 italic">
      {children}
    </blockquote>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-3 ml-4 list-disc space-y-1.5 text-slate-300 text-sm sm:text-[0.9375rem]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-3 ml-4 list-decimal space-y-1.5 text-slate-300 text-sm sm:text-[0.9375rem]">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed pl-0.5">{children}</li>
  ),
  hr: () => <hr className="my-5 border-slate-800" />,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-amber-300 underline-offset-2 hover:underline"
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
        <code className="block my-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 overflow-x-auto font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-100/90 text-[0.85em] font-mono">
        {children}
      </code>
    );
  },
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
      <table className="w-full text-xs sm:text-sm text-left text-slate-300 border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-slate-900 text-amber-100/90 font-semibold border-b border-slate-800">
      {children}
    </thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2 font-semibold border-b border-slate-800">{children}</th>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 align-top leading-relaxed">{children}</td>
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
        compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-[0.9375rem]'
      } ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={predictionMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
