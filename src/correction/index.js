// Provider registry + public facade for Prajakt's transliteration/correction.
//
// The UI (and, in future, a server-side bot backend) should import only
// `processText` (plus `activeProviderName`) from here. Adding a new model
// means adding an adapter file and registering it in `providers` below.
import { ACTIVE_PROVIDER, PROVIDER_CONFIG } from './config';
import { SYSTEM_INSTRUCTION } from './prompt';
import { correct as geminiCorrect } from './providers/gemini';
import { correct as openaiCorrect } from './providers/openai';
import { transliterateRomanized } from './transliterate';

const providers = {
  gemini: geminiCorrect,
  openai: openaiCorrect,
};

export const activeProviderName = ACTIVE_PROVIDER;

// Returns true if the text contains any Devanagari characters.
function hasDevanagari(text) {
  return /[\u0900-\u097F]/.test(text);
}

// Runs the configured LLM provider on the given text.
async function runModel(text) {
  const provider = providers[ACTIVE_PROVIDER];
  if (!provider) throw new Error(`Unknown provider: ${ACTIVE_PROVIDER}`);
  const cfg = PROVIDER_CONFIG[ACTIVE_PROVIDER] || {};
  return provider(text, {
    apiKey: cfg.apiKey,
    model: cfg.model,
    instruction: SYSTEM_INSTRUCTION,
  });
}

// Main entry point.
// - Romanized (Latin) input: transliterate via Google Input Tools (fast).
//   If that fails for any reason, fall back to the LLM.
// - Devanagari input: proofread/correct via the LLM.
export async function processText(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  if (!hasDevanagari(trimmed)) {
    const fast = await transliterateRomanized(trimmed);
    if (fast) return fast;
    // Input Tools unavailable — fall back to the model.
    return runModel(trimmed);
  }

  return runModel(trimmed);
}

// Backwards-compatible alias.
export const correctMarathi = processText;
