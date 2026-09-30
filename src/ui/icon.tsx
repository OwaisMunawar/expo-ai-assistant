import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import type { ColorValue } from 'react-native';

// SF Symbols on iOS, Material Symbols on Android and web.
const ICONS = {
  send: ['arrow.up', 'arrow_upward'],
  stop: ['stop.fill', 'stop'],
  copy: ['doc.on.doc', 'content_copy'],
  check: ['checkmark', 'check'],
  speak: ['speaker.wave.2', 'volume_up'],
  speaking: ['speaker.slash', 'volume_off'],
  retry: ['arrow.clockwise', 'refresh'],
  compose: ['square.and.pencil', 'edit_square'],
  trash: ['trash', 'delete'],
  chevronDown: ['chevron.down', 'expand_more'],
  sparkles: ['sparkles', 'auto_awesome'],
  chat: ['bubble.left.and.bubble.right', 'forum'],
} as const satisfies Record<string, readonly [SFSymbol, AndroidSymbol]>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color: ColorValue;
}) {
  const [ios, material] = ICONS[name];
  return (
    <SymbolView
      name={{ ios, android: material, web: material }}
      size={size}
      tintColor={color}
      weight="semibold"
    />
  );
}
