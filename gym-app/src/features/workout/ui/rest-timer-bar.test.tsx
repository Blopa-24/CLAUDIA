import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Vibration } from "react-native";

import i18n from "@/i18n";

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
    useRestTimer.getState().start(90);
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
    useRestTimer.getState().start(15);
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
    useRestTimer.getState().start(90);
    await render(<RestTimerBar bottomInset={0} />);
    await fireEvent.press(screen.getByRole("button", { name: "Saltar" }));
    expect(useRestTimer.getState().timer).toBeNull();
  });
});
