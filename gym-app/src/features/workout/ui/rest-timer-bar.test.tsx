import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Vibration } from "react-native";

import i18n from "@/i18n";
import { usePreferences } from "@/state/preferences";

import { useRestTimer } from "../state/rest-timer-store";

import { RestTimerBar } from "./rest-timer-bar";

describe("RestTimerBar", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });
  beforeEach(() => {
    jest.useFakeTimers({ now: 1_000_000 });
    jest.spyOn(Vibration, "vibrate").mockImplementation(() => undefined);
    useRestTimer.setState({ timer: null });
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("no ocupa espacio si no hay descanso", async () => {
    await render(<RestTimerBar bottomInset={0} />);
    expect(screen.queryByText("Descanso")).toBeNull();
  });

  it("cuenta hacia atrás y ajusta de a 15 segundos", async () => {
    useRestTimer.getState().start(90, null);
    await render(<RestTimerBar bottomInset={0} />);
    expect(screen.getByText("01:30")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Sumar 15 segundos" }));
    expect(screen.getByText("01:45")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Quitar 15 segundos" }));
    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(screen.getByText("01:00")).toBeTruthy();
  });

  it("al terminar avisa, vibra una vez y se puede cerrar", async () => {
    useRestTimer.getState().start(15, null);
    await render(<RestTimerBar bottomInset={0} />);
    await act(async () => {
      jest.advanceTimersByTime(16_000);
    });
    expect(screen.getByText("Descanso terminado")).toBeTruthy();
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole("button", { name: "Cerrar" }));
    expect(useRestTimer.getState().timer).toBeNull();
  });

  it("saltar termina el descanso", async () => {
    useRestTimer.getState().start(90, null);
    await render(<RestTimerBar bottomInset={0} />);
    await fireEvent.press(screen.getByRole("button", { name: "Saltar" }));
    expect(useRestTimer.getState().timer).toBeNull();
  });
});

describe("RestTimerBar: elegir el tiempo", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });
  beforeEach(() => {
    jest.useFakeTimers({ now: 1_000_000 });
    useRestTimer.setState({ timer: null, exerciseId: null });
    usePreferences.setState({ restByExercise: {} });
  });
  afterEach(() => jest.useRealTimers());

  it("elegir otra duración reinicia el descanso y la recuerda para ese ejercicio", async () => {
    useRestTimer.getState().start(90, "system:deadlift");
    await render(<RestTimerBar bottomInset={0} />);
    expect(screen.getByRole("button", { name: "Descansar 1:30" })).toBeSelected();

    await fireEvent.press(screen.getByRole("button", { name: "Descansar 3:00" }));
    expect(screen.getByText("03:00")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Descansar 3:00" })).toBeSelected();
    expect(usePreferences.getState().restByExercise).toEqual({ "system:deadlift": 180 });
  });

  it("si no empieza solo, queda listo hasta tocar Iniciar", async () => {
    useRestTimer.getState().prepare(120, "system:deadlift");
    await render(<RestTimerBar bottomInset={0} />);
    expect(screen.getByText("Descanso listo")).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("02:00")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Iniciar" }));
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("01:50")).toBeTruthy();
  });
});
