// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");

// Capas (docs/propuesta-inicial.md, sección 2.2):
// domain/ no depende de nada de la app; la UI nunca toca la base de datos.
const DB_IMPORTS = [
  {
    group: ["@/db", "@/db/*", "expo-sqlite", "expo-sqlite/*", "drizzle-orm", "drizzle-orm/*"],
    message: "La UI no accede a la base de datos: usa un hook y un servicio.",
  },
];

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  { ignores: ["dist/*", ".expo/*", "coverage/*", "src/db/migrations/*"] },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": "allow-with-description" },
      ],
    },
  },
  {
    files: ["src/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-*", "react/*", "expo", "expo-*", "@expo/*"],
              message: "domain/ es lógica pura: no importa React ni Expo.",
            },
            {
              group: [
                "@/db",
                "@/db/*",
                "@/features/*",
                "@/ui",
                "@/ui/*",
                "@/app/*",
                "drizzle-orm",
                "drizzle-orm/*",
                "zustand",
                "zustand/*",
              ],
              message: "domain/ no depende de otras capas.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**", "src/ui/**", "src/features/*/ui/**"],
    rules: { "no-restricted-imports": ["error", { patterns: DB_IMPORTS }] },
  },
]);
