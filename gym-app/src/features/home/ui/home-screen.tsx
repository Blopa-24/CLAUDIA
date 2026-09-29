import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import type { Routine } from "@/domain/routine";
import type { Workout } from "@/domain/workout";
import { activeDurationMs } from "@/domain/workout-session";
import { useRoutines } from "@/features/routines/hooks/use-routines";
import { useRoutineDraft } from "@/features/routines/state/routine-draft-store";
import { formatElapsed } from "@/features/workout/format";
import { startOrResumeWorkout, useOpenWorkout } from "@/features/workout/hooks/use-workout-data";
import { AppButton, AppText } from "@/ui/components";
import { useNow } from "@/ui/hooks/use-now";
import { useTheme } from "@/ui/theme";

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const open = useOpenWorkout();
  const routines = useRoutines();
  const reloadOpen = open.reload;
  const reloadRoutines = routines.reload;

  // Al volver de un entrenamiento o del editor se lee de nuevo.
  useFocusEffect(
    useCallback(() => {
      void reloadOpen();
      void reloadRoutines();
    }, [reloadOpen, reloadRoutines]),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xxl }}
    >
      <WorkoutSection state={open.state} retry={open.retry} />
      <RoutinesSection state={routines.state} retry={routines.retry} />
    </ScrollView>
  );
}

function WorkoutSection({
  state,
  retry,
}: {
  state: ReturnType<typeof useOpenWorkout>["state"];
  retry: () => void;
}) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const [starting, setStarting] = useState(false);
  const [startFailed, setStartFailed] = useState(false);

  const startFree = () => {
    setStarting(true);
    setStartFailed(false);
    startOrResumeWorkout()
      .then(() => router.push("/workout"))
      .catch((error: unknown) => {
        console.error("No se pudo empezar el entrenamiento", error);
        setStartFailed(true);
      })
      .finally(() => setStarting(false));
  };

  if (state.status === "loading") {
    return <ActivityIndicator accessibilityLabel={t("common.loading")} />;
  }
  if (state.status === "error") {
    return (
      <View style={{ gap: spacing.md }}>
        <AppText tone="secondary">{t("home.loadError")}</AppText>
        <AppButton variant="secondary" label={t("common.retry")} onPress={retry} />
      </View>
    );
  }
  if (state.data !== null) return <ActiveWorkoutCard workout={state.data} />;
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <AppText variant="heading" accessibilityRole="header">
          {t("home.startTitle")}
        </AppText>
        <AppText tone="secondary">{t("home.startBody")}</AppText>
      </View>
      <AppButton size="large" label={t("home.start")} onPress={startFree} disabled={starting} />
      {startFailed ? (
        <AppText accessibilityRole="alert" tone="secondary">
          {t("workout.saveFailed")}
        </AppText>
      ) : null}
    </View>
  );
}

function ActiveWorkoutCard({ workout }: { workout: Workout }) {
  const { t } = useTranslation();
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const paused = workout.timing.status === "paused";
  const now = useNow(1000, !paused);
  const sets = workout.exercises.reduce((sum, entry) => sum + entry.sets.length, 0);
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <AppText variant="heading" accessibilityRole="header">
          {workout.routineName ?? t("home.activeTitle")}
        </AppText>
        <AppText
          style={{
            fontFamily: fontFamily.numericBold,
            fontSize: fontSize.display,
            color: colors.primary,
          }}
        >
          {formatElapsed(activeDurationMs(workout.timing, now))}
        </AppText>
        <AppText tone="secondary">
          {paused ? `${t("home.paused")} · ` : ""}
          {t("home.activeSets", { count: sets })}
        </AppText>
      </View>
      <AppButton size="large" label={t("home.continue")} onPress={() => router.push("/workout")} />
    </View>
  );
}

function RoutinesSection({
  state,
  retry,
}: {
  state: ReturnType<typeof useRoutines>["state"];
  retry: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { colors, spacing } = useTheme();
  const language = i18n.language === "en" ? "en" : "es";

  const createRoutine = () => {
    useRoutineDraft.getState().startNew();
    router.push("/routines/edit");
  };

  let list;
  if (state.status === "loading") {
    list = <ActivityIndicator accessibilityLabel={t("common.loading")} />;
  } else if (state.status === "error") {
    list = (
      <View style={{ gap: spacing.sm }}>
        <AppText tone="secondary">{t("routines.loadError")}</AppText>
        <AppButton variant="secondary" label={t("common.retry")} onPress={retry} />
      </View>
    );
  } else if (state.data.length === 0) {
    list = <AppText tone="secondary">{t("routines.empty")}</AppText>;
  } else {
    list = state.data.map((routine: Routine, index) => {
      const names = routine.exercises.map((item) => item.exercise.name[language]).join(", ");
      const count = t("routines.exercises", { count: routine.exercises.length });
      return (
        <Pressable
          key={routine.id}
          accessibilityRole="button"
          accessibilityLabel={`${routine.name}. ${count}`}
          onPress={() => router.push(`/routines/${routine.id}`)}
          style={({ pressed }) => ({
            minHeight: 56,
            paddingVertical: spacing.md,
            gap: 2,
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: colors.border,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <AppText style={{ fontWeight: "600" }}>{routine.name}</AppText>
          <AppText variant="small" tone="secondary" numberOfLines={1}>
            {count} · {names}
          </AppText>
        </Pressable>
      );
    });
  }

  return (
    <View style={{ gap: spacing.md }}>
      <AppText variant="title" accessibilityRole="header">
        {t("routines.title")}
      </AppText>
      <View>{list}</View>
      <AppButton
        variant="secondary"
        label={`+  ${t("routines.newRoutine")}`}
        accessibilityLabel={t("routines.newRoutine")}
        onPress={createRoutine}
      />
    </View>
  );
}
