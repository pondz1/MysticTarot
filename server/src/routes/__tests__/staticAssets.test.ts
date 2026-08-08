import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { createApp } from '../../app.js';

describe('Static Asset Serving & Cache Control', () => {
  const publicDir = path.resolve(process.cwd(), 'public');
  let createdDummyPublic = false;

  beforeAll(() => {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      createdDummyPublic = true;
    }
    fs.writeFileSync(path.join(publicDir, 'index.html'), '<html><body>Root</body></html>');
  });

  afterAll(() => {
    if (createdDummyPublic && fs.existsSync(publicDir)) {
      fs.rmSync(publicDir, { recursive: true, force: true });
    }
  });

  it('returns 404 Not Found for missing JS asset requests instead of index.html', async () => {
    const app = createApp();
    const res = await request(app).get('/assets/TarotEncyclopediaPage-NONEXISTENT.js');
    expect(res.status).toBe(404);
    expect(res.text).toBe('Asset not found');
  });

  it('returns 404 Not Found for missing static image assets', async () => {
    const app = createApp();
    const res = await request(app).get('/missing-file.png');
    expect(res.status).toBe(404);
    expect(res.text).toBe('Asset not found');
  });

  it('sets no-cache headers on SPA fallback index.html', async () => {
    const app = createApp();
    const res = await request(app).get('/tarot/encyclopedia');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
  });
});
