// Paleta de GymSuper: los colores de los discos olímpicos (propuesta, sección 4.2).
// Verde = 10 kg (éxito), amarillo = 15 kg (récord), rojo = 25 kg (peligro). Esos tres son fijos.
// El color principal (acento) se elige entre ACCENTS; el azul del disco de 20 kg es el de fábrica.
// Los tests (colors.test.ts) validan contraste AA y que ningún acento se confunda con los fijos.
// `record` (amarillo) se usa solo como insignia rellena con `onRecord` encima: sobre el fondo
// claro no alcanza 3:1, así que nunca se usa como ícono o texto suelto.

export type ColorScheme = "light" | "dark";

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  success: string;
  onSuccess: string;
  record: string;
  onRecord: string;
  danger: string;
  onDanger: string;
}

type AccentTokens = Pick<ColorTokens, "primary" | "onPrimary">;

export const ACCENTS = ["blue", "violet", "cyan", "pink"] as const;
export type AccentName = (typeof ACCENTS)[number];
export const DEFAULT_ACCENT: AccentName = "blue";

export const accents: Record<AccentName, Record<ColorScheme, AccentTokens>> = {
  blue: {
    dark: { primary: "#5b9bff", onPrimary: "#08101f" },
    light: { primary: "#1a5bcc", onPrimary: "#ffffff" },
  },
  violet: {
    dark: { primary: "#a98bff", onPrimary: "#120a24" },
    light: { primary: "#6a45d6", onPrimary: "#ffffff" },
  },
  cyan: {
    dark: { primary: "#33c7d9", onPrimary: "#031417" },
    light: { primary: "#0b6f84", onPrimary: "#ffffff" },
  },
  pink: {
    dark: { primary: "#f47bbd", onPrimary: "#22051a" },
    light: { primary: "#b8226a", onPrimary: "#ffffff" },
  },
};

const base: Record<ColorScheme, Omit<ColorTokens, keyof AccentTokens>> = {
  dark: {
    background: "#0e1116",
    surface: "#161a21",
    surfaceRaised: "#1e232c",
    border: "#2c333e",
    text: "#f2f4f7",
    textSecondary: "#b6bdc8",
    textMuted: "#8d96a3",
    success: "#3ccb7f",
    onSuccess: "#05140c",
    record: "#ffc933",
    onRecord: "#1a1400",
    danger: "#ff6b6b",
    onDanger: "#1c0606",
  },
  light: {
    background: "#f5f6f8",
    surface: "#ffffff",
    surfaceRaised: "#ffffff",
    border: "#d9dde3",
    text: "#11151b",
    textSecondary: "#454d5a",
    textMuted: "#5f6876",
    success: "#157a42",
    onSuccess: "#ffffff",
    record: "#f2b705",
    onRecord: "#1a1400",
    danger: "#c62828",
    onDanger: "#ffffff",
  },
};

export function buildColors(scheme: ColorScheme, accent: AccentName = DEFAULT_ACCENT): ColorTokens {
  return { ...base[scheme], ...accents[accent][scheme] };
}

/** Paleta de fábrica (acento azul) en cada tema. */
export const colors: Record<ColorScheme, ColorTokens> = {
  dark: buildColors("dark"),
  light: buildColors("light"),
};
