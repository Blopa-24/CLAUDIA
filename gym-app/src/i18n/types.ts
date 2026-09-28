import type { es } from "./es";

/** Misma forma que el español, con cualquier texto en cada clave. */
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

export type Translation = DeepStrings<typeof es>;
