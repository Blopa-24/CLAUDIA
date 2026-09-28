import { useColorScheme } from "react-native";

import { usePreferences } from "@/state/preferences";

import { buildColors, type ColorScheme, type ColorTokens } from "./colors";
import { fontFamily, fontSize, radius, spacing, touch } from "./tokens";

export interface Theme {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  touch: typeof touch;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
}

/** Resuelve el esquema: si el sistema no define uno, GymSuper usa el oscuro (modo oscuro primero). */
export function resolveScheme(system: string | null | undefined): ColorScheme {
  return system === "light" ? "light" : "dark";
}

export function useTheme(): Theme {
  const scheme = resolveScheme(useColorScheme());
  const accent = usePreferences((state) => state.accent);
  return {
    scheme,
    colors: buildColors(scheme, accent),
    spacing,
    radius,
    touch,
    fontFamily,
    fontSize,
  };
}
