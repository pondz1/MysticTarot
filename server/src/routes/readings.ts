import { Router, Request, Response } from 'express';
import { readingsDb } from '../db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const readingsRouter = Router();

// GET all saved readings
readingsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const rows = readingsDb.getAll();
    const readings = rows.map((row) => {
      try {
        return JSON.parse(row.data);
      } catch {
        return null;
      }
    }).filter(Boolean);

    res.json(readings);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

// GET reading by ID
readingsRouter.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const row = readingsDb.getById(id);
    if (!row) {
      sendError(res, 'Reading not found', 404);
      return;
    }
    res.json(JSON.parse(row.data));
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

// POST save or update reading
readingsRouter.post('/', (req: Request, res: Response): void => {
  try {
    const reading = req.body;
    if (!reading || !reading.id) {
      sendError(res, 'Reading object with id is required', 400);
      return;
    }

    const timestamp = typeof reading.timestamp === 'number' ? reading.timestamp : Date.now();
    const question = reading.question || '';
    const spreadMode = reading.spreadMode || 'three';
    const dataStr = JSON.stringify(reading);

    readingsDb.save(reading.id, timestamp, question, spreadMode, dataStr);

    sendSuccess(res, { reading });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

// DELETE reading by ID
readingsRouter.delete('/:id', (req: Request, res: Response): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = readingsDb.delete(id);
    if (!deleted) {
      sendError(res, 'Reading not found', 404);
      return;
    }
    sendSuccess(res, { id });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

// DELETE all readings
readingsRouter.delete('/', (_req: Request, res: Response) => {
  try {
    readingsDb.clearAll();
    sendSuccess(res);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
});

