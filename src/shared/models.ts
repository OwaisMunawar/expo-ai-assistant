/**
 * The models the app offers. IDs are Vercel AI Gateway IDs (`provider/model`),
 * so one server-side key reaches every provider. The server only accepts IDs
 * from this list — the client can pick a model, but never an arbitrary one.
 */
export type ModelOption = {
  id: string;
  label: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google';
  description: string;
};

export const MODELS: readonly ModelOption[] = [
  {
    id: 'anthropic/claude-sonnet-5.5',
    label: 'Claude Sonnet 5.5',
    provider: 'Anthropic',
    description: 'Strong writing and reasoning',
  },
  {
    id: 'openai/gpt-5.5',
    label: 'GPT-5.5',
    provider: 'OpenAI',
    description: 'General-purpose flagship',
  },
  {
    id: 'google/gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    provider: 'Google',
    description: 'Fast and inexpensive',
  },
] as const;

const FALLBACK = MODELS[0]!;

export const DEFAULT_MODEL_ID = FALLBACK.id;

export function isSupportedModel(id: unknown): id is string {
  return typeof id === 'string' && MODELS.some((m) => m.id === id);
}

export function getModel(id: string): ModelOption {
  return MODELS.find((m) => m.id === id) ?? FALLBACK;
}
