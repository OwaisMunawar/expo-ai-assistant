import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Composer } from '@/features/chat/components/composer';
import { MessageRow } from '@/features/chat/components/message-row';
import { ModelPicker } from '@/features/chat/components/model-picker';
import { PromptGrid } from '@/features/chat/components/prompt-grid';
import { apiUrl } from '@/features/chat/lib/api-url';
import { newConversation, type Conversation } from '@/features/conversations/conversations';
import * as store from '@/features/conversations/store';
import { PROMPTS } from '@/shared/prompts';
import { MaxContentWidth, Spacing } from '@/theme';
import { useTheme } from '@/theme/use-theme';

export default function ChatRoute() {
  const { id, starter } = useLocalSearchParams<{ id: string; starter?: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    store.load().then(() => setConversation(store.get(id) ?? newConversation(id)));
  }, [id]);

  if (!conversation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <ChatScreen
      key={conversation.id}
      initial={conversation}
      prompt={PROMPTS.find((p) => p.id === starter)?.text}
    />
  );
}

function ChatScreen({ initial, prompt }: { initial: Conversation; prompt?: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [modelId, setModelId] = useState(initial.modelId);
  const list = useRef<FlatList<UIMessage>>(null);
  const sentPrompt = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: apiUrl('/api/chat'),
        fetch: expoFetch as unknown as typeof globalThis.fetch,
      }),
    [],
  );

  const save = (messages: UIMessage[], model = modelId) =>
    store.upsert({ ...initial, modelId: model, messages, updatedAt: Date.now() });

  const { messages, sendMessage, regenerate, stop, status, error, clearError } = useChat({
    id: initial.id,
    messages: initial.messages,
    transport,
    onFinish: ({ messages: finished }) => save(finished),
    onError: (e) => console.warn('chat error', e),
  });

  const busy = status === 'submitted' || status === 'streaming';
  const send = (text: string) => {
    clearError();
    void sendMessage({ text }, { body: { modelId } });
  };

  useEffect(() => {
    if (prompt && !sentPrompt.current && initial.messages.length === 0) {
      sentPrompt.current = true;
      send(prompt);
    }
    // Only for the prompt passed in when the chat was opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeModel = (next: string) => {
    setModelId(next);
    if (messages.length) save(messages, next);
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <Stack.Screen
        options={{ headerTitle: () => <ModelPicker value={modelId} onChange={changeModel} /> }}
      />

      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messages}
        keyboardDismissMode="interactive"
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>How can I help?</Text>
            <PromptGrid onPick={(p) => send(p.text)} />
          </View>
        }
        renderItem={({ item }) => (
          <MessageRow
            message={item}
            isStreaming={busy && item.id === messages.at(-1)?.id}
            canRetry={!busy && item.id === lastAssistant?.id}
            onRetry={() => void regenerate({ body: { modelId } })}
          />
        )}
        ListFooterComponent={
          <>
            {status === 'submitted' && messages.at(-1)?.role === 'user' ? (
              <Text style={[styles.thinking, { color: theme.textSecondary }]}>Thinking…</Text>
            ) : null}
            {error ? (
              <Text style={[styles.error, { color: theme.danger }]}>
                Something went wrong. Check your connection and try again.
              </Text>
            ) : null}
          </>
        }
      />

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}>
        <Composer busy={busy} onSend={send} onStop={stop} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messages: {
    padding: Spacing.three,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  empty: { flex: 1, justifyContent: 'flex-end', gap: Spacing.three, paddingBottom: Spacing.three },
  emptyTitle: { fontSize: 22, fontWeight: 700 },
  thinking: { fontSize: 15, fontStyle: 'italic' },
  error: { fontSize: 14 },
  composer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
