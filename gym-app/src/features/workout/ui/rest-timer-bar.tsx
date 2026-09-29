import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Vibration, View } from "react-native";

import { formatRestChoice, isFinished, remainingMs, REST_STEP_S } from "@/domain/rest-timer";
import { usePreferences } from "@/state/preferences";
import { AppText } from "@/ui/components";
import { useNow } from "@/ui/hooks/use-now";
import { useTheme } from "@/ui/theme";

import { formatCountdown } from "../format";
import { useRestTimer } from "../state/rest-timer-store";

/** Vibración corta al terminar el descanso: se siente con el teléfono en el bolsillo. */
const FINISH_VIBRATION_MS = 400;
/** Duraciones a un toque en la barra; el resto se elige en Perfil. */
export const BAR_CHOICES_S = [60, 90, 120, 180] as const;

/** Barra del descanso, fija abajo y al alcance del pulgar (propuesta, sección 4.5). */
export function RestTimerBar({ bottomInset }: { bottomInset: number }) {
  const { t } = useTranslation();
  const { colors, spacing, radius, fontFamily, fontSize, touch } = useTheme();
  const { timer, exerciseId, pause, resume, adjust, skip, choose } = useRestTimer();
  const setExerciseRest = usePreferences((s) => s.setExerciseRest);
  const now = useNow(250, timer?.status === "running");
  const finished = timer !== null && isFinished(timer, now);
  const vibrated = useRef(false);

  useEffect(() => {
    if (finished && !vibrated.current) {
      vibrated.current = true;
      Vibration.vibrate(FINISH_VIBRATION_MS);
    }
    if (!finished) vibrated.current = false;
  }, [finished]);

  if (timer === null) return null;

  const textButton = (label: string, a11y: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={{
        minHeight: touch.min,
        minWidth: touch.min,
        paddingHorizontal: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText style={{ color: colors.primary, fontWeight: "700" }}>{label}</AppText>
    </Pressable>
  );

  const pick = (seconds: number) => {
    choose(seconds);
    if (exerciseId !== null) setExerciseRest(exerciseId, seconds);
  };

  const ready = timer.status === "ready";
  const countdown = formatCountdown(remainingMs(timer, now));
  const label = ready
    ? t("workout.rest.ready")
    : timer.status === "running"
      ? t("workout.rest.title")
      : t("workout.paused");

  return (
    <View
      accessibilityRole="timer"
      style={{
        gap: spacing.xs,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm + bottomInset,
        backgroundColor: colors.surfaceRaised,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {finished ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AppText style={{ flex: 1, fontWeight: "700" }} accessibilityLiveRegion="assertive">
            {t("workout.rest.done")}
          </AppText>
          {textButton(t("workout.rest.dismiss"), t("workout.rest.dismiss"), skip)}
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${label} ${countdown}. ${
                timer.status === "running" ? t("workout.pause") : t("workout.rest.start")
              }`}
              onPress={() => (timer.status === "running" ? pause() : resume())}
              style={{ flex: 1, minHeight: touch.min, justifyContent: "center" }}
            >
              <AppText variant="caption" tone="secondary">
                {label}
              </AppText>
              <AppText style={{ fontFamily: fontFamily.numericBold, fontSize: fontSize.heading }}>
                {countdown}
              </AppText>
            </Pressable>
            {ready ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("workout.rest.start")}
                onPress={resume}
                style={{
                  minHeight: touch.min,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.md,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                }}
              >
                <AppText style={{ color: colors.onPrimary, fontWeight: "700" }}>
                  {t("workout.rest.start")}
                </AppText>
              </Pressable>
            ) : (
              <>
                {textButton(`−${REST_STEP_S}`, t("workout.rest.minus"), () => adjust(-REST_STEP_S))}
                {textButton(`+${REST_STEP_S}`, t("workout.rest.plus"), () => adjust(REST_STEP_S))}
              </>
            )}
            {textButton(t("workout.rest.skip"), t("workout.rest.skip"), skip)}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            accessibilityLabel={t("workout.rest.choose")}
            contentContainerStyle={{ gap: spacing.sm }}
          >
            {BAR_CHOICES_S.map((seconds) => {
              const selected = seconds === timer.totalS;
              return (
                <Pressable
                  key={seconds}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t("workout.rest.chooseOption", {
                    time: formatRestChoice(seconds),
                  })}
                  onPress={() => pick(seconds)}
                  hitSlop={{ top: 4, bottom: 4 }}
                  style={{
                    minHeight: touch.min - spacing.sm,
                    paddingHorizontal: spacing.md,
                    justifyContent: "center",
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : "transparent",
                  }}
                >
                  <AppText
                    variant="small"
                    style={{
                      fontFamily: fontFamily.numeric,
                      color: selected ? colors.onPrimary : colors.text,
                    }}
                  >
                    {formatRestChoice(seconds)}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}
