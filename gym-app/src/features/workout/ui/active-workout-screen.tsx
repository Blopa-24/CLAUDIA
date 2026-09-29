import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { activeDurationMs } from "@/domain/workout-session";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/domain/workout";
import { usePreferences } from "@/state/preferences";
import { AppButton, AppText, ConfirmDialog, EmptyState, Screen } from "@/ui/components";
import { useNow } from "@/ui/hooks/use-now";
import { useTheme } from "@/ui/theme";

import { formatElapsed } from "../format";
import { type ActionOutcome, useActiveWorkout } from "../hooks/use-active-workout";
import { currentExerciseId } from "../current-exercise";
import { restForExercise } from "../rest-choice";
import { useRestTimer } from "../state/rest-timer-store";
import { useWorkoutFocus } from "../state/workout-focus-store";

import { ExerciseBlock } from "./exercise-block";
import { RestTimerBar } from "./rest-timer-bar";

export function ActiveWorkoutScreen() {
  const { t } = useTranslation();
  const { state, failed, dismissFailure, reload, actions } = useActiveWorkout();

  // Al volver de "Agregar ejercicio" (u otra pantalla) se lee de nuevo lo guardado.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (state.status === "loading") {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator accessibilityLabel={t("common.loading")} />
        </View>
      </Screen>
    );
  }
  if (state.status === "error") {
    return (
      <Screen>
        <EmptyState
          title={t("workout.loadError.title")}
          body={t("workout.loadError.body")}
          action={<AppButton label={t("common.retry")} onPress={() => void reload()} />}
        />
      </Screen>
    );
  }
  if (state.status === "none") {
    return (
      <Screen>
        <EmptyState
          title={t("workout.none.title")}
          body={t("workout.none.body")}
          action={
            <AppButton label={t("workout.none.action")} onPress={() => router.dismissTo("/")} />
          }
        />
      </Screen>
    );
  }
  return (
    <WorkoutView
      workout={state.workout}
      previous={state.previous}
      failed={failed}
      onDismissFailure={dismissFailure}
      actions={actions}
    />
  );
}

interface WorkoutViewProps {
  workout: Workout;
  previous: ReadonlyMap<string, WorkoutSet[]>;
  failed: boolean;
  onDismissFailure: () => void;
  actions: ReturnType<typeof useActiveWorkout>["actions"];
}

function WorkoutView({ workout, previous, failed, onDismissFailure, actions }: WorkoutViewProps) {
  const { t, i18n } = useTranslation();
  const { colors, spacing, fontFamily, fontSize, touch } = useTheme();
  const insets = useSafeAreaInsets();
  const unit = usePreferences((s) => s.weightUnit);
  const startRest = useRestTimer((s) => s.start);
  const prepareRest = useRestTimer((s) => s.prepare);
  const restAutoStart = usePreferences((s) => s.restAutoStart);
  const restSeconds = usePreferences((s) => s.restSeconds);
  const restByExercise = usePreferences((s) => s.restByExercise);
  const chosenRest = useRestTimer((s) => s.chosen);
  const resetRest = useRestTimer((s) => s.reset);
  const focusId = useWorkoutFocus((s) => s.focusId);
  const focus = useWorkoutFocus((s) => s.focus);
  const currentId = currentExerciseId(workout.exercises, focusId);
  const hasTimer = useRestTimer((s) => s.timer !== null);
  const [dialog, setDialog] = useState<"finish" | "discard" | null>(null);
  const paused = workout.timing.status === "paused";
  const now = useNow(1000, !paused);
  const elapsed = formatElapsed(activeDurationMs(workout.timing, now));
  const totalSets = workout.exercises.reduce((sum, entry) => sum + entry.sets.length, 0);

  /** Guarda la serie y deja corriendo (o preparado) el descanso de ese ejercicio. */
  const complete = async (
    entry: WorkoutExercise,
    draft: Parameters<typeof actions.completeSet>[1],
  ) => {
    const outcome = await actions.completeSet(entry.id, draft);
    if (outcome.ok) {
      const exerciseId = entry.exercise.id;
      const seconds = restForExercise(exerciseId, entry.restS, chosenRest, {
        restSeconds,
        restByExercise,
      });
      if (restAutoStart) startRest(seconds, exerciseId);
      else prepareRest(seconds, exerciseId);
    }
    return outcome;
  };

  const endWith = async (event: "finish" | "abandon") => {
    setDialog(null);
    const outcome: ActionOutcome = await actions.changeStatus(event);
    if (!outcome.ok) return;
    resetRest();
    focus(null);
    if (event === "finish") router.replace(`/workout/summary/${workout.id}`);
    else router.dismissTo("/");
  };

  const topButton = (label: string, onPress: () => void, emphasis = false) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ minHeight: touch.min, minWidth: touch.min * 1.5, justifyContent: "center" }}
    >
      <AppText
        style={{
          color: emphasis ? colors.primary : colors.text,
          fontWeight: "700",
          textAlign: emphasis ? "right" : "left",
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + spacing.xs,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {topButton(
          paused ? t("workout.resume") : t("workout.pause"),
          () => void actions.changeStatus(paused ? "resume" : "pause"),
        )}
        <View style={{ flex: 1, alignItems: "center" }}>
          <AppText
            accessibilityLabel={t("workout.elapsed", { time: elapsed })}
            style={{ fontFamily: fontFamily.numericBold, fontSize: fontSize.title }}
          >
            {elapsed}
          </AppText>
          {paused ? (
            <AppText variant="caption" tone="secondary">
              {t("workout.paused")}
            </AppText>
          ) : null}
        </View>
        {topButton(
          t("workout.finish"),
          () => setDialog(totalSets > 0 ? "finish" : "discard"),
          true,
        )}
      </View>

      {failed ? (
        <Pressable
          accessibilityRole="alert"
          onPress={onDismissFailure}
          style={{ backgroundColor: colors.danger, padding: spacing.md }}
        >
          <AppText style={{ color: colors.onDanger, fontWeight: "600" }}>
            {t("workout.saveFailed")}
          </AppText>
        </Pressable>
      ) : null}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl + (hasTimer ? 0 : insets.bottom),
        }}
      >
        {workout.routineName ? (
          <AppText variant="heading" accessibilityRole="header" style={{ paddingTop: spacing.lg }}>
            {workout.routineName}
          </AppText>
        ) : null}
        {workout.exercises.length === 0 ? (
          <View style={{ paddingVertical: spacing.xxl, gap: spacing.sm }}>
            <AppText variant="title" accessibilityRole="header">
              {t("workout.emptyTitle")}
            </AppText>
            <AppText tone="secondary">{t("workout.emptyBody")}</AppText>
          </View>
        ) : (
          workout.exercises.map((entry, index) => (
            <View
              key={entry.id}
              style={{
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <ExerciseBlock
                entry={entry}
                previous={previous.get(entry.exercise.id)}
                unit={unit}
                language={i18n.language}
                onComplete={(draft) => complete(entry, draft)}
                onEdit={actions.editSet}
                onDelete={actions.deleteSet}
                onRemove={() => void actions.removeExercise(entry.id)}
                mode={
                  entry.completedAt !== null
                    ? "finished"
                    : entry.id === currentId
                      ? "open"
                      : "pending"
                }
                onFocus={() => focus(entry.id)}
                onSetFinished={(finished) => {
                  // Reabrir un ejercicio lo vuelve el ejercicio en curso.
                  if (!finished) focus(entry.id);
                  void actions.setExerciseFinished(entry.id, finished);
                }}
              />
            </View>
          ))
        )}
        <AppButton
          variant={workout.exercises.length === 0 ? "primary" : "secondary"}
          label={`+  ${t("workout.addExercise")}`}
          accessibilityLabel={t("workout.addExercise")}
          onPress={() => router.push("/workout/add-exercise")}
        />
      </ScrollView>

      <RestTimerBar bottomInset={insets.bottom} />

      <ConfirmDialog
        visible={dialog === "finish"}
        title={t("workout.finishTitle")}
        body={t("workout.finishBody", { count: totalSets })}
        onDismiss={() => setDialog(null)}
        actions={[
          { label: t("workout.finish"), variant: "primary", onPress: () => void endWith("finish") },
          { label: t("workout.keepTraining"), onPress: () => setDialog(null) },
        ]}
      />
      <ConfirmDialog
        visible={dialog === "discard"}
        title={t("workout.discardTitle")}
        body={t("workout.discardBody")}
        onDismiss={() => setDialog(null)}
        actions={[
          { label: t("workout.keepTraining"), onPress: () => setDialog(null) },
          {
            label: t("workout.discard"),
            variant: "danger",
            onPress: () => void endWith("abandon"),
          },
        ]}
      />
    </View>
  );
}
