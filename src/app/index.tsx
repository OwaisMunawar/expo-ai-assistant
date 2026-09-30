import { generateId } from 'ai';
import { router, Stack } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PromptGrid } from '@/features/chat/components/prompt-grid';
import { preview, relativeTime, type Conversation } from '@/features/conversations/conversations';
import { useConversations } from '@/features/conversations/store';
import { getModel } from '@/shared/models';
import { MaxContentWidth, Spacing } from '@/theme';
import { useTheme } from '@/theme/use-theme';
import { Icon } from '@/ui/icon';

function startChat(starter?: string) {
  const id = generateId();
  router.push({ pathname: '/chat/[id]', params: starter ? { id, starter } : { id } });
}

export default function ChatsScreen() {
  const theme = useTheme();
  const { conversations, isLoaded, remove } = useConversations();

  const confirmDelete = (c: Conversation) => {
    if (Platform.OS === 'web') {
      remove(c.id);
      return;
    }
    Alert.alert('Delete chat?', c.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(c.id) },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => startChat()} hitSlop={10} accessibilityLabel="New chat">
              <Icon name="compose" size={20} color={theme.accent} />
            </Pressable>
          ),
        }}
      />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.content}
        data={conversations}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          isLoaded && conversations.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
                <Icon name="sparkles" size={26} color={theme.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Ask anything</Text>
              <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
                Streaming answers from Claude, GPT or Gemini. Pick a starter or write your own.
              </Text>
              <PromptGrid onPick={(p) => startChat(p.id)} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
            onLongPress={() => confirmDelete(item)}
            accessibilityHint="Long press to delete"
            style={({ pressed }) => [
              styles.row,
              { borderColor: theme.border },
              pressed && { backgroundColor: theme.backgroundElement },
            ]}>
            <View style={styles.rowTop}>
              <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.meta, { color: theme.textSecondary }]}>
                {relativeTime(item.updatedAt)}
              </Text>
            </View>
            <Text numberOfLines={2} style={[styles.preview, { color: theme.textSecondary }]}>
              {preview(item)}
            </Text>
            <Text style={[styles.model, { color: theme.textSecondary }]}>
              {getModel(item.modelId).label}
            </Text>
          </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  empty: { alignItems: 'center', paddingTop: Spacing.five, gap: Spacing.two },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 24, fontWeight: 700, marginTop: Spacing.two },
  emptyBody: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: Spacing.four,
  },
  row: {
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 3,
    borderRadius: 10,
  },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  title: { flex: 1, fontSize: 16, fontWeight: 600 },
  meta: { fontSize: 13 },
  preview: { fontSize: 14, lineHeight: 19 },
  model: { fontSize: 12, marginTop: 2 },
});
