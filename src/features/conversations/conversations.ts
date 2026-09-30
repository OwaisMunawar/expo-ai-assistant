import type { UIMessage } from 'ai';

import { DEFAULT_MODEL_ID } from '@/shared/models';

export type Conversation = {
  id: string;
  title: string;
  modelId: string;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
};

export const UNTITLED = 'New chat';

export function newConversation(id: string, now = Date.now()): Conversation {
  return {
    id,
    title: UNTITLED,
    modelId: DEFAULT_MODEL_ID,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function messageText(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('')
    .trim();
}

/** First line of the first user message, trimmed to fit a list row. */
export function deriveTitle(messages: UIMessage[], max = 48): string {
  const first = messages.find((m) => m.role === 'user');
  const line = first ? (messageText(first).split('\n')[0] ?? '').replace(/\s+/g, ' ').trim() : '';
  if (!line) return UNTITLED;
  return line.length > max ? `${line.slice(0, max - 1).trimEnd()}…` : line;
}

/** Plain-text preview of the latest message for list rows. */
export function preview(conversation: Conversation, max = 80): string {
  const last = conversation.messages.at(-1);
  if (!last) return 'No messages yet';
  const text = messageText(last)
    .replace(/```[\s\S]*?(```|$)/g, '[code]')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function sortByRecent(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function relativeTime(then: number, now = Date.now()): string {
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
