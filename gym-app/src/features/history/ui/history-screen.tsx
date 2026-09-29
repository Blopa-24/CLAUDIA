import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

import { formatElapsed, formatVolume } from "@/features/workout/format";
import { useWorkoutHistory } from "@/features/workout/hooks/use-workout-data";
import { formatWorkoutDate } from "@/features/workout/ui/workout-report";
import { usePreferences } from "@/state/preferences";
import { AppButton, AppText, EmptyState, Icon, Screen } from "@/ui/components";
import { useTheme } from "@/ui/theme";

export function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing } = useTheme();
  const unit = usePreferences((s) => s.weightUnit);
  const { state, reload, retry } = useWorkoutHistory();

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
          title={t("history.loadError")}
          body=""
          action={<AppButton label={t("common.retry")} onPress={retry} />}
        />
      </Screen>
    );
  }
  if (state.data.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon={<Icon name="history" color={colors.textMuted} size={48} />}
          title={t("history.emptyTitle")}
          body={t("history.emptyBody")}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={state.data}
        keyExtractor={(item) => item.workout.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border }} />
        )}
        contentContainerStyle={{ paddingVertical: spacing.sm }}
        renderItem={({ item: { workout, summary } }) => {
          const date = formatWorkoutDate(workout.timing.startedAt ?? 0, i18n.language);
          const details = [
            workout.routineName,
            formatElapsed(summary.durationMs),
            t("history.exercises", { count: summary.exerciseCount }),
            formatVolume(summary.volumeKg, unit, i18n.language),
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${date}. ${details}`}
              onPress={() => router.push(`/history/${workout.id}`)}
              style={({ pressed }) => ({
                paddingVertical: spacing.md,
                gap: spacing.xs,
                minHeight: 48,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <AppText style={{ fontWeight: "600" }}>{date}</AppText>
              <AppText variant="small" tone="secondary">
                {details}
              </AppText>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
