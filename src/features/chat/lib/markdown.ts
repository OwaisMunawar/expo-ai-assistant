/**
 * A deliberately small markdown model for chat bubbles: fenced code blocks,
 * paragraphs, bullet lines, and inline **bold**, _italic_ and `code`.
 * It tolerates an unclosed fence, which is the normal state mid-stream.
 */
export type Block = { type: 'code'; lang: string; code: string } | { type: 'text'; text: string };

export type Inline = { text: string; bold?: boolean; italic?: boolean; code?: boolean };

const FENCE = /^```\s*([\w+-]*)\s*$/;

export function splitBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let text: string[] = [];
  let code: string[] | null = null;
  let lang = '';

  const flushText = () => {
    const joined = text.join('\n').trim();
    if (joined) blocks.push({ type: 'text', text: joined });
    text = [];
  };

  for (const line of lines) {
    const fence = line.trim().match(FENCE);
    if (code === null && fence) {
      flushText();
      code = [];
      lang = fence[1] ?? '';
    } else if (code !== null && line.trim() === '```') {
      blocks.push({ type: 'code', lang, code: code.join('\n') });
      code = null;
      lang = '';
    } else if (code !== null) {
      code.push(line);
    } else {
      text.push(line);
    }
  }

  if (code !== null) blocks.push({ type: 'code', lang, code: code.join('\n') });
  flushText();
  return blocks;
}

// Italic underscores must sit on a word boundary so snake_case stays intact.
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|(?:^|(?<=[\s(]))_[^_\s][^_]*_(?=[\s.,;:!?)]|$))/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > last) out.push({ text: text.slice(last, index) });
    if (token.startsWith('**')) out.push({ text: token.slice(2, -2), bold: true });
    else if (token.startsWith('`')) out.push({ text: token.slice(1, -1), code: true });
    else out.push({ text: token.slice(1, -1), italic: true });
    last = index + token.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
