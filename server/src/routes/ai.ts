import { Router, Response } from 'express';
import OpenAI from 'openai';
import { creditsDb } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const aiRouter = Router();

const DEFAULT_SERVER_SETTINGS = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};

function getClient(settings?: { apiKey?: string; baseUrl?: string }) {
  const apiKey = settings?.apiKey || DEFAULT_SERVER_SETTINGS.apiKey;
  const baseUrl = (settings?.baseUrl || DEFAULT_SERVER_SETTINGS.baseUrl).replace(/\/+$/, '');

  return new OpenAI({
    apiKey: apiKey || 'ollama',
    baseURL: baseUrl,
  });
}

aiRouter.post('/completion', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { systemPrompt, userPrompt, settings, stream } = req.body;

    if (!userPrompt) {
      res.status(400).json({ error: 'userPrompt is required' });
      return;
    }

    const isCreditMode = !settings || settings.mode === 'credit' || !settings.apiKey;
    let remainingCredits: number | undefined;

    const headerSessionId = req.headers['x-session-id'];
    const userId = req.user?.userId
      ? req.user.userId
      : (typeof headerSessionId === 'string' && headerSessionId.trim() ? headerSessionId.trim() : 'default_user');

    // 1. If Credit Mode: Deduct Credit
    if (isCreditMode) {
      const creditCheck = creditsDb.deductCredit(userId);
      if (!creditCheck.success) {
        res.status(402).json({
          error: 'Credit หมดแล้ว! กรุณาเติม Credit หรือเลือกสลับไปใช้ Custom API Key ของคุณเองในการตั้งค่า',
          credits: 0,
        });
        return;
      }
      remainingCredits = creditCheck.remainingCredits;
    }

    // Use server default settings if credit mode, else custom settings
    const activeSettings = isCreditMode ? DEFAULT_SERVER_SETTINGS : settings;
    const client = getClient(activeSettings);
    const model = activeSettings?.model || DEFAULT_SERVER_SETTINGS.model;

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
      });

      for await (const chunk of streamResponse) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      if (remainingCredits !== undefined) {
        res.write(`data: ${JSON.stringify({ remainingCredits })}\n\n`);
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
    res.json({ result, model, remainingCredits, usage: completion.usage });
  } catch (error: any) {
    console.error('AI completion error:', error);
    const userMessage = process.env.NODE_ENV === 'production'
      ? 'ไม่สามารถประมวลผลคำขอ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'
      : error?.message || 'Failed to complete AI request';
    res.status(500).json({ error: userMessage });
  }
});

