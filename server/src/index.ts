import { loadEnv, logPaymentEnvStatus } from './loadEnv.js';

const envFiles = loadEnv();

import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 3001;

// Only bind when this file is the process entrypoint (not when imported by tests)
if (process.env.VITEST !== 'true') {
  app.listen(PORT, () => {
    console.log(`🔮 MysticVerse Backend server running on http://localhost:${PORT}`);
    if (envFiles.length > 0) {
      console.log(`[Env] loaded: ${envFiles.join(', ')}`);
    }
    logPaymentEnvStatus();
  });
}

export { app };
