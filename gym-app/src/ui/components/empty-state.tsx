import type { ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "@/ui/theme";

import { AppText } from "./app-text";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body: string;
  /** Etiqueta visible para marcar funciones que todavía no existen (CLAUDE.md, sección 19). */
  badge?: string;
}

export function EmptyState({ icon, title, body, badge }: EmptyStateProps) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}
      testID="empty-state"
    >
      {icon}
      <AppText variant="title" accessibilityRole="header" style={{ textAlign: "center" }}>
        {title}
      </AppText>
      <AppText tone="secondary" style={{ textAlign: "center", maxWidth: 320 }}>
        {body}
      </AppText>
      {badge ? (
        <View
          style={{
            marginTop: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <AppText variant="caption" tone="secondary">
            {badge}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
