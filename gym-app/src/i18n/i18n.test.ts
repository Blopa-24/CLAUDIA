import { en } from "./en";
import { es } from "./es";
import { resolveLanguage } from "./language";

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("traducciones", () => {
  it("español e inglés tienen las mismas claves", () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it("ningún texto está vacío", () => {
    const values = (o: object): string[] =>
      Object.values(o).flatMap((v) => (typeof v === "string" ? [v] : values(v as object)));
    expect([...values(es), ...values(en)].every((v) => v.trim().length > 0)).toBe(true);
  });
});

describe("resolveLanguage", () => {
  it("usa el primer idioma soportado del teléfono", () => {
    expect(resolveLanguage([{ languageCode: "fr" }, { languageCode: "en" }])).toBe("en");
  });

  it("acepta mayúsculas", () => {
    expect(resolveLanguage([{ languageCode: "ES" }])).toBe("es");
  });

  it("usa español si no hay idioma soportado o viene vacío", () => {
    expect(resolveLanguage([{ languageCode: "de" }, { languageCode: null }])).toBe("es");
    expect(resolveLanguage([])).toBe("es");
  });
});
