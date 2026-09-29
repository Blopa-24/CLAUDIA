import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Pressable, View } from "react-native";

import type { SetDraft, SetField, SetInputError } from "@/domain/set-input";
import type { TrackingType } from "@/domain/types";
import { AppButton, AppText, NumberField } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import type { ActionOutcome } from "../hooks/use-active-workout";

export interface SetEditorProps {
  trackingType: TrackingType;
  initial: SetDraft;
  /** "new" para la próxima serie; "edit" para corregir una ya guardada. */
  mode: "new" | "edit";
  onSubmit: (draft: SetDraft) => Promise<ActionOutcome>;
  onDelete?: () => void;
  onCancel?: () => void;
}

type DraftField = Exclude<keyof SetDraft, "type" | "unit">;

const FIELDS: Record<TrackingType, DraftField[]> = {
  weight_reps: ["weight", "reps", "rir"],
  reps_only: ["reps", "rir"],
  duration: ["durationS"],
  distance: ["distanceM", "durationS"],
};

/**
 * Datos de una serie. Viene rellena con la serie anterior (ver draft.ts): repetirla es un toque.
 */
export function SetEditor({
  trackingType,
  initial,
  mode,
  onSubmit,
  onDelete,
  onCancel,
}: SetEditorProps) {
  const { t } = useTranslation();
  const { colors, spacing, radius, touch } = useTheme();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<SetInputError | null>(null);
  const [saving, setSaving] = useState(false);

  const labels: Record<DraftField, string> = {
    weight: t("workout.weight", { unit: draft.unit }),
    reps: t("workout.reps"),
    rir: t("workout.rir"),
    rpe: t("workout.rir"),
    durationS: t("workout.seconds"),
    distanceM: t("workout.meters"),
  };
  const errorFor = (field: SetField) =>
    error?.field === field ? t(`workout.fieldErrors.${error.code}`) : null;

  const update = (field: DraftField, text: string) => {
    setDraft((current) => ({ ...current, [field]: text }));
    if (error?.field === field) setError(null);
  };

  const submit = async () => {
    setSaving(true);
    const outcome = await onSubmit(draft);
    setSaving(false);
    if (!outcome.ok && outcome.setError) setError(outcome.setError);
    else if (outcome.ok) Keyboard.dismiss();
  };

  const warmup = draft.type === "warmup";

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {FIELDS[trackingType].map((field) => (
          <NumberField
            key={field}
            label={labels[field]}
            value={draft[field]}
            onChangeText={(text) => update(field, text)}
            decimal={field === "weight" || field === "distanceM"}
            error={errorFor(field)}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: warmup }}
          accessibilityLabel={t("workout.warmup")}
          onPress={() =>
            setDraft((current) => ({ ...current, type: warmup ? "working" : "warmup" }))
          }
          style={{
            minHeight: touch.min,
            paddingHorizontal: spacing.md,
            justifyContent: "center",
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: warmup ? colors.primary : colors.border,
            backgroundColor: warmup ? colors.primary : "transparent",
          }}
        >
          <AppText
            variant="small"
            style={{ color: warmup ? colors.onPrimary : colors.textSecondary, fontWeight: "600" }}
          >
            {warmup ? `✓ ${t("workout.warmup")}` : t("workout.warmup")}
          </AppText>
        </Pressable>
      </View>
      <AppButton
        size="large"
        label={mode === "new" ? `✓  ${t("workout.complete")}` : t("workout.save")}
        accessibilityLabel={mode === "new" ? t("workout.complete") : t("workout.save")}
        onPress={() => void submit()}
        disabled={saving}
      />
      {mode === "edit" ? (
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <AppButton variant="secondary" label={t("common.cancel")} onPress={onCancel} />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton variant="danger" label={t("workout.deleteSet")} onPress={onDelete} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
