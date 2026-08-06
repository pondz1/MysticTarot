import { Router, Response } from 'express';
import OpenAI from 'openai';
import { creditsDb } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateCreditsFromTokens, CREDIT_RATES } from '../constants/creditRates.js';
import { sendSuccess, sendError } from '../utils/response.js';

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
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
}

aiRouter.post('/completion', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { systemPrompt, userPrompt, settings, stream } = req.body;

    if (!userPrompt) {
      sendError(res, 'userPrompt is required', 400);
      return;
    }

    const serverSettings = getServerSettings();
    const isCreditMode = !settings || settings.mode === 'credit' || !settings.apiKey;

    // Validate server API Key if in credit mode
    if (isCreditMode && !serverSettings.apiKey) {
      sendError(res, 'Server OPENAI_API_KEY ยังไม่ได้ตั้งค่าใน .env กรุณาตรวจสอบการตั้งค่าที่เซิร์ฟเวอร์', 500, 'MISSING_SERVER_API_KEY');
      return;
    }

    let remainingCredits: number | undefined;

    const headerSessionId = req.headers['x-session-id'];
    const userId = req.user?.userId
      ? req.user.userId
      : (typeof headerSessionId === 'string' && headerSessionId.trim() ? headerSessionId.trim() : 'default_user');

    // 1. If Credit Mode: Check minimum credit balance upfront
    if (isCreditMode) {
      const currentCredits = creditsDb.getCredits(userId);
      if (currentCredits < CREDIT_RATES.MIN_CREDITS_PER_REQUEST) {
        sendError(
          res,
          'Credit หมดแล้ว! กรุณาเติม Credit หรือเลือกสลับไปใช้ Custom API Key ของคุณเองในการตั้งค่า',
          402,
          'INSUFFICIENT_CREDITS',
          { credits: currentCredits }
        );
        return;
      }
    }

    // Use server default settings if credit mode, else custom settings
    const activeSettings = isCreditMode ? serverSettings : settings;
    const client = getClient(activeSettings);
    const model = activeSettings?.model || serverSettings.model;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const streamResponse = await client.chat.completions.create({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 5000,
        stream: true,
        stream_options: { include_usage: true },
      });

      let finalUsage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

      for await (const chunk of streamResponse) {
        if (chunk.usage) {
          finalUsage = chunk.usage;
        }
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Deduct credits after stream completes based on actual usage
      if (isCreditMode) {
        const creditsToDeduct = calculateCreditsFromTokens(finalUsage);
        const creditResult = creditsDb.deductCredit(userId, creditsToDeduct);
        remainingCredits = creditResult.remainingCredits;
        res.write(`data: ${JSON.stringify({ remainingCredits, creditsDeducted: creditsToDeduct })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const completion = await client.chat.completions.create({
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 5000,
    });

    const result = completion.choices[0]?.message?.content || '';

    // Deduct credits after successful non-streaming completion based on token usage
    let creditsDeducted: number | undefined;
    if (isCreditMode) {
      creditsDeducted = calculateCreditsFromTokens(completion.usage);
      const creditResult = creditsDb.deductCredit(userId, creditsDeducted);
      remainingCredits = creditResult.remainingCredits;
    }

    sendSuccess(res, { result, model, remainingCredits, creditsDeducted, usage: completion.usage });
  } catch (error: any) {
    console.error('AI completion error:', error);
    const userMessage = process.env.NODE_ENV === 'production'
      ? 'ไม่สามารถประมวลผลคำขอ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'
      : error?.message || 'Failed to complete AI request';
    sendError(res, userMessage, 500);
  }
});



