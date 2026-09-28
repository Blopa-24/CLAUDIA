import { fireEvent, render, screen } from "@testing-library/react-native";

import i18n from "@/i18n";

import { WeightUnitPicker } from "./weight-unit-picker";

describe("WeightUnitPicker", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  it("muestra kilogramos y libras, con el actual marcado", async () => {
    await render(<WeightUnitPicker value="kg" onChange={jest.fn()} />);
    expect(screen.getByRole("radio", { name: "Kilogramos (kg)" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Libras (lb)" })).not.toBeChecked();
  });

  it("avisa la unidad que se toca", async () => {
    const onChange = jest.fn();
    await render(<WeightUnitPicker value="kg" onChange={onChange} />);
    await fireEvent.press(screen.getByRole("radio", { name: "Libras (lb)" }));
    expect(onChange).toHaveBeenCalledWith("lb");
  });
});
