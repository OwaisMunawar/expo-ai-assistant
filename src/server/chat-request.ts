import type { UIMessage } from 'ai';
import { z } from 'zod';

import { LIMITS } from '@/shared/limits';
import { DEFAULT_MODEL_ID, isSupportedModel } from '@/shared/models';

const partSchema = z.looseObject({ type: z.string() });

const messageSchema = z.looseObject({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(partSchema),
});

const bodySchema = z.looseObject({
  messages: z.array(messageSchema).min(1).max(LIMITS.maxMessages),
  modelId: z.string().optional(),
});

export type ChatRequest = {
  messages: UIMessage[];
  modelId: string;
};

export type ParseResult = { ok: true; value: ChatRequest } | { ok: false; error: string };

function textLength(message: z.infer<typeof messageSchema>): number {
  return message.parts.reduce(
    (sum, part) => sum + (typeof part.text === 'string' ? part.text.length : 0),
    0,
  );
}

/**
 * Validates an untrusted request body. Clients can't send system messages
 * (the server owns the system prompt), oversized messages, or unknown models.
 */
export function parseChatRequest(body: unknown): ParseResult {
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid request body.' };
  }

  const { messages, modelId } = parsed.data;

  if (messages.some((m) => m.role === 'system')) {
    return { ok: false, error: 'System messages are not accepted from clients.' };
  }
  if (messages.some((m) => textLength(m) > LIMITS.maxCharsPerMessage)) {
    return { ok: false, error: `Messages are limited to ${LIMITS.maxCharsPerMessage} characters.` };
  }
  if (modelId !== undefined && !isSupportedModel(modelId)) {
    return { ok: false, error: 'Unsupported model.' };
  }

  return {
    ok: true,
    value: { messages: messages as unknown as UIMessage[], modelId: modelId ?? DEFAULT_MODEL_ID },
  };
}
