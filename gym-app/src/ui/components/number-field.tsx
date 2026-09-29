import { TextInput, type TextInputProps, View } from "react-native";

import { useTheme } from "@/ui/theme";

import { AppText } from "./app-text";

export interface NumberFieldProps extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "keyboardType" | "style"
> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Decimales para el peso; enteros para reps, RIR y segundos. */
  decimal?: boolean;
  error?: string | null;
}

/**
 * Campo numérico para datos de gimnasio (skill mobile-ui, "FORMS"): número grande, teclado
 * numérico y el error escrito debajo, no solo en color.
 */
export function NumberField({
  label,
  value,
  onChangeText,
  decimal = false,
  error,
  ...rest
}: NumberFieldProps) {
  const { colors, spacing, radius, touch, fontFamily, fontSize } = useTheme();
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <AppText variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
        accessibilityHint={error ?? undefined}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
        selectTextOnFocus
        selectionColor={colors.primary}
        placeholderTextColor={colors.textMuted}
        style={{
          minHeight: touch.primary,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          borderWidth: error ? 2 : 1,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.surface,
          color: colors.text,
          fontFamily: fontFamily.numeric,
          fontSize: fontSize.heading,
          textAlign: "center",
        }}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" style={{ color: colors.danger }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
