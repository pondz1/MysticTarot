import { Router, Request, Response } from 'express';
import { readingsDb } from '../db.js';

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
    res.status(500).json({ error: error.message });
  }
});

// GET reading by ID
readingsRouter.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const row = readingsDb.getById(id);
    if (!row) {
      res.status(404).json({ error: 'Reading not found' });
      return;
    }
    res.json(JSON.parse(row.data));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST save or update reading
readingsRouter.post('/', (req: Request, res: Response): void => {
  try {
    const reading = req.body;
    if (!reading || !reading.id) {
      res.status(400).json({ error: 'Reading object with id is required' });
      return;
    }

    const timestamp = typeof reading.timestamp === 'number' ? reading.timestamp : Date.now();
    const question = reading.question || '';
    const spreadMode = reading.spreadMode || 'three';
    const dataStr = JSON.stringify(reading);

    readingsDb.save(reading.id, timestamp, question, spreadMode, dataStr);

    res.json({ success: true, reading });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE reading by ID
readingsRouter.delete('/:id', (req: Request, res: Response): void => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = readingsDb.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Reading not found' });
      return;
    }
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE all readings
readingsRouter.delete('/', (_req: Request, res: Response) => {
  try {
    readingsDb.clearAll();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
