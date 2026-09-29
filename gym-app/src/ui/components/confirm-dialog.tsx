import { Modal, Pressable, View } from "react-native";

import { useTheme } from "@/ui/theme";

import { AppButton, type AppButtonVariant } from "./app-button";
import { AppText } from "./app-text";

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
}

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  actions: DialogAction[];
  /** Tocar fuera o el botón atrás de Android: equivale a cancelar. */
  onDismiss: () => void;
}

/**
 * Confirmación dentro de la app (sección 9 del CLAUDE.md: lo destructivo se confirma). Se usa en
 * lugar de Alert porque Alert no funciona en la versión web y no sigue el tema.
 */
export function ConfirmDialog({ visible, title, body, actions, onDismiss }: ConfirmDialogProps) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        accessibilityLabel={title}
        onPress={onDismiss}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          padding: spacing.xl,
        }}
      >
        {/* Tocar la tarjeta no la cierra. */}
        <Pressable
          accessibilityRole="alert"
          onPress={() => undefined}
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.md,
            padding: spacing.xl,
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <AppText tone="secondary">{body}</AppText>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {actions.map((action) => (
              <AppButton
                key={action.label}
                label={action.label}
                variant={action.variant ?? "secondary"}
                onPress={action.onPress}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
