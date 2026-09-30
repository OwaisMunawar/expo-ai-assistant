import { parseInline, splitBlocks } from '@/features/chat/lib/markdown';

describe('splitBlocks', () => {
  it('returns a single text block for plain text', () => {
    expect(splitBlocks('Hello\nworld')).toEqual([{ type: 'text', text: 'Hello\nworld' }]);
  });

  it('extracts fenced code with its language', () => {
    expect(splitBlocks('Try this:\n```ts\nconst a = 1;\n```\nDone.')).toEqual([
      { type: 'text', text: 'Try this:' },
      { type: 'code', lang: 'ts', code: 'const a = 1;' },
      { type: 'text', text: 'Done.' },
    ]);
  });

  it('keeps an unclosed fence as code while streaming', () => {
    expect(splitBlocks('```bash\nnpm i')).toEqual([{ type: 'code', lang: 'bash', code: 'npm i' }]);
  });

  it('handles a fence with no language', () => {
    expect(splitBlocks('```\nx\n```')).toEqual([{ type: 'code', lang: '', code: 'x' }]);
  });

  it('preserves blank lines inside code', () => {
    expect(splitBlocks('```\na\n\nb\n```')[0]).toEqual({ type: 'code', lang: '', code: 'a\n\nb' });
  });

  it('normalises CRLF line endings', () => {
    expect(splitBlocks('a\r\n```\r\nb\r\n```')).toHaveLength(2);
  });

  it('drops whitespace-only text between blocks', () => {
    expect(splitBlocks('```\na\n```\n\n\n```\nb\n```')).toHaveLength(2);
  });
});

describe('parseInline', () => {
  it('parses bold, italic and code spans', () => {
    expect(parseInline('a **b** _c_ `d`')).toEqual([
      { text: 'a ' },
      { text: 'b', bold: true },
      { text: ' ' },
      { text: 'c', italic: true },
      { text: ' ' },
      { text: 'd', code: true },
    ]);
  });

  it('leaves an unfinished bold marker as plain text', () => {
    expect(parseInline('a **b')).toEqual([{ text: 'a **b' }]);
  });

  it('does not treat snake_case as italic', () => {
    expect(parseInline('use my_var_name here')).toEqual([{ text: 'use my_var_name here' }]);
  });

  it('parses italic at the start of a line and before punctuation', () => {
    expect(parseInline('_note_: done')).toEqual([
      { text: 'note', italic: true },
      { text: ': done' },
    ]);
  });
});
