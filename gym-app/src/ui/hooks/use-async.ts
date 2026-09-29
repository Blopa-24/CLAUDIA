import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncState<T> =
  { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

/**
 * Carga datos con sus tres estados. `reload` vuelve a leer sin pasar por "cargando", para que la
 * pantalla no parpadee al volver a ella. `load` debe ser estable (useCallback o de módulo).
 */
export function useAsync<T>(load: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const reload = useCallback(async () => {
    try {
      const data = await load();
      if (mounted.current) setState({ status: "ready", data });
    } catch (error) {
      console.error("No se pudieron cargar los datos", error);
      if (mounted.current) setState({ status: "error" });
    }
  }, [load]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    void reload();
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error: unknown) => {
        console.error("No se pudieron cargar los datos", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { state, reload, retry };
}
