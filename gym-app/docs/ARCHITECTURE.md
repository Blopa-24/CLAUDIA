# Arquitectura

Describe lo que está implementado hoy (hitos M0 y M1). Lo planificado está en [`propuesta-inicial.md`](propuesta-inicial.md).

## Stack

| Área                           | Paquete                                                                                              | Versión       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------- |
| Framework                      | Expo / React Native                                                                                  | SDK 57 / 0.86 |
| Navegación                     | Expo Router (rutas en `src/app/`)                                                                    | 57            |
| Lenguaje                       | TypeScript `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch` | 6.0           |
| Estado de UI y preferencias    | Zustand con `persist`                                                                                | 5             |
| Almacenamiento de preferencias | `expo-sqlite/kv-store`                                                                               | 57            |
| Idiomas                        | i18next + react-i18next + expo-localization                                                          | 26 / 17 / 57  |
| Íconos                         | expo-symbols (SF Symbols en iOS, Material Symbols en Android y web)                                  | 57            |
| Números grandes                | Barlow Semi Condensed (`@expo-google-fonts`)                                                         | —             |
| Tests                          | Jest 29 + jest-expo + React Native Testing Library 14                                                | —             |
| Lint y formato                 | ESLint 9 (eslint-config-expo) + Prettier 3                                                           | —             |

Las dependencias nativas se instalan con `npx expo install` (ver `AGENTS.md`), para que calcen con SDK 57.

## Capas

```
src/app/            rutas de Expo Router (delgadas: solo montan pantallas)
src/features/*/ui   pantallas y componentes de cada función
src/state/          estado global persistido (preferencias)
src/ui/             design system: tema y componentes base
src/domain/         lógica pura del gimnasio
src/i18n/           textos en español e inglés
```

ESLint impone dos reglas (`eslint.config.js`):

- `src/domain/` no puede importar React, Expo, Zustand, Drizzle ni otras capas.
- `src/app/`, `src/ui/` y `src/features/*/ui/` no pueden importar la base de datos (`@/db`, `expo-sqlite`, `drizzle-orm`).

`src/state/preferences.ts` sí usa `expo-sqlite/kv-store`: es almacenamiento clave-valor para ajustes, no la base de datos de entrenamientos (que llega en M2).

## Tema

- `src/ui/theme/colors.ts` define la paleta: neutros y colores fijos (éxito verde, récord amarillo, peligro rojo, del código de los discos olímpicos) más cuatro acentos elegibles (azul, violeta, cian, rosa).
- `useTheme()` combina el esquema del teléfono (oscuro si no está definido) con el acento guardado en las preferencias.
- `colors.test.ts` verifica en los dos temas y con cada acento el contraste WCAG AA del texto, 3:1 de los componentes y una separación de tono de al menos 25° entre el acento y los colores fijos.
- Escalas en `tokens.ts`: grilla de 4 pt, zonas táctiles de 48 y 56 pt, tipografía de 12 a 48.

## Idiomas

- `es.ts` es la referencia; `en.ts` tiene el tipo `Translation`, así que le faltaría una clave en compilación.
- Las claves de `t()` están tipadas (`i18next.d.ts`).
- El idioma sale del teléfono con `resolveLanguage()`; si no es español ni inglés, se usa español.

## Web

La app también se exporta a web (`npx expo export --platform web`), útil para revisar pantallas sin teléfono. `metro.config.js` agrega lo que `expo-sqlite` necesita en web: los archivos `.wasm` y las cabeceras de aislamiento de origen en el servidor de desarrollo. Un hosting estático tiene que enviar esas mismas cabeceras (`Cross-Origin-Embedder-Policy: credentialless` y `Cross-Origin-Opener-Policy: same-origin`).

## Tests

- Los tests viven junto al código (`*.test.ts(x)`).
- `jest.setup.ts` reemplaza el almacén nativo de `expo-sqlite` por uno en memoria.
- El dominio tiene cobertura completa de ramas.
