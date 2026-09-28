import { resolveScheme } from "./use-theme";

describe("resolveScheme", () => {
  it("respeta el modo claro del sistema", () => {
    expect(resolveScheme("light")).toBe("light");
  });

  it.each(["dark", "unspecified", null, undefined])("usa el modo oscuro con %p", (value) => {
    expect(resolveScheme(value)).toBe("dark");
  });
});
