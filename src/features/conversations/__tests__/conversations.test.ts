import type { UIMessage } from 'ai';

import {
  deriveTitle,
  newConversation,
  preview,
  relativeTime,
  sortByRecent,
  UNTITLED,
} from '@/features/conversations/conversations';

const msg = (role: 'user' | 'assistant', text: string): UIMessage => ({
  id: Math.random().toString(36),
  role,
  parts: [{ type: 'text', text }],
});

describe('deriveTitle', () => {
  it('uses the first line of the first user message', () => {
    expect(deriveTitle([msg('user', 'Plan my trip\nto Lisbon'), msg('assistant', 'Sure')])).toBe(
      'Plan my trip',
    );
  });

  it('falls back when there is no user text', () => {
    expect(deriveTitle([])).toBe(UNTITLED);
    expect(deriveTitle([msg('user', '   ')])).toBe(UNTITLED);
  });

  it('truncates long titles with an ellipsis', () => {
    const title = deriveTitle([msg('user', 'x'.repeat(100))], 20);
    expect(title).toHaveLength(20);
    expect(title.endsWith('…')).toBe(true);
  });
});

describe('preview', () => {
  it('replaces code blocks with a placeholder', () => {
    const c = {
      ...newConversation('1'),
      messages: [msg('assistant', 'Run:\n```sh\nnpm test\n```')],
    };
    expect(preview(c)).toBe('Run: [code]');
  });

  it('strips markdown markers', () => {
    const c = {
      ...newConversation('1'),
      messages: [msg('assistant', '**Bold** and `code` # done')],
    };
    expect(preview(c)).toBe('Bold and code done');
  });

  it('handles empty conversations', () => {
    expect(preview(newConversation('1'))).toBe('No messages yet');
  });
});

describe('relativeTime', () => {
  const now = Date.UTC(2026, 8, 30, 12);
  it.each([
    [now - 10_000, 'now'],
    [now - 5 * 60_000, '5m'],
    [now - 3 * 3_600_000, '3h'],
    [now - 2 * 86_400_000, '2d'],
  ])('formats %p as %p', (then, expected) => {
    expect(relativeTime(then, now)).toBe(expected);
  });
});

describe('sortByRecent', () => {
  it('orders by last update without mutating the input', () => {
    const a = { ...newConversation('a'), updatedAt: 1 };
    const b = { ...newConversation('b'), updatedAt: 2 };
    const input = [a, b];
    expect(sortByRecent(input).map((c) => c.id)).toEqual(['b', 'a']);
    expect(input[0]).toBe(a);
  });
});

it('formats dates older than a week as a calendar date', () => {
  const now = Date.UTC(2026, 8, 30, 12);
  expect(relativeTime(now - 10 * 86_400_000, now)).not.toMatch(/^\d+[mhd]$/);
});
