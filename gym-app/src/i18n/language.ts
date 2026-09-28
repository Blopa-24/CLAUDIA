export const SUPPORTED_LANGUAGES = ["es", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "es";

function isSupported(code: string): code is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

/** Elige el primer idioma del teléfono que GymSuper soporte; si no hay ninguno, español. */
export function resolveLanguage(locales: readonly { languageCode: string | null }[]): Language {
  for (const { languageCode } of locales) {
    const code = languageCode?.toLowerCase();
    if (code && isSupported(code)) return code;
  }
  return DEFAULT_LANGUAGE;
}
