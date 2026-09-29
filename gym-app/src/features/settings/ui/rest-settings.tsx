import { useTranslation } from "react-i18next";
import { Pressable, Switch, View } from "react-native";

import { formatRestChoice, REST_PRESETS_S } from "@/domain/rest-timer";
import { usePreferences } from "@/state/preferences";
import { AppText } from "@/ui/components";
import { useTheme } from "@/ui/theme";

/** Perfil → Descanso: la duración de siempre y si empieza solo al completar una serie. */
export function RestSettings() {
  const { t } = useTranslation();
  const { colors, spacing, radius, touch, fontFamily } = useTheme();
  const restSeconds = usePreferences((s) => s.restSeconds);
  const setRestSeconds = usePreferences((s) => s.setRestSeconds);
  const autoStart = usePreferences((s) => s.restAutoStart);
  const setAutoStart = usePreferences((s) => s.setRestAutoStart);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <AppText>{t("profile.restDefault")}</AppText>
        <AppText variant="small" tone="secondary">
          {t("profile.restDefaultHint")}
        </AppText>
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t("profile.restDefault")}
        style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}
      >
        {REST_PRESETS_S.map((seconds) => {
          const selected = seconds === restSeconds;
          const time = formatRestChoice(seconds);
          return (
            <Pressable
              key={seconds}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={t("profile.restOption", { time })}
              onPress={() => setRestSeconds(seconds)}
              style={{
                minHeight: touch.min,
                minWidth: touch.min + spacing.lg,
                paddingHorizontal: spacing.md,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : colors.surface,
              }}
            >
              <AppText
                style={{
                  fontFamily: fontFamily.numericBold,
                  color: selected ? colors.onPrimary : colors.text,
                }}
              >
                {time}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText>{t("profile.restAutoStart")}</AppText>
          <AppText variant="small" tone="secondary">
            {t("profile.restAutoStartHint")}
          </AppText>
        </View>
        <Switch
          accessibilityLabel={t("profile.restAutoStart")}
          value={autoStart}
          onValueChange={setAutoStart}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
    </View>
  );
}
