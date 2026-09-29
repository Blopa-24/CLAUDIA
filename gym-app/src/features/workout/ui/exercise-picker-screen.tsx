import { router, Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { ExercisesScreen } from "@/features/exercises/ui/exercises-screen";
import { AppText } from "@/ui/components";
import { useTheme } from "@/ui/theme";

import { addExerciseToOpenWorkout } from "../hooks/use-workout-data";
import { useWorkoutFocus } from "../state/workout-focus-store";

/** La biblioteca en modo "elegir": tocar un ejercicio lo agrega al entrenamiento y vuelve. */
export function ExercisePickerScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          presentation: "modal",
          title: t("workout.addExercise"),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      {failed ? (
        <View
          accessibilityRole="alert"
          style={{ backgroundColor: colors.danger, padding: spacing.md }}
        >
          <AppText style={{ color: colors.onDanger, fontWeight: "600" }}>
            {t("workout.pickerFailed")}
          </AppText>
        </View>
      ) : null}
      <ExercisesScreen
        onSelect={(exercise, name) => {
          if (busy) return;
          setBusy(true);
          setFailed(false);
          addExerciseToOpenWorkout(exercise, name)
            .then((added) => {
              if (added !== null) {
                // El recién agregado pasa a ser el ejercicio en curso.
                useWorkoutFocus.getState().focus(added);
                // Si se abrió directo (sin pantalla anterior), igual vuelve al entrenamiento.
                if (router.canGoBack()) router.back();
                else router.replace("/workout");
              } else setFailed(true);
            })
            .catch((error: unknown) => {
              console.error("No se pudo agregar el ejercicio", error);
              setFailed(true);
            })
            .finally(() => setBusy(false));
        }}
      />
    </View>
  );
}
