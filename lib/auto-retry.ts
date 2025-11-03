/**
 * Auto-retry Logic with Intelligent Strategy Adjustment
 *
 * Implements layered retry strategy with strength adjustment,
 * prompt template switching, and candidate reranking.
 */

import { scoreImageQuality } from './quality-scorer';

export interface RetryConfig {
  maxRetries: number;
  strengthStep: number;
  kSamplesDefault: number;
  kSamplesHighRisk: number;
}

export interface GenerationResult {
  url: string;
  originalUrl: string;
  similarity: number;
  difference: number;
  ssim?: number;
  phashDistance?: number;
  edgeScore?: number;
  geomDelta?: number;
  qualityScore?: number;
  errorLevel?: 'P0' | 'P1' | 'P2' | 'OK';
  errorReasons?: string[];
  strengthUsed: number;
  retryCount: number;
  generationMode: string;
}

export interface RetryStrategy {
  retryNumber: number;
  strengthAdjustment: number;
  promptTemplate: string;
  reason: string;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 2,
  strengthStep: 0.15,
  kSamplesDefault: 3,
  kSamplesHighRisk: 4,
};

const PROMPT_TEMPLATES = [
  {
    name: 'light_texture',
    description: 'Subtle adjustments with light texture variations',
    emphasis: 'minimal changes, preserve original style'
  },
  {
    name: 'new_background',
    description: 'Complete background replacement with new setting',
    emphasis: 'dramatic background change, maintain product identity'
  },
  {
    name: 'strong_lighting',
    description: 'Dramatic lighting changes and shadow adjustments',
    emphasis: 'creative lighting, high contrast, professional photography style'
  }
];

export function determineRiskLevel(
  imageUrl: string,
  modificationLevel: number
): 'low' | 'medium' | 'high' {
  if (modificationLevel >= 75) {
    return 'high';
  } else if (modificationLevel >= 50) {
    return 'medium';
  }
  return 'low';
}

export function getKSamples(
  riskLevel: 'low' | 'medium' | 'high',
  config: Partial<RetryConfig> = {}
): number {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  switch (riskLevel) {
    case 'high':
      return cfg.kSamplesHighRisk;
    case 'medium':
      return Math.ceil((cfg.kSamplesDefault + cfg.kSamplesHighRisk) / 2);
    case 'low':
    default:
      return cfg.kSamplesDefault;
  }
}

export function planRetryStrategy(
  currentAttempt: number,
  currentStrength: number,
  lastError: 'P0' | 'P1' | 'P2',
  config: Partial<RetryConfig> = {}
): RetryStrategy | null {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (currentAttempt >= cfg.maxRetries) {
    return null;
  }

  const retryNumber = currentAttempt + 1;
  let strengthAdjustment = cfg.strengthStep;
  let promptTemplate = PROMPT_TEMPLATES[0].name;
  let reason = '';

  if (lastError === 'P0') {
    reason = 'Critical error - geometry/shape changed';
    strengthAdjustment = -cfg.strengthStep;
    promptTemplate = 'light_texture';
  } else if (lastError === 'P1') {
    if (retryNumber === 1) {
      reason = 'Not different enough - increase strength';
      strengthAdjustment = cfg.strengthStep;
      promptTemplate = 'new_background';
    } else {
      reason = 'Still not different - try dramatic lighting';
      strengthAdjustment = cfg.strengthStep * 1.5;
      promptTemplate = 'strong_lighting';
    }
  }

  return {
    retryNumber,
    strengthAdjustment,
    promptTemplate,
    reason,
  };
}

export async function rerankCandidates(
  originalUrl: string,
  candidates: string[],
  weights: { ssim: number; phash: number; edge: number; geom: number } = { ssim: 0.3, phash: 0.25, edge: 0.25, geom: 0.2 }
): Promise<Array<{ url: string; score: number; qualityResult: any }>> {
  const scoredCandidates = await Promise.all(
    candidates.map(async (url) => {
      try {
        const qualityResult = await scoreImageQuality(originalUrl, url);

        if (!qualityResult.passed && ['P0', 'P1'].includes(qualityResult.errorLevel)) {
          return null;
        }

        const { ssimDiff, phashDistance, edgeScore, geomDelta } = qualityResult.scores;

        const normalizedPhash = Math.min(1, phashDistance / 64);
        const normalizedGeom = 1 - geomDelta;

        const score =
          weights.ssim * ssimDiff +
          weights.phash * normalizedPhash +
          weights.edge * edgeScore +
          weights.geom * normalizedGeom;

        return { url, score, qualityResult };
      } catch (error) {
        console.error(`Failed to score candidate ${url}:`, error);
        return null;
      }
    })
  );

  const validCandidates = scoredCandidates.filter(c => c !== null) as Array<{ url: string; score: number; qualityResult: any }>;

  validCandidates.sort((a, b) => b.score - a.score);

  return validCandidates;
}

export function adjustStrengthForRetry(
  currentStrength: number,
  adjustment: number
): number {
  const newStrength = currentStrength + adjustment;
  return Math.max(10, Math.min(100, newStrength));
}

export function getPromptTemplate(templateName: string, description: string, modificationLevel: number, logoText: string): string {
  const template = PROMPT_TEMPLATES.find(t => t.name === templateName) || PROMPT_TEMPLATES[0];

  const basePrompt = `CRITICAL TASK: MINIMAL IMAGE EDITING - PRESERVE PRODUCT APPEARANCE

⚠️ ABSOLUTE RULE: The product container/packaging/design MUST remain virtually IDENTICAL to the input image.

Template: ${template.description}
Emphasis: ${template.emphasis}

Apply ONLY background and lighting modifications.

=== CRITICAL REQUIREMENTS ===

1. PRODUCT PRESERVATION (HIGHEST PRIORITY):
   ✅ KEEP the exact same product container/bottle/box/package
   ✅ KEEP all design elements (patterns, graphics, color schemes)
   ✅ KEEP product dimensions and proportions
   ✅ ONLY modify: background environment, lighting/shadows

2. MODIFICATION FOCUS:
   - ${template.emphasis}
   - Background changes allowed: ${modificationLevel < 50 ? 'subtle' : modificationLevel < 75 ? 'moderate' : 'dramatic'}
   - Lighting adjustments allowed: ${modificationLevel < 50 ? 'minimal' : modificationLevel < 75 ? 'noticeable' : 'creative'}

${logoText ? `
3. LOGO HANDLING:
   - Remove ALL existing logos from product
   - Add "${logoText}" as new professional logo
   - Ensure high contrast and readability
` : `
3. LOGO REMOVAL:
   - Remove ALL existing logos and brand text
   - Keep product surface clean and generic
`}

Reference description: "${description}"

OUTPUT = Same product + ${template.emphasis}`;

  return basePrompt;
}

export class RetryManager {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async executeWithRetry(
    generateFn: (strength: number, promptTemplate: string, k: number) => Promise<string[]>,
    originalUrl: string,
    initialStrength: number,
    description: string,
    logoText: string
  ): Promise<GenerationResult> {
    let currentStrength = initialStrength;
    let currentAttempt = 0;
    let lastError: 'P0' | 'P1' | 'P2' | null = null;
    let promptTemplateName = 'light_texture';

    const riskLevel = determineRiskLevel(originalUrl, initialStrength);
    const k = getKSamples(riskLevel, this.config);

    while (currentAttempt <= this.config.maxRetries) {
      try {
        console.log(`Attempt ${currentAttempt + 1}: strength=${currentStrength}, template=${promptTemplateName}, k=${k}`);

        const promptTemplate = getPromptTemplate(promptTemplateName, description, currentStrength, logoText);

        const candidates = await generateFn(currentStrength, promptTemplate, k);

        if (candidates.length === 0) {
          throw new Error('No candidates generated');
        }

        const rankedCandidates = await rerankCandidates(originalUrl, candidates);

        if (rankedCandidates.length > 0) {
          const best = rankedCandidates[0];

          const result: GenerationResult = {
            url: best.url,
            originalUrl: originalUrl,
            similarity: 100 - best.qualityResult.scores.ssimDiff * 100,
            difference: best.qualityResult.scores.ssimDiff * 100,
            ssim: best.qualityResult.scores.ssim,
            phashDistance: best.qualityResult.scores.phashDistance,
            edgeScore: best.qualityResult.scores.edgeScore,
            geomDelta: best.qualityResult.scores.geomDelta,
            qualityScore: best.qualityResult.scores.overallScore,
            errorLevel: best.qualityResult.errorLevel,
            errorReasons: best.qualityResult.reasons,
            strengthUsed: currentStrength,
            retryCount: currentAttempt,
            generationMode: promptTemplateName,
          };

          if (result.errorLevel === 'OK' || result.errorLevel === 'P2') {
            console.log(`Success on attempt ${currentAttempt + 1}`);
            return result;
          }

          lastError = result.errorLevel as 'P0' | 'P1';
        } else {
          lastError = 'P1';
        }

        if (currentAttempt >= this.config.maxRetries) {
          console.log(`Max retries reached, returning best effort`);
          if (rankedCandidates.length > 0) {
            const best = rankedCandidates[0];
            return {
              url: best.url,
              originalUrl: originalUrl,
              similarity: 100 - best.qualityResult.scores.ssimDiff * 100,
              difference: best.qualityResult.scores.ssimDiff * 100,
              ssim: best.qualityResult.scores.ssim,
              phashDistance: best.qualityResult.scores.phashDistance,
              edgeScore: best.qualityResult.scores.edgeScore,
              geomDelta: best.qualityResult.scores.geomDelta,
              qualityScore: best.qualityResult.scores.overallScore,
              errorLevel: best.qualityResult.errorLevel,
              errorReasons: best.qualityResult.reasons,
              strengthUsed: currentStrength,
              retryCount: currentAttempt,
              generationMode: promptTemplateName,
            };
          }
          throw new Error(`Failed after ${this.config.maxRetries} retries: ${lastError}`);
        }

        const strategy = planRetryStrategy(currentAttempt, currentStrength, lastError!, this.config);

        if (!strategy) {
          break;
        }

        currentStrength = adjustStrengthForRetry(currentStrength, strategy.strengthAdjustment);
        promptTemplateName = strategy.promptTemplate;
        currentAttempt++;

        console.log(`Retrying: ${strategy.reason}`);
      } catch (error) {
        console.error(`Error in attempt ${currentAttempt + 1}:`, error);
        if (currentAttempt >= this.config.maxRetries) {
          throw error;
        }
        currentAttempt++;
      }
    }

    throw new Error(`Failed to generate quality image after ${this.config.maxRetries} retries`);
  }
}
