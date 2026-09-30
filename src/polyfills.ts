import structuredClone from '@ungap/structured-clone';
import { Platform } from 'react-native';

// The AI SDK streams through TextDecoderStream and uses structuredClone,
// neither of which Hermes provides yet.
if (Platform.OS !== 'web') {
  const setup = async () => {
    const { polyfillGlobal } = await import(
      // @ts-expect-error: internal module without type declarations
      'react-native/Libraries/Utilities/PolyfillFunctions'
    );
    const { TextEncoderStream, TextDecoderStream } =
      await import('@stardazed/streams-text-encoding');

    if (!('structuredClone' in globalThis)) {
      polyfillGlobal('structuredClone', () => structuredClone);
    }
    polyfillGlobal('TextEncoderStream', () => TextEncoderStream);
    polyfillGlobal('TextDecoderStream', () => TextDecoderStream);
  };

  setup();
}

export {};
