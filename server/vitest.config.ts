import { defineConfig } from 'vitest/config';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Isolated SQLite dir so tests never lock/clash with dev DB or each other
const testDataDir = path.join(os.tmpdir(), `mystic-verse-test-${process.pid}`);
fs.mkdirSync(testDataDir, { recursive: true });

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    // better-sqlite3 is single-writer; run files serially against one process DB
    fileParallelism: false,
    env: {
      DATA_DIR: testDataDir,
      NODE_ENV: 'test',
    },
  },
});
