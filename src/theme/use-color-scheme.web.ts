import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const noopSubscribe = () => () => {};

/**
 * Server rendering has no color scheme, so the first client render must match
 * the server's 'light' output before switching to the real preference.
 */
export function useColorScheme() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const scheme = useRNColorScheme();
  return hydrated ? scheme : 'light';
}
