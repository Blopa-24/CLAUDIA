import { ACCENTS, type AccentName, buildColors, type ColorScheme } from "./colors";
import { contrastRatio } from "./contrast";

const TEXT_AA = 4.5; // texto normal
const UI_AA = 3; // componentes e íconos
const MIN_HUE_GAP = 25; // grados entre un acento y los colores con significado fijo

function hue(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255) as [
    number,
    number,
    number,
  ];
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
const hueGap = (a: string, b: string) => {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
};

const combos = ACCENTS.flatMap((accent) =>
  (["dark", "light"] as ColorScheme[]).map((scheme): [AccentName, ColorScheme] => [accent, scheme]),
);

describe.each(combos)("acento %s en tema %s", (accent, scheme) => {
  const c = buildColors(scheme, accent);

  it.each([
    ["text", c.text],
    ["textSecondary", c.textSecondary],
    ["textMuted", c.textMuted],
  ])("%s se lee sobre background y surface (AA)", (_name, fg) => {
    expect(contrastRatio(fg, c.background)).toBeGreaterThanOrEqual(TEXT_AA);
    expect(contrastRatio(fg, c.surface)).toBeGreaterThanOrEqual(TEXT_AA);
    expect(contrastRatio(fg, c.surfaceRaised)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it.each([
    ["primary", c.primary, c.onPrimary],
    ["success", c.success, c.onSuccess],
    ["record", c.record, c.onRecord],
    ["danger", c.danger, c.onDanger],
  ])("el texto sobre %s cumple AA", (_name, bg, fg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(TEXT_AA);
  });

  it.each([
    ["primary", c.primary],
    ["success", c.success],
    ["danger", c.danger],
  ])("%s se distingue del fondo y de la barra (3:1)", (_name, color) => {
    expect(contrastRatio(color, c.background)).toBeGreaterThanOrEqual(UI_AA);
    expect(contrastRatio(color, c.surface)).toBeGreaterThanOrEqual(UI_AA);
  });

  it.each([
    ["éxito", c.success],
    ["récord", c.record],
    ["peligro", c.danger],
  ])("el acento no se confunde con el color de %s", (_name, fixed) => {
    expect(hueGap(c.primary, fixed)).toBeGreaterThanOrEqual(MIN_HUE_GAP);
  });
});

describe("acentos entre sí", () => {
  it("cada par de acentos se distingue por su tono", () => {
    for (const scheme of ["dark", "light"] as ColorScheme[]) {
      for (const a of ACCENTS) {
        for (const b of ACCENTS) {
          if (a < b) {
            const gap = hueGap(buildColors(scheme, a).primary, buildColors(scheme, b).primary);
            expect({ pair: `${a}/${b}`, scheme, ok: gap >= MIN_HUE_GAP }).toMatchObject({
              ok: true,
            });
          }
        }
      }
    }
  });
});
