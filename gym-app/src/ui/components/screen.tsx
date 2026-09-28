import type { ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "@/ui/theme";

/** Contenedor de pantalla con el fondo del tema y el margen lateral estándar. */
export function Screen({ children }: { children: ReactNode }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg }}>
      {children}
    </View>
  );
}
