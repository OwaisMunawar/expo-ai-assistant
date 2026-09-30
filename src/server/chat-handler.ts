import { convertToModelMessages, streamText, type LanguageModel } from 'ai';

import { parseChatRequest } from '@/server/chat-request';
import { LIMITS } from '@/shared/limits';
import { createDemoModel, demoReply } from '@/server/demo-model';

export const SYSTEM_PROMPT = [
  'You are a concise, friendly assistant inside a mobile app.',
  'Answers are read on a phone: prefer short paragraphs and bullet lists,',
  'use fenced code blocks for code, and avoid tables wider than three columns.',
].join(' ');

type Env = Record<string, string | undefined>;

export function hasGatewayKey(env: Env): boolean {
  return Boolean(env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN);
}

/**
 * Framework-agnostic handler so it can be unit-tested without Expo's server
 * runtime. With a gateway key, the model ID (`provider/model`) is routed by
 * the AI Gateway; without one, a demo model streams a canned reply.
 */
export async function handleChat(req: Request, env: Env = process.env): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Body must be JSON.' }, { status: 400 });
  }

  const parsed = parseChatRequest(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { messages, modelId } = parsed.value;
  const model: LanguageModel = hasGatewayKey(env) ? modelId : createDemoModel(demoReply(modelId));

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: LIMITS.maxOutputTokens,
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    headers: {
      // Keeps proxies from buffering the stream on native clients.
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
    onError: () => 'The model could not answer right now. Please try again.',
  });
}
