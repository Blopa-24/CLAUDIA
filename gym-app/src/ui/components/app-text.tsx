import { Text, type TextProps } from "react-native";

import { useTheme } from "@/ui/theme";

type Variant = "display" | "heading" | "title" | "body" | "small" | "caption";
type Tone = "default" | "secondary" | "muted";

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
}

/** Texto del design system: tamaño y color salen del tema, nunca de valores sueltos. */
export function AppText({ variant = "body", tone = "default", style, ...rest }: AppTextProps) {
  const { colors, fontSize } = useTheme();
  const color = { default: colors.text, secondary: colors.textSecondary, muted: colors.textMuted }[
    tone
  ];
  const weight = variant === "display" || variant === "heading" || variant === "title";
  return (
    <Text
      style={[
        {
          color,
          fontSize: fontSize[variant],
          lineHeight: Math.round(fontSize[variant] * 1.35),
          fontWeight: weight ? "700" : "400",
        },
        style,
      ]}
      {...rest}
    />
  );
}
