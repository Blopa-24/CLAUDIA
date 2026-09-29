import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

import { usePreferences } from "@/state/preferences";
import { AppText } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import { AccentPicker } from "./accent-picker";
import { RestSettings } from "./rest-settings";
import { WeightUnitPicker } from "./weight-unit-picker";

export function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const accent = usePreferences((state) => state.accent);
  const setAccent = usePreferences((state) => state.setAccent);
  const weightUnit = usePreferences((state) => state.weightUnit);
  const setWeightUnit = usePreferences((state) => state.setWeightUnit);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
    >
      <View style={{ gap: spacing.md }}>
        <AppText variant="title" accessibilityRole="header">
          {t("profile.appearance")}
        </AppText>
        <View style={{ gap: spacing.xs }}>
          <AppText>{t("profile.accent")}</AppText>
          <AppText variant="small" tone="secondary">
            {t("profile.accentHint")}
          </AppText>
        </View>
        <AccentPicker value={accent} onChange={setAccent} />
      </View>
      <View style={{ gap: spacing.md }}>
        <AppText variant="title" accessibilityRole="header">
          {t("profile.units")}
        </AppText>
        <View style={{ gap: spacing.xs }}>
          <AppText>{t("profile.weightUnit")}</AppText>
          <AppText variant="small" tone="secondary">
            {t("profile.weightUnitHint")}
          </AppText>
        </View>
        <WeightUnitPicker value={weightUnit} onChange={setWeightUnit} />
      </View>
      <View style={{ gap: spacing.md }}>
        <AppText variant="title" accessibilityRole="header">
          {t("profile.rest")}
        </AppText>
        <RestSettings />
      </View>
      <AppText variant="small" tone="muted">
        {t("profile.moreSoon")}
      </AppText>
    </ScrollView>
  );
}
