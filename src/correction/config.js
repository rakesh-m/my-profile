// Prajakt provider configuration.
//
// Swap the AI model by changing ACTIVE_PROVIDER (e.g. 'gemini' -> 'openai').
// It can also be overridden at build time via REACT_APP_PRAJAKT_PROVIDER.
//
// API keys are browser-side (client) keys, restricted in the provider console
// by HTTP referrer (rakesh-m.dev) and quota — the standard way to call these
// APIs from a static page. Provide them via env vars at build time.
export const ACTIVE_PROVIDER =
  process.env.REACT_APP_PRAJAKT_PROVIDER || 'gemini';

export const PROVIDER_CONFIG = {
  gemini: {
    apiKey:
      process.env.REACT_APP_GEMINI_API_KEY || 'REPLACE_WITH_GEMINI_API_KEY',
    model: process.env.REACT_APP_GEMINI_MODEL || 'gemini-3.6-flash',
  },
  openai: {
    apiKey:
      process.env.REACT_APP_OPENAI_API_KEY || 'REPLACE_WITH_OPENAI_API_KEY',
    model: process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o-mini',
  },
};
