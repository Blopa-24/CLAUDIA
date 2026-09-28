import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppText } from "@/ui/components";
import { ACCENTS, type AccentName, accents, useTheme } from "@/ui/theme";

export interface AccentPickerProps {
  value: AccentName;
  onChange: (accent: AccentName) => void;
}

/** Selector del color de acento: una muestra por color, con nombre visible (no solo color). */
export function AccentPicker({ value, onChange }: AccentPickerProps) {
  const { t } = useTranslation();
  const { scheme, colors, spacing, touch, radius } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t("profile.accent")}
      style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}
    >
      {ACCENTS.map((accent) => {
        const selected = accent === value;
        const swatch = accents[accent][scheme];
        const name = t(`accents.${accent}`);
        return (
          <Pressable
            key={accent}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={name}
            onPress={() => onChange(accent)}
            style={{ alignItems: "center", gap: spacing.xs, minWidth: touch.primary }}
          >
            <View
              style={{
                width: touch.min,
                height: touch.min,
                borderRadius: radius.pill,
                padding: 3,
                borderWidth: 2,
                borderColor: selected ? colors.text : "transparent",
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: radius.pill,
                  backgroundColor: swatch.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected ? (
                  <AppText style={{ color: swatch.onPrimary, fontWeight: "700" }}>✓</AppText>
                ) : null}
              </View>
            </View>
            <AppText variant="caption" tone={selected ? "default" : "secondary"}>
              {name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
