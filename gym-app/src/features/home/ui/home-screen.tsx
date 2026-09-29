import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { useOpenWorkout, startOrResumeWorkout } from "@/features/workout/hooks/use-workout-data";
import { formatElapsed } from "@/features/workout/format";
import { activeDurationMs } from "@/domain/workout-session";
import type { Workout } from "@/domain/workout";
import { AppButton, AppText, Screen } from "@/ui/components";
import { useNow } from "@/ui/hooks/use-now";
import { useTheme } from "@/ui/theme";

export function HomeScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { state, reload, retry } = useOpenWorkout();
  const [starting, setStarting] = useState(false);
  const [startFailed, setStartFailed] = useState(false);

  // Al volver del entrenamiento se revisa de nuevo si quedó uno abierto.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const start = () => {
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

  let content;
  if (state.status === "loading") {
    content = <ActivityIndicator accessibilityLabel={t("common.loading")} />;
  } else if (state.status === "error") {
    content = (
      <View style={{ gap: spacing.md }}>
        <AppText tone="secondary">{t("home.loadError")}</AppText>
        <AppButton variant="secondary" label={t("common.retry")} onPress={retry} />
      </View>
    );
  } else if (state.data !== null) {
    content = <ActiveWorkoutCard workout={state.data} />;
  } else {
    content = (
      <View style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="heading" accessibilityRole="header">
            {t("home.startTitle")}
          </AppText>
          <AppText tone="secondary">{t("home.startBody")}</AppText>
        </View>
        <AppButton size="large" label={t("home.start")} onPress={start} disabled={starting} />
        {startFailed ? (
          <AppText accessibilityRole="alert" tone="secondary">
            {t("workout.saveFailed")}
          </AppText>
        ) : null}
      </View>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center" }}>{content}</View>
    </Screen>
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
          {t("home.activeTitle")}
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
