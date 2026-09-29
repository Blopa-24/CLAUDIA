import { fireEvent, render, screen } from "@testing-library/react-native";

import i18n from "@/i18n";
import { usePreferences } from "@/state/preferences";

import { RestSettings } from "./rest-settings";

describe("RestSettings", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });
  beforeEach(() => {
    usePreferences.setState({ restSeconds: 90, restAutoStart: true });
  });

  it("marca el descanso de siempre y permite cambiarlo", async () => {
    await render(<RestSettings />);
    expect(screen.getByRole("radio", { name: "1:30 de descanso" })).toBeChecked();
    await fireEvent.press(screen.getByRole("radio", { name: "2:00 de descanso" }));
    expect(usePreferences.getState().restSeconds).toBe(120);
    expect(screen.getByRole("radio", { name: "2:00 de descanso" })).toBeChecked();
  });

  it("ofrece de 0:30 a 5:00", async () => {
    await render(<RestSettings />);
    expect(screen.getByRole("radio", { name: "0:30 de descanso" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "5:00 de descanso" })).toBeTruthy();
  });

  it("apaga y enciende el inicio automático", async () => {
    await render(<RestSettings />);
    await fireEvent(
      screen.getByLabelText("Empezar solo al completar una serie"),
      "valueChange",
      false,
    );
    expect(usePreferences.getState().restAutoStart).toBe(false);
  });
});
