import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/ui/icon';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/use-theme';
import { LIMITS } from '@/shared/limits';

type Props = {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
};

export function Composer({ busy, onSend, onStop }: Props) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const canSend = value.trim().length > 0 && !busy;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Message"
        placeholderTextColor={theme.textSecondary}
        multiline
        maxLength={LIMITS.maxCharsPerMessage}
        style={[styles.input, { color: theme.text }]}
        onSubmitEditing={submit}
        submitBehavior="blurAndSubmit"
        accessibilityLabel="Message input"
      />
      <Pressable
        onPress={busy ? onStop : submit}
        disabled={!busy && !canSend}
        accessibilityLabel={busy ? 'Stop generating' : 'Send message'}
        style={[
          styles.button,
          { backgroundColor: busy || canSend ? theme.accent : theme.backgroundSelected },
        ]}>
        <Icon name={busy ? 'stop' : 'send'} size={16} color={theme.onAccent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.three,
    paddingRight: 6,
    paddingVertical: 6,
    gap: Spacing.two,
  },
  input: { flex: 1, fontSize: 16, maxHeight: 140, paddingTop: 8, paddingBottom: 8 },
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
