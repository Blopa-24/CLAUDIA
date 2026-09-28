import { contrastRatio, relativeLuminance } from "./contrast";

describe("contrastRatio", () => {
  it("da 21:1 entre negro y blanco", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("da 1:1 entre colores iguales y es simétrico", () => {
    expect(contrastRatio("#5b9bff", "#5b9bff")).toBe(1);
    expect(contrastRatio("#123456", "#abcdef")).toBe(contrastRatio("#abcdef", "#123456"));
  });

  it("rechaza colores mal escritos", () => {
    expect(() => relativeLuminance("azul")).toThrow("Color inválido");
    expect(() => relativeLuminance("#fff")).toThrow("Color inválido");
  });
});
