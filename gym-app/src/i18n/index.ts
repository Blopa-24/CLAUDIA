import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./en";
import { es } from "./es";
import { DEFAULT_LANGUAGE, resolveLanguage } from "./language";

export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const;

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(getLocales()),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false }, // React ya escapa el texto
});

export default i18n;
