// Provider registry + public facade for Prajakt's correction logic.
//
// The UI (and, in future, a server-side bot backend) should import only
// `correctMarathi` and `activeProviderName` from here. Adding a new model
// means adding an adapter file and registering it in `providers` below —
// nothing else in the app needs to change.
import { ACTIVE_PROVIDER, PROVIDER_CONFIG } from './config';
import { SYSTEM_INSTRUCTION } from './prompt';
import { correct as geminiCorrect } from './providers/gemini';
import { correct as openaiCorrect } from './providers/openai';

const providers = {
  gemini: geminiCorrect,
  openai: openaiCorrect,
};

export const activeProviderName = ACTIVE_PROVIDER;

// Corrects Marathi text using the currently configured provider.
export async function correctMarathi(text) {
  const provider = providers[ACTIVE_PROVIDER];
  if (!provider) {
    throw new Error(`Unknown provider: ${ACTIVE_PROVIDER}`);
  }
  const cfg = PROVIDER_CONFIG[ACTIVE_PROVIDER] || {};
  return provider(text, {
    apiKey: cfg.apiKey,
    model: cfg.model,
    instruction: SYSTEM_INSTRUCTION,
  });
}
