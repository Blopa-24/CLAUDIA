import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import type { SetDraft } from "@/domain/set-input";
import type { WeightUnit } from "@/domain/units";
import { summarySet, trackingOf, type WorkoutExercise, type WorkoutSet } from "@/domain/workout";
import { AppButton, AppText, ConfirmDialog } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import { draftFromSet, nextDraft } from "../draft";
import { formatSet, type SetLabels } from "../format";
import type { ActionOutcome } from "../hooks/use-active-workout";

import { SetEditor } from "./set-editor";

export interface ExerciseBlockProps {
  entry: WorkoutExercise;
  previous: readonly WorkoutSet[] | undefined;
  unit: WeightUnit;
  language: string;
  onComplete: (draft: SetDraft) => Promise<ActionOutcome>;
  onEdit: (setId: string, draft: SetDraft) => Promise<ActionOutcome>;
  onDelete: (setId: string) => Promise<ActionOutcome>;
  onRemove: () => void;
  /** Terminar (true) lo pliega en una línea; reabrir (false) lo vuelve a mostrar completo. */
  onSetFinished: (finished: boolean) => void;
}

/**
 * Un ejercicio del entrenamiento. Abierto mientras se hace; al terminarlo queda plegado en una
 * línea para que la pantalla muestre solo el ejercicio actual. Tocar la línea lo reabre.
 */
export function ExerciseBlock(props: ExerciseBlockProps) {
  return props.entry.completedAt !== null ? (
    <FinishedExercise {...props} />
  ) : (
    <OpenExercise {...props} />
  );
}

function useSetDescriber(entry: WorkoutExercise, unit: WeightUnit, language: string) {
  const { t } = useTranslation();
  const tracking = trackingOf(entry.exercise);
  const labels: SetLabels = {
    rir: t("workout.rir"),
    seconds: t("workout.secondsUnit"),
    meters: t("workout.metersUnit"),
  };
  return (set: WorkoutSet) => formatSet(set, tracking, unit, language, labels);
}

function FinishedExercise({ entry, unit, language, onSetFinished }: ExerciseBlockProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const describe = useSetDescriber(entry, unit, language);
  const top = summarySet(entry);
  const summary = t("workout.exerciseSummary", {
    count: entry.sets.length,
    best: top ? describe(top) : "—",
  });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("workout.reopenExercise", { name: entry.nameSnapshot, summary })}
      onPress={() => onSetFinished(false)}
      style={({ pressed }) => ({
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.md,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <AppText style={{ color: colors.success, fontWeight: "700", fontSize: 18 }}>✓</AppText>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText style={{ fontWeight: "600" }}>{entry.nameSnapshot}</AppText>
        <AppText variant="small" tone="secondary">
          {summary}
        </AppText>
      </View>
    </Pressable>
  );
}

function OpenExercise({
  entry,
  previous,
  unit,
  language,
  onComplete,
  onEdit,
  onDelete,
  onRemove,
  onSetFinished,
}: ExerciseBlockProps) {
  const { t } = useTranslation();
  const { colors, spacing, fontFamily } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"remove" | "deleteSet" | null>(null);
  const tracking = trackingOf(entry.exercise);
  const describe = useSetDescriber(entry, unit, language);
  const editing = entry.sets.find((set) => set.id === editingId);

  return (
    <View style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="title" accessibilityRole="header">
            {entry.nameSnapshot}
          </AppText>
          <AppText variant="small" tone="secondary">
            {previous && previous.length > 0
              ? t("workout.previous", { sets: previous.map(describe).join(" / ") })
              : t("workout.firstTime")}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t("workout.removeExercise")}: ${entry.nameSnapshot}`}
          onPress={() => setConfirm("remove")}
          hitSlop={8}
          style={{ minHeight: 48, minWidth: 48, alignItems: "center", justifyContent: "center" }}
        >
          <AppText tone="muted" style={{ fontSize: 20 }}>
            ×
          </AppText>
        </Pressable>
      </View>

      {entry.sets.map((set, index) => {
        const number = index + 1;
        const selected = set.id === editingId;
        return (
          <Pressable
            key={set.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t("workout.editSet", { number, set: describe(set) })}
            onPress={() => setEditingId(selected ? null : set.id)}
            style={{
              minHeight: 48,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              paddingHorizontal: spacing.sm,
              borderRadius: 8,
              backgroundColor: selected ? colors.surfaceRaised : "transparent",
            }}
          >
            <AppText
              style={{ width: 28, fontFamily: fontFamily.numericBold, color: colors.textSecondary }}
            >
              {set.type === "warmup" ? t("workout.warmupShort") : number}
            </AppText>
            <AppText style={{ flex: 1, fontFamily: fontFamily.numeric }}>{describe(set)}</AppText>
            <AppText style={{ color: colors.success, fontWeight: "700" }}>✓</AppText>
          </Pressable>
        );
      })}

      {editing ? (
        <SetEditor
          key={`edit-${editing.id}`}
          mode="edit"
          trackingType={tracking.trackingType}
          initial={draftFromSet(editing, unit, language)}
          onSubmit={async (draft) => {
            const outcome = await onEdit(editing.id, draft);
            if (outcome.ok) setEditingId(null);
            return outcome;
          }}
          onDelete={() => setConfirm("deleteSet")}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          <AppText variant="small" tone="secondary">
            {t("workout.setNumber", { number: entry.sets.length + 1 })}
          </AppText>
          <SetEditor
            // Se rehace tras cada serie para rellenarse con la que se acaba de completar.
            key={`new-${entry.sets.length}`}
            mode="new"
            trackingType={tracking.trackingType}
            initial={nextDraft(entry, previous, unit, language)}
            onSubmit={onComplete}
          />
          {entry.sets.length > 0 ? (
            <AppButton
              variant="secondary"
              label={t("workout.finishExercise")}
              onPress={() => onSetFinished(true)}
            />
          ) : null}
        </View>
      )}

      <ConfirmDialog
        visible={confirm === "remove"}
        title={t("workout.removeTitle", { name: entry.nameSnapshot })}
        body={t("workout.removeBody")}
        onDismiss={() => setConfirm(null)}
        actions={[
          { label: t("common.cancel"), onPress: () => setConfirm(null) },
          {
            label: t("workout.remove"),
            variant: "danger",
            onPress: () => {
              setConfirm(null);
              onRemove();
            },
          },
        ]}
      />
      <ConfirmDialog
        visible={confirm === "deleteSet" && editing !== undefined}
        title={t("workout.deleteSet")}
        body={editing ? describe(editing) : ""}
        onDismiss={() => setConfirm(null)}
        actions={[
          { label: t("common.cancel"), onPress: () => setConfirm(null) },
          {
            label: t("workout.deleteSet"),
            variant: "danger",
            onPress: () => {
              setConfirm(null);
              if (editing) {
                setEditingId(null);
                void onDelete(editing.id);
              }
            },
          },
        ]}
      />
    </View>
  );
}
