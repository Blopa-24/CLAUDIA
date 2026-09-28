import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("muestra el título como encabezado y la descripción", async () => {
    await render(<EmptyState title="Sin datos" body="Aquí aparecerán tus entrenamientos." />);
    expect(screen.getByRole("header", { name: "Sin datos" })).toBeTruthy();
    expect(screen.getByText("Aquí aparecerán tus entrenamientos.")).toBeTruthy();
  });

  it("marca como pendiente lo que aún no existe", async () => {
    await render(<EmptyState title="Sin datos" body="Texto" badge="Disponible pronto" />);
    expect(screen.getByText("Disponible pronto")).toBeTruthy();
  });

  it("no muestra etiqueta ni ícono si no se entregan", async () => {
    await render(<EmptyState title="Sin datos" body="Texto" />);
    expect(screen.queryByText("Disponible pronto")).toBeNull();
  });

  it("dibuja el ícono recibido", async () => {
    await render(<EmptyState icon={<Text>ícono</Text>} title="Sin datos" body="Texto" />);
    expect(screen.getByText("ícono")).toBeTruthy();
  });
});
