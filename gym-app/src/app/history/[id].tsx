import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { WorkoutReport } from "@/features/workout/ui/workout-report";
import { useTheme } from "@/ui/theme";

export default function WorkoutDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("workout.title"),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <WorkoutReport workoutId={id} variant="history" />
    </>
  );
}
