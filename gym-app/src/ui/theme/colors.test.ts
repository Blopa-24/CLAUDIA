import { colors, type ColorScheme } from "./colors";
import { contrastRatio } from "./contrast";

const TEXT_AA = 4.5; // texto normal
const UI_AA = 3; // componentes e íconos

describe.each<ColorScheme>(["dark", "light"])("paleta %s", (scheme) => {
  const c = colors[scheme];

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
  ])("%s se distingue del fondo como componente (3:1)", (_name, color) => {
    expect(contrastRatio(color, c.background)).toBeGreaterThanOrEqual(UI_AA);
  });
});
