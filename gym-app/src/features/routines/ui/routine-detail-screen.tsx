import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatRestChoice } from "@/domain/rest-timer";
import type { Routine } from "@/domain/routine";
import { useOpenWorkout } from "@/features/workout/hooks/use-workout-data";
import { AppButton, AppText, EmptyState, Screen } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import { startRoutine, useRoutine } from "../hooks/use-routines";
import { useRoutineDraft } from "../state/routine-draft-store";

import { useFormatTarget } from "./use-format-target";

/** Una rutina: sus ejercicios con objetivos, y los botones para empezarla o editarla. */
export function RoutineDetailScreen({ routineId }: { routineId: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, reload, retry } = useRoutine(routineId);

  // Al volver del editor se lee de nuevo.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: state.status === "ready" && state.data ? state.data.name : "",
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    />
  );

  if (state.status === "loading") {
    return (
      <Screen>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator accessibilityLabel={t("common.loading")} />
        </View>
      </Screen>
    );
  }
  if (state.status === "error" || state.data === null) {
    return (
      <Screen>
        {header}
        <EmptyState
          title={t("routines.notFound")}
          body=""
          action={<AppButton label={t("common.retry")} onPress={retry} />}
        />
      </Screen>
    );
  }
  return (
    <>
      {header}
      <RoutineView routine={state.data} />
    </>
  );
}

function RoutineView({ routine }: { routine: Routine }) {
  const { t, i18n } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const formatTarget = useFormatTarget();
  const { state: openState, reload: reloadOpen } = useOpenWorkout();
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);
  const language = i18n.language === "en" ? "en" : "es";
  const inProgress = openState.status === "ready" && openState.data !== null;

  useFocusEffect(
    useCallback(() => {
      void reloadOpen();
    }, [reloadOpen]),
  );

  const start = () => {
    setStarting(true);
    setFailed(false);
    startRoutine(routine.id, language)
      .then((result) => {
        if (result.ok) router.push("/workout");
        else setFailed(true);
      })
      .catch((error: unknown) => {
        console.error("No se pudo empezar la rutina", error);
        setFailed(true);
      })
      .finally(() => setStarting(false));
  };

  const edit = () => {
    useRoutineDraft.getState().load(routine);
    router.push("/routines/edit");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.xl,
      }}
    >
      <View>
        {routine.exercises.map((item, index) => {
          const target = formatTarget(item.target);
          const details = [
            target,
            item.restS === null ? null : t("routines.rest", { time: formatRestChoice(item.restS) }),
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                gap: spacing.md,
                paddingVertical: spacing.md,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <AppText tone="secondary" style={{ width: 24 }}>
                {index + 1}
              </AppText>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText style={{ fontWeight: "600" }}>{item.exercise.name[language]}</AppText>
                {details ? (
                  <AppText variant="small" tone="secondary">
                    {details}
                  </AppText>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {inProgress ? (
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="title" accessibilityRole="header">
              {t("routines.inProgressTitle")}
            </AppText>
            <AppText tone="secondary">{t("routines.inProgressBody")}</AppText>
          </View>
          <AppButton
            size="large"
            label={t("routines.continue")}
            onPress={() => router.push("/workout")}
          />
        </View>
      ) : (
        <AppButton size="large" label={t("routines.start")} onPress={start} disabled={starting} />
      )}
      {failed ? (
        <AppText accessibilityRole="alert" style={{ color: colors.danger }}>
          {t("workout.saveFailed")}
        </AppText>
      ) : null}
      <AppButton variant="secondary" label={t("routines.edit")} onPress={edit} />
    </ScrollView>
  );
}
