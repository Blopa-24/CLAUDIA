import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { WeightUnit } from "@/domain/units";
import { WEIGHT_UNITS } from "@/state/preferences";
import { AppText } from "@/ui/components";
import { useTheme } from "@/ui/theme";

export interface WeightUnitPickerProps {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
}

/** Control segmentado kg / lb: dos opciones anchas, fáciles de tocar con una mano. */
export function WeightUnitPicker({ value, onChange }: WeightUnitPickerProps) {
  const { t } = useTranslation();
  const { colors, spacing, radius, touch } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t("profile.weightUnit")}
      style={{
        flexDirection: "row",
        padding: spacing.xs,
        gap: spacing.xs,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {WEIGHT_UNITS.map((unit) => {
        const selected = unit === value;
        const label = t(`weightUnits.${unit}`);
        return (
          <Pressable
            key={unit}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={label}
            onPress={() => onChange(unit)}
            style={{
              flex: 1,
              minHeight: touch.min,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radius.sm,
              backgroundColor: selected ? colors.primary : "transparent",
            }}
          >
            <AppText
              style={{
                color: selected ? colors.onPrimary : colors.textSecondary,
                fontWeight: "600",
              }}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
