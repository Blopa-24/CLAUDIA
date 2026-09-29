import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { ExercisesScreen } from "@/features/exercises/ui/exercises-screen";
import { useTheme } from "@/ui/theme";

import { useRoutineDraft } from "../state/routine-draft-store";

/** La biblioteca en modo "elegir" para el editor de rutinas: agrega al borrador y vuelve. */
export function RoutineExercisePickerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const addExercise = useRoutineDraft((s) => s.addExercise);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          presentation: "modal",
          title: t("routines.editor.add"),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ExercisesScreen
        onSelect={(exercise) => {
          addExercise(exercise);
          if (router.canGoBack()) router.back();
          else router.replace("/routines/edit");
        }}
      />
    </View>
  );
}
