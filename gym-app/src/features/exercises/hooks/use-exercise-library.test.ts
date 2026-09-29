import { act, renderHook } from "@testing-library/react-native";

import type { Exercise } from "@/domain/exercise";

import { useExerciseLibrary } from "./use-exercise-library";

// La base nativa no existe en los tests: cada caso entrega su propia función de carga.
jest.mock("@/db/client", () => ({ withDatabase: jest.fn() }));

const bench = { id: "system:barbell-bench-press" } as Exercise;

describe("useExerciseLibrary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("entrega los ejercicios cargados", async () => {
    const load = async () => [bench];
    const { result } = await renderHook(() => useExerciseLibrary(load));
    expect(result.current).toEqual({ status: "ready", exercises: [bench] });
  });

  it("si la carga falla, informa el error y permite reintentar", async () => {
    let fail = true;
    const load = async () => {
      if (fail) throw new Error("disco lleno");
      return [bench];
    };
    const { result } = await renderHook(() => useExerciseLibrary(load));
    expect(result.current.status).toBe("error");
    expect(console.error).toHaveBeenCalled();

    fail = false;
    await act(async () => {
      if (result.current.status === "error") result.current.retry();
    });
    expect(result.current).toEqual({ status: "ready", exercises: [bench] });
  });
});
