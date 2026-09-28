import { convertWeight, fromKg, KG_PER_LB, roundForDisplay, toKg } from "./units";

describe("conversión de peso", () => {
  it("deja los kilogramos tal cual", () => {
    expect(toKg(80, "kg")).toBe(80);
    expect(fromKg(80, "kg")).toBe(80);
  });

  it("usa el factor exacto de la libra", () => {
    expect(toKg(1, "lb")).toBe(KG_PER_LB);
    expect(toKg(100, "lb")).toBeCloseTo(45.359237, 9);
    expect(fromKg(100, "lb")).toBeCloseTo(220.462262185, 8);
  });

  it("vuelve al valor original al ida y vuelta, sin perder precisión", () => {
    for (const lb of [2.5, 45, 100, 135, 225, 315.5]) {
      expect(fromKg(toKg(lb, "lb"), "lb")).toBeCloseTo(lb, 10);
    }
  });

  it("convierte entre cualquier par de unidades", () => {
    expect(convertWeight(20, "kg", "kg")).toBe(20);
    expect(convertWeight(45, "lb", "kg")).toBeCloseTo(20.41165665, 8);
    expect(convertWeight(20, "kg", "lb")).toBeCloseTo(44.0924524, 6);
  });

  it("acepta cero", () => {
    expect(toKg(0, "lb")).toBe(0);
  });

  it.each([NaN, Infinity, -Infinity])("rechaza %p", (value) => {
    expect(() => toKg(value, "kg")).toThrow(RangeError);
    expect(() => fromKg(value, "lb")).toThrow(RangeError);
  });
});

describe("roundForDisplay", () => {
  it("redondea al paso pedido", () => {
    expect(roundForDisplay(99.79, 0.5)).toBe(100);
    expect(roundForDisplay(45.359237, 0.1)).toBe(45.4);
    expect(roundForDisplay(81.24, 2.5)).toBe(80);
  });

  it("no arrastra errores de coma flotante", () => {
    expect(roundForDisplay(0.1 + 0.2, 0.1)).toBe(0.3);
  });

  it("rechaza pasos inválidos", () => {
    expect(() => roundForDisplay(10, 0)).toThrow(RangeError);
    expect(() => roundForDisplay(10, -1)).toThrow(RangeError);
  });
});
