// Facade Service re-exporting modular AI services for backward compatibility
export {
  DEFAULT_API_SETTINGS,
  PROVIDER_PRESETS,
  cleanAiResponse,
  getOpenAIClient,
  requestAiCompletion,
  streamAiCompletion,
} from './ai/aiClient';

export {
  analyzeTarotReading,
  generateFallbackReading,
  buildInitialUserPrompt,
  analyzeTarotFollowUp,
} from './ai/tarotAi';

export {
  analyzeFengShui,
  generateFallbackFengShui,
} from './ai/fengShuiAi';

export {
  analyzeZodiacHoroscope,
  generateFallbackZodiacHoroscope,
} from './ai/horoscopeAi';

export {
  analyzeNumerology,
  generateFallbackNumerology,
} from './ai/numerologyAi';

export {
  analyzeThaiLifeGraph,
  generateFallbackThaiLifeGraph,
} from './ai/thaiAstrologyAi';
