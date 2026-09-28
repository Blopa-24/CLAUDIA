import { useCallback, useEffect, useState } from "react";

import { prepareDatabase } from "@/db/client";
import { preferencesHydrated } from "@/state/preferences";

export type DatabasePreparation =
  { status: "loading" } | { status: "ready" } | { status: "error"; retry: () => void };

/**
 * Abre la base cuando las preferencias ya se leyeron. En web, expo-sqlite inicia su motor en un
 * worker compartido y dos aperturas simultáneas lo inician dos veces: la segunda falla porque el
 * archivo ya está tomado (expo-sqlite 57, web/worker.ts, maybeInitAsync).
 */
async function prepareAfterPreferences(): Promise<void> {
  await preferencesHydrated();
  await prepareDatabase();
}

/** Prepara la base al abrir la app. Mientras tanto la pantalla de carga sigue visible. */
export function useDatabasePreparation(
  prepare: () => Promise<void> = prepareAfterPreferences,
): DatabasePreparation {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    prepare().then(
      () => {
        if (!cancelled) setStatus("ready");
      },
      (error: unknown) => {
        // Queda en la consola de desarrollo; la persona ve un mensaje y un botón para reintentar.
        console.error("No se pudo preparar la base de datos", error);
        if (!cancelled) setStatus("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [prepare, attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  return status === "error" ? { status, retry } : { status };
}
