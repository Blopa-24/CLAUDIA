import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

/** Íconos de la app: SF Symbols en iPhone, Material Symbols en Android y en web. */
export const icons = {
  home: { ios: "house", android: "home", web: "home" },
  history: { ios: "clock.arrow.circlepath", android: "history", web: "history" },
  exercises: { ios: "dumbbell", android: "fitness_center", web: "fitness_center" },
  progress: { ios: "chart.line.uptrend.xyaxis", android: "trending_up", web: "trending_up" },
  profile: { ios: "person.crop.circle", android: "account_circle", web: "account_circle" },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  color,
  size = 24,
}: {
  name: IconName;
  color: ColorValue;
  size?: number;
}) {
  return <SymbolView name={icons[name]} tintColor={color} size={size} />;
}
