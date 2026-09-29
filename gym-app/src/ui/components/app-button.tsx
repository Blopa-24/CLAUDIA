import { Pressable, type PressableProps } from "react-native";

import { useTheme } from "@/ui/theme";

import { AppText } from "./app-text";

export type AppButtonVariant = "primary" | "secondary" | "danger";

export interface AppButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  /**
   * `primary` para la acción principal de la pantalla; `secondary` para el resto; `danger` para
   * lo que borra o descarta (siempre después de una confirmación).
   */
  variant?: AppButtonVariant;
  /** `large` (56 pt) para la acción que se repite con el pulgar, como completar una serie. */
  size?: "regular" | "large";
}

/** Botón del design system: zona táctil de 48 pt como mínimo y el acento como relleno. */
export function AppButton({
  label,
  variant = "primary",
  size = "regular",
  disabled,
  ...rest
}: AppButtonProps) {
  const { colors, spacing, radius, touch } = useTheme();
  const fill = { primary: colors.primary, secondary: "transparent", danger: colors.danger }[
    variant
  ];
  const text = { primary: colors.onPrimary, secondary: colors.text, danger: colors.onDanger }[
    variant
  ];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled ?? false }}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: size === "large" ? touch.primary : touch.min,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: fill,
        borderWidth: variant === "secondary" ? 1 : 0,
        borderColor: colors.border,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
      })}
      {...rest}
    >
      <AppText style={{ color: text, fontWeight: "600" }}>{label}</AppText>
    </Pressable>
  );
}
