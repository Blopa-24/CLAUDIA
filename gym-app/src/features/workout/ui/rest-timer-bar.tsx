import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Vibration, View } from "react-native";

import { isFinished, remainingMs, REST_STEP_S } from "@/domain/rest-timer";
import { AppText } from "@/ui/components";
import { useNow } from "@/ui/hooks/use-now";
import { useTheme } from "@/ui/theme";

import { formatCountdown } from "../format";
import { useRestTimer } from "../state/rest-timer-store";

/** Vibración corta al terminar el descanso: se siente con el teléfono en el bolsillo. */
const FINISH_VIBRATION_MS = 400;

/** Barra del descanso, fija abajo y al alcance del pulgar (propuesta, sección 4.5). */
export function RestTimerBar({ bottomInset }: { bottomInset: number }) {
  const { t } = useTranslation();
  const { colors, spacing, fontFamily, fontSize, touch } = useTheme();
  const { timer, pause, resume, adjust, skip } = useRestTimer();
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

  const button = (label: string, a11y: string, onPress: () => void) => (
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

  return (
    <View
      accessibilityRole="timer"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm + bottomInset,
        backgroundColor: colors.surfaceRaised,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {finished ? (
        <>
          <AppText style={{ flex: 1, fontWeight: "700" }} accessibilityLiveRegion="assertive">
            {t("workout.rest.done")}
          </AppText>
          {button(t("workout.rest.dismiss"), t("workout.rest.dismiss"), skip)}
        </>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t("workout.rest.title")} ${formatCountdown(remainingMs(timer, now))}. ${
              timer.status === "running" ? t("workout.pause") : t("workout.resume")
            }`}
            onPress={() => (timer.status === "running" ? pause() : resume())}
            style={{ flex: 1, minHeight: touch.min, justifyContent: "center" }}
          >
            <AppText variant="caption" tone="secondary">
              {timer.status === "running" ? t("workout.rest.title") : t("workout.paused")}
            </AppText>
            <AppText style={{ fontFamily: fontFamily.numericBold, fontSize: fontSize.heading }}>
              {formatCountdown(remainingMs(timer, now))}
            </AppText>
          </Pressable>
          {button(`−${REST_STEP_S}`, t("workout.rest.minus"), () => adjust(-REST_STEP_S))}
          {button(`+${REST_STEP_S}`, t("workout.rest.plus"), () => adjust(REST_STEP_S))}
          {button(t("workout.rest.skip"), t("workout.rest.skip"), skip)}
        </>
      )}
    </View>
  );
}
