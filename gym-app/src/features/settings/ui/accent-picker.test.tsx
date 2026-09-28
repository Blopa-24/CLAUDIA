import { fireEvent, render, screen } from "@testing-library/react-native";

import i18n from "@/i18n";

import { AccentPicker } from "./accent-picker";

describe("AccentPicker", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  it("muestra los cuatro colores con su nombre", async () => {
    await render(<AccentPicker value="blue" onChange={jest.fn()} />);
    for (const name of ["Azul", "Violeta", "Cian", "Rosa"]) {
      expect(screen.getByRole("radio", { name })).toBeTruthy();
    }
  });

  it("marca como elegido solo el color actual", async () => {
    await render(<AccentPicker value="violet" onChange={jest.fn()} />);
    expect(screen.getByRole("radio", { name: "Violeta" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Azul" })).not.toBeChecked();
  });

  it("avisa el color que se toca", async () => {
    const onChange = jest.fn();
    await render(<AccentPicker value="blue" onChange={onChange} />);
    await fireEvent.press(screen.getByRole("radio", { name: "Rosa" }));
    expect(onChange).toHaveBeenCalledWith("pink");
  });
});
