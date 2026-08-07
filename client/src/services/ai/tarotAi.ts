import type { DrawnCard, SpreadMode } from '../../features/tarot/types/tarot';
import type { ApiSettings, ChatMessage, SavedReading } from '../../types';
import { getSpreadConfig as getClientSpreadConfig } from '../../features/tarot/data/tarotSpreads';
import { requestModuleAiCompletion } from './aiClient';
import { buildModulePrompts } from './buildPrompts';
import { buildFallbackMarkdown } from './markdownFormat';

function serializeCards(drawnCards: DrawnCard[]) {
  return drawnCards.map((d) => ({
    position: d.position,
    isReversed: d.isReversed,
    card: {
      nameTh: d.card.nameTh,
      nameEn: d.card.nameEn,
      keywords: d.card.keywords,
      uprightMeaning: d.card.uprightMeaning,
      reversedMeaning: d.card.reversedMeaning,
      element: d.card.element,
      arcana: d.card.arcana,
      suit: d.card.suit,
    },
  }));
}

/** Shared prompt builders (same as server credit mode) */
export function buildTarotLocalPrompts(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  deckFilter: 'all' | 'major' | 'minor' = 'all'
) {
  return buildModulePrompts('tarot', {
    question,
    drawnCards: serializeCards(drawnCards),
    spreadMode,
    deckFilter,
  });
}

export async function analyzeTarotReading(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  settings: ApiSettings,
  deckFilter: 'all' | 'major' | 'minor' = 'all',
  onChunk?: (chunk: string) => void,
  historyEntry?: Partial<SavedReading>,
  signal?: AbortSignal
): Promise<string> {
  const payload = {
    question,
    drawnCards: serializeCards(drawnCards),
    spreadMode,
    deckFilter,
  };
  const localPrompts = buildModulePrompts('tarot', payload);

  try {
    const content = await requestModuleAiCompletion(
      'tarot',
      payload,
      settings,
      onChunk,
      historyEntry,
      signal,
      localPrompts
    );
    if (content && content.trim()) return content;
    throw new Error('ไม่สามารถรับคำตอบจาก AI ได้ในขณะนี้');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.error('Failed Tarot AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำขอ AI ทำนายไพ่ยิปซีได้ในขณะนี้');
  }
}

export function generateFallbackReading(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  noticePrefix: string = ''
): string {
  const qText = question ? `"${question}"` : 'ดวงชะตารายวันและภาพรวมชีวิต';
  const spreadConfig = getClientSpreadConfig(spreadMode);

  let cardsSection = '';
  drawnCards.forEach((d, idx) => {
    const orientationText = d.isReversed ? 'ไพ่กลับหัว' : 'ไพ่ตั้งหัว';
    const meaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
    cardsSection += `### ${idx + 1}. ${d.position}: **${d.card.nameTh}** (${orientationText})
- **คีย์เวิร์ด:** ${d.card.keywords.join(', ')}
- **ความหมาย:** ${meaning}

`;
  });

  const mainCard = drawnCards[0].card;
  const outcomeCard = drawnCards[drawnCards.length - 1].card;

  const md = buildFallbackMarkdown(
    [
      {
        heading: `ภาพรวมดวงชะตาและพลังงานไพ่ (${spreadConfig.titleTh})`,
        body: `สำหรับการเปิดไพ่ถามถึง ${qText} ด้วยสเปรด **${spreadConfig.titleTh}** พลังงานแห่งจักรวาลสะท้อนบทเรียนและโอกาสในชีวิตของคุณดังนี้`,
      },
      {
        heading: 'วิเคราะห์เจาะลึกไพ่ตามตำแหน่งสเปรด',
        body: cardsSection.trim(),
      },
      {
        heading: 'บทสรุปคำตอบตรงประเด็นคำถาม',
        body: `พลังแห่งไพ่หลัก **${mainCard.nameTh}** บ่งบอกถึงจุดเริ่มต้นที่สำคัญ ขณะที่ไพ่ **${outcomeCard.nameTh}** ชี้แนะเส้นทางไปสู่ผลลัพธ์ของเรื่อง ${qText}`,
      },
      {
        heading: 'คำแนะนำและข้อคิดชี้ทางจากจักรวาล',
        body: `- **คำแนะนำหลัก:** ${mainCard.advice}\n- **พลังบวกนำทาง:** ${outcomeCard.advice}`,
      },
    ],
    'ไพ่ยิปซีคือเข็มทิศชี้ทาง — ทางเดินอยู่ในมือของคุณเอง'
  );

  return `${noticePrefix}${md}`;
}

/** User-prompt text for debugging / offline display (via shared builder). */
export function buildInitialUserPrompt(
  question: string,
  drawnCards: DrawnCard[],
  spreadMode: SpreadMode,
  deckFilter: 'all' | 'major' | 'minor' = 'all'
): string {
  return buildModulePrompts('tarot', {
    question,
    drawnCards: serializeCards(drawnCards),
    spreadMode,
    deckFilter,
  }).userPrompt;
}

export async function analyzeTarotFollowUp(params: {
  question: string;
  drawnCards: DrawnCard[];
  spreadMode: SpreadMode;
  initialResult: string;
  chatHistory: ChatMessage[];
  newQuestion: string;
  settings: ApiSettings;
  onChunk?: (chunk: string) => void;
  signal?: AbortSignal;
  historyEntry?: Partial<SavedReading>;
}): Promise<string> {
  const {
    question,
    drawnCards,
    spreadMode,
    initialResult,
    chatHistory,
    newQuestion,
    settings,
    onChunk,
    signal,
    historyEntry,
  } = params;

  const payload = {
    question,
    drawnCards: serializeCards(drawnCards),
    spreadMode,
    initialResult,
    chatHistory: chatHistory.map((m) => ({ role: m.role, content: m.content })),
    newQuestion,
  };
  const localPrompts = buildModulePrompts('tarot_followup', payload);

  try {
    const content = await requestModuleAiCompletion(
      'tarot_followup',
      payload,
      settings,
      onChunk,
      historyEntry,
      signal,
      localPrompts
    );
    if (content && content.trim()) return content;
    throw new Error('ไม่ได้รับคำตอบจาก AI สำหรับคำถามเจาะลึก');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.error('Failed follow-up AI call:', error);
    throw new Error(error?.message || 'ไม่สามารถประมวลผลคำตอบเจาะลึกจาก AI ได้ในขณะนี้');
  }
}
