import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  trackingOf,
  type Workout,
  type WorkoutRecord,
  type WorkoutSummary,
} from "@/domain/workout";
import type { WeightUnit } from "@/domain/units";
import { usePreferences } from "@/state/preferences";
import { AppButton, AppText, EmptyState, Screen } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import { formatElapsed, formatSet, formatVolume, formatWeight } from "../format";
import { useWorkoutReport } from "../hooks/use-workout-data";

/** Fecha larga del entrenamiento, con mayúscula inicial: "Domingo, 28 de septiembre". */
export function formatWorkoutDate(timestamp: number, language: string): string {
  const date = new Intl.DateTimeFormat(language, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(timestamp);
  return date.charAt(0).toLocaleUpperCase(language) + date.slice(1);
}

/**
 * Resumen de un entrenamiento: al terminarlo ("finished") y al abrirlo desde el historial
 * ("history"). Solo lectura.
 */
export function WorkoutReport({
  workoutId,
  variant,
}: {
  workoutId: string;
  variant: "finished" | "history";
}) {
  const { t } = useTranslation();
  const { state, retry } = useWorkoutReport(workoutId);

  if (state.status === "loading") {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator accessibilityLabel={t("common.loading")} />
        </View>
      </Screen>
    );
  }
  if (state.status === "error" || state.data === null) {
    return (
      <Screen>
        <EmptyState
          title={t("summary.notFound")}
          body=""
          action={<AppButton label={t("common.retry")} onPress={retry} />}
        />
      </Screen>
    );
  }
  return <ReportView {...state.data} variant={variant} />;
}

function ReportView({
  workout,
  summary,
  variant,
}: {
  workout: Workout;
  summary: WorkoutSummary;
  variant: "finished" | "history";
}) {
  const { t, i18n } = useTranslation();
  const { colors, spacing, fontFamily, fontSize, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const unit = usePreferences((s) => s.weightUnit);
  const language = i18n.language;
  const labels = {
    rir: t("workout.rir"),
    seconds: t("workout.secondsUnit"),
    meters: t("workout.metersUnit"),
  };

  const stats = [
    { label: t("summary.duration"), value: formatElapsed(summary.durationMs) },
    { label: t("summary.exercises"), value: String(summary.exerciseCount) },
    { label: t("summary.sets"), value: String(summary.workingSets) },
    { label: t("summary.volume"), value: formatVolume(summary.volumeKg, unit, language) },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: variant === "finished" ? insets.top + spacing.xl : spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.xl,
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <AppText variant="heading" accessibilityRole="header">
          {variant === "finished"
            ? t("summary.doneTitle")
            : formatWorkoutDate(workout.timing.startedAt ?? 0, language)}
        </AppText>
        {variant === "finished" ? (
          <AppText tone="secondary">
            {formatWorkoutDate(workout.timing.startedAt ?? 0, language)}
          </AppText>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: spacing.lg }}>
        {stats.map((stat) => (
          <View key={stat.label} style={{ width: "50%", gap: spacing.xs }}>
            <AppText variant="caption" tone="secondary">
              {stat.label}
            </AppText>
            <AppText style={{ fontFamily: fontFamily.numericBold, fontSize: fontSize.heading }}>
              {stat.value}
            </AppText>
          </View>
        ))}
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="title" accessibilityRole="header">
          {t("summary.recordsTitle")}
        </AppText>
        {summary.records.length === 0 ? (
          <AppText tone="secondary">{t("summary.noRecords")}</AppText>
        ) : (
          summary.records.map((record) => (
            <View
              key={`${record.exerciseId}-${record.kind}`}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
            >
              {/* Insignia amarilla con texto encima: el color de récord nunca va como texto suelto. */}
              <View
                style={{
                  backgroundColor: colors.record,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                }}
              >
                <AppText variant="caption" style={{ color: colors.onRecord, fontWeight: "700" }}>
                  PR
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={{ fontWeight: "600" }}>{record.exerciseName}</AppText>
                <AppText variant="small" tone="secondary">
                  {describeRecord(record, unit, language, t)}
                </AppText>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <AppText variant="title" accessibilityRole="header">
          {t("summary.exercisesTitle")}
        </AppText>
        {workout.exercises.map((entry) => (
          <View key={entry.id} style={{ gap: spacing.xs }}>
            <AppText style={{ fontWeight: "600" }}>{entry.nameSnapshot}</AppText>
            {entry.sets.map((set, index) => (
              <AppText
                key={set.id}
                variant="small"
                tone="secondary"
                style={{ fontFamily: fontFamily.numeric }}
              >
                {set.type === "warmup" ? t("workout.warmupShort") : index + 1}
                {"  "}
                {formatSet(set, trackingOf(entry.exercise), unit, language, labels)}
              </AppText>
            ))}
          </View>
        ))}
      </View>

      {variant === "finished" ? (
        <AppButton size="large" label={t("summary.done")} onPress={() => router.dismissTo("/")} />
      ) : null}
    </ScrollView>
  );
}

type Translate = ReturnType<typeof useTranslation>["t"];

function describeRecord(record: WorkoutRecord, unit: WeightUnit, language: string, t: Translate) {
  const weight = (kg: number) => formatWeight(kg, unit, language);
  switch (record.kind) {
    case "most_reps_at_weight":
      return `${t("summary.records.most_reps_at_weight", {
        weight: weight(record.weightKg ?? 0),
      })}: ${t("summary.recordValue", { value: record.value, previous: record.previous })}`;
    case "best_session_volume":
      return `${t("summary.records.best_session_volume")}: ${t("summary.recordValue", {
        value: formatVolume(record.value, unit, language),
        previous: formatVolume(record.previous, unit, language),
      })}`;
    default:
      return `${t(`summary.records.${record.kind}`)}: ${t("summary.recordValue", {
        value: weight(record.value),
        previous: weight(record.previous),
      })}`;
  }
}
