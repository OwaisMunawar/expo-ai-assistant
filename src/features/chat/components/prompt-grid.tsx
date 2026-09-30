import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/theme';
import { useTheme } from '@/theme/use-theme';
import { PROMPTS, type Prompt } from '@/shared/prompts';

export function PromptGrid({ onPick }: { onPick: (prompt: Prompt) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.grid}>
      {PROMPTS.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => onPick(p)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
          ]}>
          <Text style={[styles.title, { color: theme.text }]}>{p.title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{p.subtitle}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, width: '100%' },
  card: { flexBasis: '48%', flexGrow: 1, borderRadius: 14, padding: Spacing.three - 2, gap: 3 },
  title: { fontSize: 15, fontWeight: 600 },
  subtitle: { fontSize: 13, lineHeight: 17 },
});
