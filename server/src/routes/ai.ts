import { Router, Response } from 'express';
import OpenAI from 'openai';
import { creditsDb } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  calculateCreditsFromTokens,
  CREDIT_RATES,
  planCreditSettlement,
} from '../constants/creditRates.js';
import {
  AI_COMPLETION,
  maxTokensForModule,
  sanitizeAiErrorMessage,
} from '../constants/aiCompletion.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { buildModulePrompts } from '../ai/buildPrompts.js';
import { isAiModuleId } from '../ai/types.js';
import { saveAiHistoryEntry } from '../ai/saveReading.js';
import { completeIdempotency, failIdempotency } from '../middleware/idempotency.js';
import { parseUsageMeta, usageMetaToLogLine, type TokenUsageMeta } from '../ai/usageMeta.js';

export const aiRouter = Router();

function getServerSettings() {
  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  };
}

function getClient(settings?: { apiKey?: string; baseUrl?: string }) {
  const serverSettings = getServerSettings();
  const apiKey = settings?.apiKey || serverSettings.apiKey;
  const baseUrl = (settings?.baseUrl || serverSettings.baseUrl).replace(/\/+$/, '');

  return new OpenAI({
    apiKey: apiKey || 'ollama',
    baseURL: baseUrl,
    defaultHeaders: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
}

function estimateStreamUsage(
  systemPrompt: string,
  userPrompt: string,
  fullText: string
): { prompt_tokens: number; completion_tokens: number } {
  const promptChars = systemPrompt.length + userPrompt.length;
  return {
    prompt_tokens: Math.max(1, Math.ceil(promptChars * AI_COMPLETION.fallbackPromptTokensPerChar)),
    completion_tokens: Math.max(
      1,
      Math.ceil(fullText.length * AI_COMPLETION.fallbackCompletionTokensPerChar)
    ),
  };
}

function writeSse(res: Response, payload: unknown): boolean {
  if (res.writableEnded) return false;
  try {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Settle reserved credits against actual token cost.
 * Returns net credits charged for this request.
 */
function settleCredits(
  userId: string,
  reserved: number,
  actualCost: number
): { netCharged: number; remainingCredits: number } {
  const plan = planCreditSettlement(reserved, actualCost);
  let extraTaken = 0;
  if (plan.extraDeduct > 0) {
    const result = creditsDb.deductCredit(userId, plan.extraDeduct, 'settle_extra');
    extraTaken = result.deducted;
  } else if (plan.refund > 0) {
    creditsDb.refillCredits(userId, plan.refund, 'settle_refund');
  }
  // netCharged = reserve kept + extra actually taken (never more than balance allowed)
  const netCharged =
    plan.refund > 0 ? plan.netCharged : reserved + extraTaken;
  return {
    netCharged: Math.max(0, netCharged),
    remainingCredits: Math.max(0, creditsDb.getCredits(userId)),
  };
}

function refundReserve(userId: string, reserved: number): number {
  if (reserved > 0) {
    creditsDb.refillCredits(userId, reserved, 'refund', { reserved });
  }
  return creditsDb.getCredits(userId);
}

aiRouter.post('/completion', async (req: AuthRequest, res: Response): Promise<void> => {
  let clientDisconnected = false;
  let reservedCredits = 0;
  let creditUserId: string | null = null;
  let settled = false;
  const providerAbort = new AbortController();

  const onClose = () => {
    clientDisconnected = true;
    // Stop burning provider tokens when the browser disconnects / aborts
    if (!providerAbort.signal.aborted) {
      providerAbort.abort();
    }
  };
  req.on('close', onClose);

  try {
    const { settings, stream, historyEntry, module: moduleId, payload } = req.body || {};

    // Credit mode unless explicit custom mode with a key (legacy server path — client usually BYOK in browser)
    const isCreditMode = !settings || settings.mode === 'credit' || !settings.apiKey;
    const serverSettings = getServerSettings();

    if (isCreditMode && !serverSettings.apiKey) {
      sendError(
        res,
        'Server OPENAI_API_KEY ยังไม่ได้ตั้งค่าใน .env กรุณาตรวจสอบการตั้งค่าที่เซิร์ฟเวอร์',
        500,
        'MISSING_SERVER_API_KEY'
      );
      return;
    }

    // Credit mode: JWT required (guest login issues JWT — no free-form session spoofing)
    if (isCreditMode) {
      if (!req.user?.userId) {
        sendError(
          res,
          'กรุณาเข้าสู่ระบบก่อนใช้ Credit (รีเฟรชหน้าเพื่อ login อัตโนมัติ) หรือใช้ API Key ของคุณเอง',
          401,
          'AUTH_REQUIRED'
        );
        return;
      }
      creditUserId = req.user.userId;
    }

    // Resolve prompts
    let systemPrompt = '';
    let userPrompt = '';

    if (isCreditMode) {
      // Server-owned prompts only — ignore client systemPrompt/userPrompt
      if (!isAiModuleId(moduleId)) {
        sendError(
          res,
          'คำขอ Credit ต้องระบุ module ที่รองรับ (tarot, horoscope, …)',
          400,
          'INVALID_MODULE'
        );
        return;
      }
      try {
        const built = buildModulePrompts(moduleId, payload);
        systemPrompt = built.systemPrompt;
        userPrompt = built.userPrompt;
      } catch (buildErr: unknown) {
        const msg =
          buildErr instanceof Error ? buildErr.message : 'payload ของ module ไม่ถูกต้อง';
        sendError(res, msg, 400, 'INVALID_PAYLOAD');
        return;
      }
    } else {
      // Custom key path on server (optional): accept free-form prompts
      systemPrompt = typeof req.body?.systemPrompt === 'string' ? req.body.systemPrompt : '';
      userPrompt = typeof req.body?.userPrompt === 'string' ? req.body.userPrompt : '';
      if (!userPrompt) {
        sendError(res, 'userPrompt is required', 400, 'INVALID_PROMPT');
        return;
      }
    }

    const totalPromptChars = systemPrompt.length + userPrompt.length;
    if (totalPromptChars > AI_COMPLETION.maxPromptChars) {
      sendError(
        res,
        'คำขอมีข้อมูลยาวเกินไป กรุณาลดรายละเอียดแล้วลองใหม่',
        400,
        'PROMPT_TOO_LONG'
      );
      return;
    }

    // Reserve credits before calling provider
    if (isCreditMode && creditUserId) {
      const currentCredits = creditsDb.getCredits(creditUserId);
      const reserveAmount = CREDIT_RATES.RESERVE_CREDITS_PER_REQUEST;
      if (currentCredits < Math.max(CREDIT_RATES.MIN_CREDITS_TO_START, reserveAmount)) {
        sendError(
          res,
          'Credit หมดแล้ว! กรุณาเติม Credit หรือเลือกสลับไปใช้ Custom API Key ของคุณเองในการตั้งค่า',
          402,
          'INSUFFICIENT_CREDITS',
          { credits: currentCredits }
        );
        return;
      }
      const hold = creditsDb.deductCredit(creditUserId, reserveAmount);
      if (!hold.success || hold.deducted < reserveAmount) {
        sendError(
          res,
          'Credit ไม่เพียงพอสำหรับเริ่มคำขอ',
          402,
          'INSUFFICIENT_CREDITS',
          { credits: hold.remainingCredits }
        );
        return;
      }
      reservedCredits = hold.deducted;
    }

    const activeSettings = isCreditMode ? serverSettings : settings;
    const client = getClient(activeSettings);
    const model = activeSettings?.model || serverSettings.model;
    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: userPrompt },
    ];

    const completionMaxTokens = maxTokensForModule(
      typeof moduleId === 'string' ? moduleId : undefined
    );

    console.log(
      `[AI Request] Mode: ${isCreditMode ? 'Credit' : 'Custom Key'}, Module: ${moduleId || 'freeform'}, Model: ${model}, Stream: ${!!stream}, MaxTokens: ${completionMaxTokens}, User: ${creditUserId || 'n/a'}`
    );

    if (stream) {
      const baseStreamParams = {
        model,
        messages,
        temperature: AI_COMPLETION.temperature,
        max_tokens: completionMaxTokens,
        stream: true as const,
      };

      let streamResponse: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
      try {
        // Prefer include_usage so reasoning_tokens can appear on the final chunk (OpenAI).
        // Fall back without stream_options for proxies that reject unknown fields.
        try {
          streamResponse = await client.chat.completions.create(
            {
              ...baseStreamParams,
              stream_options: { include_usage: true },
            },
            { signal: providerAbort.signal }
          );
        } catch (withUsageErr: unknown) {
          const msg =
            withUsageErr instanceof Error ? withUsageErr.message : String(withUsageErr);
          if (/stream_options|unrecognized|unknown|invalid/i.test(msg)) {
            console.warn('[AI] stream_options.include_usage not supported; retrying without it');
            streamResponse = await client.chat.completions.create(baseStreamParams, {
              signal: providerAbort.signal,
            });
          } else {
            throw withUsageErr;
          }
        }
      } catch (createErr: unknown) {
        const aborted =
          clientDisconnected ||
          providerAbort.signal.aborted ||
          (createErr instanceof Error && createErr.name === 'AbortError');
        if (aborted) {
          if (isCreditMode && creditUserId && reservedCredits > 0 && !settled) {
            refundReserve(creditUserId, reservedCredits);
            settled = true;
          }
          if (!res.headersSent) {
            sendError(res, 'คำขอถูกยกเลิก', 499 as number, 'CLIENT_ABORTED');
          }
          return;
        }
        throw createErr;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let finalUsage: OpenAI.Completions.CompletionUsage | undefined;
      let fullText = '';
      let abortedEarly = false;
      let finishReason: string | null = null;

      try {
        for await (const chunk of streamResponse) {
          if (clientDisconnected || providerAbort.signal.aborted) {
            abortedEarly = true;
            break;
          }
          if (chunk.usage) {
            finalUsage = chunk.usage;
          }
          const choice = chunk.choices[0];
          if (choice?.finish_reason) {
            finishReason = choice.finish_reason;
          }
          const content = choice?.delta?.content || '';
          if (content) {
            fullText += content;
            writeSse(res, { content });
          }
        }
      } catch (streamErr: unknown) {
        const aborted =
          clientDisconnected ||
          providerAbort.signal.aborted ||
          (streamErr instanceof Error &&
            (streamErr.name === 'AbortError' || /aborted|abort/i.test(streamErr.message)));
        if (!aborted) throw streamErr;
        abortedEarly = true;
      }

      const truncatedByMaxTokens = finishReason === 'length';
      // Append a short notice so users understand the cutoff is not a random crash
      if (truncatedByMaxTokens && fullText.trim() && !clientDisconnected) {
        const notice =
          '\n\n> **หมายเหตุ:** คำทำนายถูกตัดเพราะยาวเกินงบ output ของรอบนี้ — ลองเปิดใหม่หรือถาม follow-up ในส่วนที่ขาด';
        fullText += notice;
        writeSse(res, { content: notice });
      }

      const fallbackUsage = estimateStreamUsage(systemPrompt, userPrompt, fullText);
      const hasApiUsage = Boolean(
        finalUsage && (finalUsage.prompt_tokens || finalUsage.completion_tokens)
      );
      const usageMeta: TokenUsageMeta = parseUsageMeta(
        finalUsage,
        hasApiUsage ? undefined : fallbackUsage
      );

      let creditsDeducted = 0;
      let remainingCredits: number | undefined;

      if (isCreditMode && creditUserId) {
        if (fullText.trim()) {
          const usageToUse = hasApiUsage
            ? finalUsage
            : fallbackUsage;
          const actualCost = calculateCreditsFromTokens(usageToUse);
          const settledResult = settleCredits(creditUserId, reservedCredits, actualCost);
          creditsDeducted = settledResult.netCharged;
          remainingCredits = settledResult.remainingCredits;
          settled = true;
        } else {
          remainingCredits = refundReserve(creditUserId, reservedCredits);
          creditsDeducted = 0;
          settled = true;
        }
        writeSse(res, {
          remainingCredits: Math.max(0, remainingCredits ?? 0),
          creditsDeducted,
          partial: abortedEarly || clientDisconnected || truncatedByMaxTokens,
          truncated: truncatedByMaxTokens,
          finishReason: finishReason || undefined,
          usage: usageMeta,
        });
      } else {
        writeSse(res, {
          partial: abortedEarly || clientDisconnected || truncatedByMaxTokens,
          truncated: truncatedByMaxTokens,
          finishReason: finishReason || undefined,
          usage: usageMeta,
        });
      }

      if (!res.writableEnded) {
        try {
          res.write('data: [DONE]\n\n');
          res.end();
        } catch {
          // ignore
        }
      }

      console.log(
        `[AI Stream Finished] chars=${fullText.length} charged=${creditsDeducted} rem=${remainingCredits} finish=${finishReason || 'n/a'} partial=${abortedEarly || clientDisconnected || truncatedByMaxTokens} tokens{${usageMetaToLogLine(usageMeta)}}`
      );

      // Cache full stream result for idempotent retry (SSE or JSON replay)
      if (fullText.trim() && !clientDisconnected) {
        completeIdempotency(req, {
          result: fullText,
          remainingCredits,
          creditsDeducted,
          truncated: truncatedByMaxTokens,
          finishReason: finishReason || undefined,
          usage: usageMeta,
        });
      } else if (!fullText.trim()) {
        failIdempotency(req);
      }

      if (historyEntry && historyEntry.id && fullText.trim()) {
        const creditsUsed = isCreditMode
          ? creditsDeducted || CREDIT_RATES.MIN_CREDITS_PER_REQUEST
          : 0;
        try {
          saveAiHistoryEntry({
            moduleId: typeof moduleId === 'string' ? moduleId : undefined,
            historyEntry: historyEntry as Record<string, unknown>,
            fullText,
            creditsUsed,
          });
        } catch (saveErr) {
          console.error('[AI] Failed to save history entry', saveErr);
        }
      }

      return;
    }

    // Non-streaming
    if (clientDisconnected) {
      if (isCreditMode && creditUserId && !settled) {
        refundReserve(creditUserId, reservedCredits);
        settled = true;
      }
      return;
    }

    let completion: OpenAI.Chat.Completions.ChatCompletion;
    try {
      completion = await client.chat.completions.create(
        {
          model,
          messages,
          temperature: AI_COMPLETION.temperature,
          max_tokens: completionMaxTokens,
        },
        { signal: providerAbort.signal }
      );
    } catch (createErr: unknown) {
      const aborted =
        clientDisconnected ||
        providerAbort.signal.aborted ||
        (createErr instanceof Error && createErr.name === 'AbortError');
      if (aborted) {
        if (isCreditMode && creditUserId && reservedCredits > 0 && !settled) {
          refundReserve(creditUserId, reservedCredits);
          settled = true;
        }
        if (!res.headersSent) {
          sendError(res, 'คำขอถูกยกเลิก', 499 as number, 'CLIENT_ABORTED');
        }
        return;
      }
      throw createErr;
    }

    let result = completion.choices[0]?.message?.content || '';
    const finishReason = completion.choices[0]?.finish_reason || null;
    const truncatedByMaxTokens = finishReason === 'length';
    if (truncatedByMaxTokens && result.trim()) {
      result +=
        '\n\n> **หมายเหตุ:** คำทำนายถูกตัดเพราะยาวเกินงบ output ของรอบนี้ — ลองเปิดใหม่หรือถาม follow-up ในส่วนที่ขาด';
    }

    const usageMeta = parseUsageMeta(completion.usage);

    let creditsDeducted: number | undefined;
    let remainingCredits: number | undefined;

    if (isCreditMode && creditUserId) {
      if (result.trim()) {
        const actualCost = calculateCreditsFromTokens(completion.usage);
        const settledResult = settleCredits(creditUserId, reservedCredits, actualCost);
        creditsDeducted = settledResult.netCharged;
        remainingCredits = settledResult.remainingCredits;
      } else {
        remainingCredits = refundReserve(creditUserId, reservedCredits);
        creditsDeducted = 0;
      }
      settled = true;
    }

    if (clientDisconnected || res.writableEnded) {
      return;
    }

    if (historyEntry && historyEntry.id && result.trim()) {
      try {
        saveAiHistoryEntry({
          moduleId: typeof moduleId === 'string' ? moduleId : undefined,
          historyEntry: historyEntry as Record<string, unknown>,
          fullText: result,
          creditsUsed: isCreditMode
            ? creditsDeducted || CREDIT_RATES.MIN_CREDITS_PER_REQUEST
            : 0,
        });
      } catch (saveErr) {
        console.error('[AI] Failed to save history entry', saveErr);
      }
    }

    console.log(
      `[AI Completion Finished] charged=${creditsDeducted} rem=${remainingCredits} finish=${finishReason || 'n/a'} tokens{${usageMetaToLogLine(usageMeta)}}`
    );

    sendSuccess(res, {
      result,
      model,
      remainingCredits:
        typeof remainingCredits === 'number' ? Math.max(0, remainingCredits) : remainingCredits,
      creditsDeducted,
      usage: completion.usage,
      usageMeta,
      truncated: truncatedByMaxTokens,
      finishReason: finishReason || undefined,
    });
  } catch (error: unknown) {
    failIdempotency(req);
    // Refund reserve on provider/route failure
    if (creditUserId && reservedCredits > 0 && !settled) {
      try {
        refundReserve(creditUserId, reservedCredits);
        settled = true;
      } catch (refundErr) {
        console.error('[AI] Failed to refund reserve', refundErr);
      }
    }

    console.error(
      '[AI Completion Error]',
      error && typeof error === 'object' && 'status' in error
        ? (error as { status?: number }).status
        : '',
      error && typeof error === 'object' && 'message' in error
        ? (error as { message?: string }).message
        : error
    );

    if (!res.headersSent) {
      const isProduction = process.env.NODE_ENV === 'production';
      const userMessage = sanitizeAiErrorMessage(error, isProduction);
      sendError(res, userMessage, 500, 'AI_COMPLETION_FAILED');
    } else if (!res.writableEnded) {
      try {
        res.write(
          `data: ${JSON.stringify({
            error: sanitizeAiErrorMessage(error, process.env.NODE_ENV === 'production'),
          })}\n\n`
        );
        res.write('data: [DONE]\n\n');
        res.end();
      } catch {
        // ignore
      }
    }
  } finally {
    req.off('close', onClose);
  }
});
