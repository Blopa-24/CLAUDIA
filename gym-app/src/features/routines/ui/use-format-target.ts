import { useTranslation } from "react-i18next";

import { formatTarget, type RoutineTarget } from "@/domain/routine";

/** Objetivo en una línea en el idioma actual: "3 × 8–10 · RIR 2". */
export function useFormatTarget(): (target: RoutineTarget) => string {
  const { t } = useTranslation();
  return (target) =>
    formatTarget(target, {
      sets: (count) => t("routines.targetSets", { count }),
      rir: t("workout.rir"),
    });
}
