/**
 * Re-export shared module prompt builders (same as server credit mode).
 */
export {
  buildModulePrompts,
  getSpreadConfig,
  AI_MODULE_IDS,
  isAiModuleId,
  type AiModuleId,
  type BuiltPrompts,
  type TarotCardPayload,
  type TarotPayload,
  type TarotFollowUpPayload,
  type HoroscopePayload,
  type NumerologyPayload,
  type FengShuiPayload,
  type ThaiAstrologyPayload,
} from '@shared/ai/buildPrompts';
