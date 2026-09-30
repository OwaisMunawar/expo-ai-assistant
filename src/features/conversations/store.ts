import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import {
  deriveTitle,
  sortByRecent,
  type Conversation,
} from '@/features/conversations/conversations';

const KEY = 'conversations:v1';

/**
 * A tiny persisted store. Conversations live in memory for rendering and are
 * written to AsyncStorage on every change; the dataset is small (text only),
 * so a single key keeps reads atomic and migrations trivial.
 */
let state: Conversation[] = [];
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

async function persist() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save conversations', e);
  }
}

export function load(): Promise<void> {
  if (loaded) return Promise.resolve();
  loading ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      state = raw ? sortByRecent(JSON.parse(raw) as Conversation[]) : [];
    })
    .catch(() => {
      state = [];
    })
    .finally(() => {
      loaded = true;
      emit();
    });
  return loading;
}

export function getAll(): Conversation[] {
  return state;
}

export function get(id: string): Conversation | undefined {
  return state.find((c) => c.id === id);
}

export function upsert(conversation: Conversation) {
  const next = { ...conversation, title: deriveTitle(conversation.messages) };
  state = sortByRecent([next, ...state.filter((c) => c.id !== conversation.id)]);
  emit();
  void persist();
}

export function remove(id: string) {
  state = state.filter((c) => c.id !== id);
  emit();
  void persist();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useConversations() {
  useEffect(() => {
    void load();
  }, []);
  const list = useSyncExternalStore(subscribe, getAll, getAll);
  const isLoaded = useSyncExternalStore(
    subscribe,
    () => loaded,
    () => loaded,
  );
  return { conversations: list, isLoaded, remove };
}

/** Test-only reset. */
export function __reset() {
  state = [];
  loaded = false;
  loading = null;
}
