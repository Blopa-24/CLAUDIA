import { Pressable, type PressableProps } from "react-native";

import { useTheme } from "@/ui/theme";

import { AppText } from "./app-text";

export interface AppButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  /** `primary` para la acción principal de la pantalla; `secondary` para el resto. */
  variant?: "primary" | "secondary";
}

/** Botón del design system: zona táctil de 48 pt como mínimo y el acento como relleno. */
export function AppButton({ label, variant = "primary", ...rest }: AppButtonProps) {
  const { colors, spacing, radius, touch } = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: touch.min,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: primary ? colors.primary : "transparent",
        borderWidth: primary ? 0 : 1,
        borderColor: colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
      {...rest}
    >
      <AppText style={{ color: primary ? colors.onPrimary : colors.text, fontWeight: "600" }}>
        {label}
      </AppText>
    </Pressable>
  );
}
