import { readingsDb } from '../db.js';

type ChatMsg = { id?: string; role?: string; content?: string; timestamp?: number };

/**
 * Persist AI result into readings DB.
 * - Main readings: set resultText to model output
 * - Follow-up (tarot_followup): keep original resultText, merge chatHistory + assistant reply
 */
export function saveAiHistoryEntry(params: {
  moduleId?: string;
  historyEntry: Record<string, unknown>;
  fullText: string;
  creditsUsed: number;
}): void {
  const { moduleId, historyEntry, fullText, creditsUsed } = params;
  if (!historyEntry?.id || !fullText.trim()) return;

  const id = String(historyEntry.id);
  let prev: Record<string, unknown> = {};
  const row = readingsDb.getById(id);
  if (row?.data) {
    try {
      prev = JSON.parse(row.data) as Record<string, unknown>;
    } catch {
      prev = {};
    }
  }

  const isFollowUp = moduleId === 'tarot_followup';
  const timestamp =
    typeof historyEntry.timestamp === 'number'
      ? historyEntry.timestamp
      : typeof prev.timestamp === 'number'
        ? (prev.timestamp as number)
        : Date.now();

  const prevCredits =
    typeof prev.creditsUsed === 'number'
      ? prev.creditsUsed
      : typeof historyEntry.creditsUsed === 'number'
        ? (historyEntry.creditsUsed as number)
        : 0;

  let saved: Record<string, unknown>;

  if (isFollowUp) {
    const incoming = Array.isArray(historyEntry.chatHistory)
      ? (historyEntry.chatHistory as ChatMsg[])
      : Array.isArray(prev.chatHistory)
        ? (prev.chatHistory as ChatMsg[])
        : [];

    // Drop empty assistant placeholders from the client stream UI
    const cleaned = incoming.filter(
      (m) => !(m?.role === 'assistant' && !(m.content && String(m.content).trim()))
    );

    const chatHistory = [
      ...cleaned,
      {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: fullText,
        timestamp: Date.now(),
      },
    ];

    saved = {
      ...prev,
      ...historyEntry,
      // Never replace the main reading text with a follow-up answer
      resultText: historyEntry.resultText ?? prev.resultText,
      chatHistory,
      timestamp: Date.now(),
      creditsUsed: prevCredits + creditsUsed,
    };
  } else {
    saved = {
      ...prev,
      ...historyEntry,
      resultText: fullText,
      timestamp,
      creditsUsed,
    };
  }

  const question =
    (typeof saved.question === 'string' && saved.question) ||
    (typeof saved.title === 'string' && saved.title) ||
    '';
  const spreadMode =
    (typeof saved.spreadMode === 'string' && saved.spreadMode) ||
    (typeof prev.spreadMode === 'string' && (prev.spreadMode as string)) ||
    'three';

  readingsDb.save(id, Number(saved.timestamp) || Date.now(), question, spreadMode, JSON.stringify(saved));
}
