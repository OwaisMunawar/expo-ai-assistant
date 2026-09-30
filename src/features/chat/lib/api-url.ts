import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * The dev server origin. Expo Go exposes it as `experienceUrl`; development
 * builds only have `hostUri` (host:port of the running bundler).
 */
function devServerOrigin(): string | undefined {
  const experience = Constants.experienceUrl;
  if (experience?.startsWith('exp://')) return experience.replace('exp://', 'http://');
  const host = Constants.expoConfig?.hostUri;
  return host ? `http://${host}` : undefined;
}

/**
 * Resolves an API route to an absolute URL. Web can use relative paths; native
 * needs the dev server origin in development, and EXPO_PUBLIC_API_BASE_URL
 * (the deployed server) in production builds.
 */
export function apiUrl(path: string): string {
  const route = path.startsWith('/') ? path : `/${path}`;
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (base) return base.replace(/\/$/, '') + route;
  if (Platform.OS === 'web') return route;

  const origin = __DEV__ ? devServerOrigin() : undefined;
  if (origin) return origin + route;

  throw new Error('EXPO_PUBLIC_API_BASE_URL must be set for production builds.');
}
