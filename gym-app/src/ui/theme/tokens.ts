// Escalas del design system (propuesta, secciones 4.3 y 4.4).

/** Grilla de 4 puntos. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;

/** Tamaños táctiles mínimos, pensados para usar con una mano. */
export const touch = {
  min: 48,
  primary: 56,
} as const;

/** Familias: la del sistema para textos y Barlow Semi Condensed para números grandes. */
export const fontFamily = {
  numeric: "BarlowSemiCondensed_600SemiBold",
  numericBold: "BarlowSemiCondensed_700Bold",
} as const;

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  title: 20,
  heading: 24,
  display: 32,
  numeric: 48,
} as const;
