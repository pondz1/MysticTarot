/**
 * Re-export single source of truth from /shared/ai/markdownFormat.ts
 * (compiled via server tsconfig include of ../shared)
 */
export {
  buildMasterDirectives,
  MARKDOWN_OUTPUT_RULES,
  buildStructureBlock,
  lifeAspectSections,
  buildFallbackMarkdown,
  type PredictionSection,
} from '../../../shared/ai/markdownFormat.js';
