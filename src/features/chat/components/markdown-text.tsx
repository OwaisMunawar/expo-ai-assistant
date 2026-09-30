import * as Clipboard from 'expo-clipboard';
import { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/ui/icon';
import { Fonts, Spacing } from '@/theme';
import { useTheme } from '@/theme/use-theme';
import { parseInline, splitBlocks } from '@/features/chat/lib/markdown';

type Props = { text: string; color?: string };

function InlineText({ line, color }: { line: string; color: string }) {
  const theme = useTheme();
  return (
    <>
      {parseInline(line).map((span, i) => (
        <Text
          key={i}
          style={[
            { color },
            span.bold && styles.bold,
            span.italic && styles.italic,
            span.code && [styles.inlineCode, { backgroundColor: theme.codeBackground }],
          ]}>
          {span.text}
        </Text>
      ))}
    </>
  );
}

function Paragraph({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.paragraph}>
      {text.split('\n').map((raw, i) => {
        const heading = raw.match(/^#{1,4}\s+(.*)$/);
        const bullet = raw.match(/^\s*[-*]\s+(.*)$/);
        const numbered = raw.match(/^\s*(\d+)[.)]\s+(.*)$/);

        if (heading) {
          return (
            <Text key={i} style={[styles.body, styles.heading, { color }]}>
              <InlineText line={heading[1] ?? ''} color={color} />
            </Text>
          );
        }
        if (bullet || numbered) {
          return (
            <View key={i} style={styles.listRow}>
              <Text style={[styles.body, styles.marker, { color }]}>
                {numbered ? `${numbered[1]}.` : '•'}
              </Text>
              <Text style={[styles.body, styles.listText, { color }]}>
                <InlineText line={(numbered ? numbered[2] : bullet?.[1]) ?? ''} color={color} />
              </Text>
            </View>
          );
        }
        if (!raw.trim()) return <View key={i} style={styles.gap} />;
        return (
          <Text key={i} style={[styles.body, { color }]}>
            <InlineText line={raw} color={color} />
          </Text>
        );
      })}
    </View>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View
      style={[styles.code, { backgroundColor: theme.codeBackground, borderColor: theme.border }]}>
      <View style={[styles.codeHeader, { borderColor: theme.border }]}>
        <Text style={[styles.codeLang, { color: theme.textSecondary }]}>{lang || 'code'}</Text>
        <Pressable onPress={copy} hitSlop={8} accessibilityLabel="Copy code">
          <Icon name={copied ? 'check' : 'copy'} size={15} color={theme.textSecondary} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text selectable style={[styles.codeText, { color: theme.text }]}>
          {code}
        </Text>
      </ScrollView>
    </View>
  );
}

function MarkdownTextBase({ text, color }: Props) {
  const theme = useTheme();
  const textColor = color ?? theme.text;
  return (
    <View style={styles.root}>
      {splitBlocks(text).map((block, i) =>
        block.type === 'code' ? (
          <CodeBlock key={i} code={block.code} lang={block.lang} />
        ) : (
          <Paragraph key={i} text={block.text} color={textColor} />
        ),
      )}
    </View>
  );
}

export const MarkdownText = memo(MarkdownTextBase);

const styles = StyleSheet.create({
  root: { gap: Spacing.three - 4 },
  paragraph: { gap: 2 },
  body: { fontSize: 16, lineHeight: 23 },
  heading: { fontWeight: 700, fontSize: 17, marginTop: 2 },
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  inlineCode: { fontFamily: Fonts.mono, fontSize: 14 },
  listRow: { flexDirection: 'row', gap: Spacing.two, paddingRight: Spacing.two },
  marker: { minWidth: 14 },
  listText: { flex: 1 },
  gap: { height: 6 },
  code: { borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three - 4,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  codeLang: { fontSize: 12, fontWeight: 600, textTransform: 'lowercase' },
  codeText: { fontFamily: Fonts.mono, fontSize: 13, lineHeight: 19, padding: Spacing.three - 4 },
});
