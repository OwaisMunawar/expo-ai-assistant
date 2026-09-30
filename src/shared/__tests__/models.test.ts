import { DEFAULT_MODEL_ID, getModel, isSupportedModel, MODELS } from '@/shared/models';
import { PROMPTS } from '@/shared/prompts';

describe('models', () => {
  it('uses gateway-style provider/model IDs', () => {
    for (const m of MODELS) expect(m.id).toMatch(/^[a-z]+\/[\w.-]+$/);
  });

  it('accepts only listed models', () => {
    expect(isSupportedModel(DEFAULT_MODEL_ID)).toBe(true);
    expect(isSupportedModel('openai/gpt-4o')).toBe(false);
    expect(isSupportedModel(42)).toBe(false);
  });

  it('falls back to the default model for unknown IDs', () => {
    expect(getModel('nope').id).toBe(DEFAULT_MODEL_ID);
  });
});

describe('prompts', () => {
  it('have unique IDs and non-empty text', () => {
    expect(new Set(PROMPTS.map((p) => p.id)).size).toBe(PROMPTS.length);
    for (const p of PROMPTS) expect(p.text.length).toBeGreaterThan(20);
  });
});
