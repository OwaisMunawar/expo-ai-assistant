import { simulateReadableStream } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';

import { getModel } from '@/shared/models';

/**
 * Demo mode: when no AI Gateway key is configured the server streams a canned
 * reply through the real AI SDK pipeline, so the app runs end-to-end with zero
 * setup. It exercises the same streaming, UI and persistence code as a real model.
 */
export function demoReply(modelId: string): string {
  const model = getModel(modelId);
  return [
    `**Demo mode**: no \`AI_GATEWAY_API_KEY\` is set, so this reply is simulated. It streams through the same pipeline a real answer from **${model.label}** would use.`,
    '',
    'What you are seeing:',
    '',
    '- Tokens streamed from an Expo API route with the AI SDK',
    '- Markdown with **bold**, _italic_ and `inline code`',
    '- Code blocks with a copy button',
    '- Conversations saved on the device',
    '',
    'To get real answers:',
    '',
    '```bash',
    'cp .env.example .env.local',
    '# add AI_GATEWAY_API_KEY, then restart',
    'npx expo start',
    '```',
  ].join('\n');
}

/** Splits text into word-sized chunks so the demo streams like a real model. */
export function toChunks(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

export function createDemoModel(reply: string, chunkDelayMs = 18) {
  const chunks = toChunks(reply);
  return new MockLanguageModelV4({
    provider: 'demo',
    modelId: 'demo',
    doStream: async () => ({
      stream: simulateReadableStream({
        initialDelayInMs: 150,
        chunkDelayInMs: chunkDelayMs,
        chunks: [
          { type: 'text-start' as const, id: 't1' },
          ...chunks.map((delta) => ({ type: 'text-delta' as const, id: 't1', delta })),
          { type: 'text-end' as const, id: 't1' },
          {
            type: 'finish' as const,
            finishReason: { unified: 'stop' as const, raw: undefined },
            usage: {
              inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
              outputTokens: { total: chunks.length, text: chunks.length, reasoning: 0 },
            },
          },
        ],
      }),
    }),
  });
}
