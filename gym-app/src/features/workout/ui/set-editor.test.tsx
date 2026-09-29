import { fireEvent, render, screen } from "@testing-library/react-native";

import type { SetDraft } from "@/domain/set-input";
import i18n from "@/i18n";

import { emptyDraft } from "../draft";

import { SetEditor } from "./set-editor";

const prefilled: SetDraft = { ...emptyDraft("kg"), weight: "80", reps: "8", rir: "2" };

describe("SetEditor", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("es");
  });

  it("repetir la serie anterior es un solo toque", async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    await render(
      <SetEditor trackingType="weight_reps" mode="new" initial={prefilled} onSubmit={onSubmit} />,
    );
    expect(screen.getByLabelText("Peso (kg)").props.value).toBe("80");
    await fireEvent.press(screen.getByRole("button", { name: "Completar serie" }));
    expect(onSubmit).toHaveBeenCalledWith(prefilled);
  });

  it("envía lo que se cambia a mano, con coma decimal", async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    await render(
      <SetEditor trackingType="weight_reps" mode="new" initial={prefilled} onSubmit={onSubmit} />,
    );
    await fireEvent.changeText(screen.getByLabelText("Peso (kg)"), "82,5");
    await fireEvent.changeText(screen.getByLabelText("Reps"), "6");
    await fireEvent.press(screen.getByRole("button", { name: "Completar serie" }));
    expect(onSubmit).toHaveBeenCalledWith({ ...prefilled, weight: "82,5", reps: "6" });
  });

  it("muestra el error debajo del campo y lo quita al corregirlo", async () => {
    const onSubmit = jest
      .fn()
      .mockResolvedValue({ ok: false, setError: { field: "reps", code: "required" } });
    await render(
      <SetEditor
        trackingType="weight_reps"
        mode="new"
        initial={{ ...prefilled, reps: "" }}
        onSubmit={onSubmit}
      />,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Completar serie" }));
    expect(screen.getByText("Completa este dato")).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText("Reps"), "8");
    expect(screen.queryByText("Completa este dato")).toBeNull();
  });

  it("marca la serie como calentamiento", async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    await render(
      <SetEditor trackingType="weight_reps" mode="new" initial={prefilled} onSubmit={onSubmit} />,
    );
    const toggle = screen.getByRole("switch", { name: "Calentamiento" });
    expect(toggle).not.toBeChecked();
    await fireEvent.press(toggle);
    expect(screen.getByRole("switch", { name: "Calentamiento" })).toBeChecked();
    await fireEvent.press(screen.getByRole("button", { name: "Completar serie" }));
    expect(onSubmit).toHaveBeenCalledWith({ ...prefilled, type: "warmup" });
  });

  it("muestra solo los campos del tipo de ejercicio", async () => {
    await render(
      <SetEditor
        trackingType="duration"
        mode="new"
        initial={emptyDraft("kg")}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByLabelText("Segundos")).toBeTruthy();
    expect(screen.queryByLabelText("Peso (kg)")).toBeNull();
    expect(screen.queryByLabelText("Reps")).toBeNull();
  });

  it("al editar ofrece guardar, cancelar y borrar", async () => {
    const onDelete = jest.fn();
    const onCancel = jest.fn();
    await render(
      <SetEditor
        trackingType="reps_only"
        mode="edit"
        initial={{ ...emptyDraft("kg"), reps: "12" }}
        onSubmit={jest.fn()}
        onDelete={onDelete}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Borrar serie" }));
    await fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    expect(onDelete).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
