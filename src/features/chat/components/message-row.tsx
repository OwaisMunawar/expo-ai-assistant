import type { UIMessage } from 'ai';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { memo, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/ui/icon';
import { MarkdownText } from '@/features/chat/components/markdown-text';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/use-theme';
import { messageText } from '@/features/conversations/conversations';

type Props = {
  message: UIMessage;
  isStreaming: boolean;
  canRetry: boolean;
  onRetry: () => void;
};

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.action,
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      <Icon name={icon} size={15} color={theme.textSecondary} />
    </Pressable>
  );
}

function MessageRowBase({ message, isStreaming, canRetry, onRetry }: Props) {
  const theme = useTheme();
  const text = messageText(message);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => void Speech.stop(), []);

  if (message.role === 'user') {
    return (
      <View style={[styles.userBubble, { backgroundColor: theme.userBubble }]}>
        <MarkdownText text={text} color={theme.onUserBubble} />
      </View>
    );
  }

  const copy = async () => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleSpeech = () => {
    if (speaking) {
      void Speech.stop();
      setSpeaking(false);
      return;
    }
    // Speak the prose only; code read aloud is noise.
    const spoken = text.replace(/```[\s\S]*?(```|$)/g, ' ').replace(/[*_`#]/g, '');
    setSpeaking(true);
    Speech.speak(spoken, { onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false) });
  };

  return (
    <View style={styles.assistant}>
      {text ? (
        <MarkdownText text={text} />
      ) : (
        <Text style={[styles.thinking, { color: theme.textSecondary }]}>Thinking…</Text>
      )}
      {!isStreaming && text ? (
        <View style={styles.actions}>
          <Action icon={copied ? 'check' : 'copy'} label="Copy reply" onPress={copy} />
          <Action
            icon={speaking ? 'speaking' : 'speak'}
            label="Read aloud"
            onPress={toggleSpeech}
          />
          {canRetry ? <Action icon="retry" label="Regenerate" onPress={onRetry} /> : null}
        </View>
      ) : null}
    </View>
  );
}

export const MessageRow = memo(MessageRowBase);

const styles = StyleSheet.create({
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: Spacing.three - 2,
    paddingVertical: Spacing.two + 2,
  },
  assistant: { gap: Spacing.two, paddingRight: Spacing.two },
  thinking: { fontSize: 15, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: Spacing.one, marginLeft: -6 },
  action: { padding: 6, borderRadius: 8 },
});
