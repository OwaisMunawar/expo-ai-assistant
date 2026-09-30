import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { apiUrl } from '@/features/chat/lib/api-url';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { experienceUrl: undefined, expoConfig: {} },
}));

const constants = Constants as unknown as {
  experienceUrl?: string;
  expoConfig: { hostUri?: string };
};

describe('apiUrl', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    constants.experienceUrl = undefined;
    constants.expoConfig = {};
    Platform.OS = originalOS;
  });

  it('prefers the configured base URL and trims a trailing slash', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com/';
    expect(apiUrl('/api/chat')).toBe('https://api.example.com/api/chat');
  });

  it('uses relative paths on web', () => {
    Platform.OS = 'web';
    expect(apiUrl('api/chat')).toBe('/api/chat');
  });

  it('uses the Expo Go experience URL in development', () => {
    Platform.OS = 'ios';
    constants.experienceUrl = 'exp://192.168.1.5:8081';
    expect(apiUrl('/api/chat')).toBe('http://192.168.1.5:8081/api/chat');
  });

  it('uses the bundler host in development builds', () => {
    Platform.OS = 'ios';
    constants.expoConfig = { hostUri: 'localhost:8091' };
    expect(apiUrl('/api/chat')).toBe('http://localhost:8091/api/chat');
  });

  it('throws when no server can be resolved', () => {
    Platform.OS = 'android';
    expect(() => apiUrl('/api/chat')).toThrow('EXPO_PUBLIC_API_BASE_URL');
  });
});
