import type { es } from "./es";

// Claves de traducción tipadas: t("app.nombre") falla en compilación.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof es };
  }
}
