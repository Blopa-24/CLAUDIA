// Paleta de GymSuper: los colores de los discos olímpicos (propuesta, sección 4.2).
// Azul = disco de 20 kg, verde = 10 kg, amarillo = 15 kg, rojo = 25 kg.
// El test de contraste (colors.test.ts) valida cada combinación en los dos temas.
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

export const colors: Record<ColorScheme, ColorTokens> = {
  dark: {
    background: "#0e1116",
    surface: "#161a21",
    surfaceRaised: "#1e232c",
    border: "#2c333e",
    text: "#f2f4f7",
    textSecondary: "#b6bdc8",
    textMuted: "#8d96a3",
    primary: "#5b9bff",
    onPrimary: "#08101f",
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
    primary: "#1a5bcc",
    onPrimary: "#ffffff",
    success: "#157a42",
    onSuccess: "#ffffff",
    record: "#f2b705",
    onRecord: "#1a1400",
    danger: "#c62828",
    onDanger: "#ffffff",
  },
};
