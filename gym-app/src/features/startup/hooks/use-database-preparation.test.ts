import { act, renderHook } from "@testing-library/react-native";

import { useDatabasePreparation } from "./use-database-preparation";

jest.mock("@/db/client", () => ({ prepareDatabase: jest.fn() }));

describe("useDatabasePreparation", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it("parte cargando y queda lista cuando la base termina", async () => {
    let finish: () => void = () => undefined;
    const prepare = () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      });
    const { result } = await renderHook(() => useDatabasePreparation(prepare));
    expect(result.current.status).toBe("loading");

    await act(async () => finish());
    expect(result.current.status).toBe("ready");
  });

  it("si falla, lo informa y al reintentar vuelve a preparar la base", async () => {
    const prepare = jest
      .fn<Promise<void>, []>()
      .mockRejectedValueOnce(new Error("migración rota"))
      .mockResolvedValueOnce(undefined);
    const { result } = await renderHook(() => useDatabasePreparation(prepare));
    await act(async () => undefined);
    expect(result.current.status).toBe("error");
    expect(console.error).toHaveBeenCalled();

    await act(async () => {
      if (result.current.status === "error") result.current.retry();
    });
    expect(prepare).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("ready");
  });
});
