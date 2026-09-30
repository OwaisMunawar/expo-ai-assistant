import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/ui/icon';
import { Spacing } from '@/theme';
import { useTheme } from '@/theme/use-theme';
import { getModel, MODELS } from '@/shared/models';

type Props = { value: string; onChange: (id: string) => void };

export function ModelPicker({ value, onChange }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const current = getModel(value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel={`Model: ${current.label}. Change model`}
        style={styles.trigger}>
        <Text style={[styles.triggerText, { color: theme.text }]}>{current.label}</Text>
        <Icon name="chevronDown" size={12} color={theme.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}>
            <Text style={[styles.sheetTitle, { color: theme.textSecondary }]}>Model</Text>
            {MODELS.map((m) => {
              const selected = m.id === value;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    (pressed || selected) && { backgroundColor: theme.backgroundElement },
                  ]}>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: theme.text }]}>{m.label}</Text>
                    <Text style={[styles.optionMeta, { color: theme.textSecondary }]}>
                      {m.provider} · {m.description}
                    </Text>
                  </View>
                  {selected ? <Icon name="check" size={16} color={theme.accent} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  triggerText: { fontSize: 16, fontWeight: 600 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  sheetTitle: { fontSize: 13, fontWeight: 600, padding: Spacing.two, textTransform: 'uppercase' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three - 4,
    borderRadius: 12,
  },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 16, fontWeight: 600 },
  optionMeta: { fontSize: 13 },
});
