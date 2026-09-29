# Arquitectura

Describe lo que está implementado hoy (hitos M0, M1 y M2). Lo planificado está en [`propuesta-inicial.md`](propuesta-inicial.md).

## Stack

| Área                           | Paquete                                                                                              | Versión          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------- |
| Framework                      | Expo / React Native                                                                                  | SDK 57 / 0.86    |
| Navegación                     | Expo Router (rutas en `src/app/`)                                                                    | 57               |
| Lenguaje                       | TypeScript `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch` | 6.0              |
| Estado de UI y preferencias    | Zustand con `persist`                                                                                | 5                |
| Almacenamiento de preferencias | `expo-sqlite/kv-store`                                                                               | 57               |
| Base de datos local            | expo-sqlite (API asíncrona) + Drizzle ORM (`sqlite-proxy`) + drizzle-kit                             | 57 / 0.45 / 0.31 |
| Base en los tests              | better-sqlite3 en memoria, con las mismas migraciones                                                | 13               |
| Idiomas                        | i18next + react-i18next + expo-localization                                                          | 26 / 17 / 57     |
| Íconos                         | expo-symbols (SF Symbols en iOS, Material Symbols en Android y web)                                  | 57               |
| Números grandes                | Barlow Semi Condensed (`@expo-google-fonts`)                                                         | —                |
| Tests                          | Jest 29 + jest-expo + React Native Testing Library 14                                                | —                |
| Lint y formato                 | ESLint 9 (eslint-config-expo) + Prettier 3                                                           | —                |

Las dependencias nativas se instalan con `npx expo install` (ver `AGENTS.md`), para que calcen con SDK 57.

## Capas

```
src/app/            rutas de Expo Router (delgadas: solo montan pantallas)
src/features/*/ui   pantallas y componentes de cada función
src/features/*/hooks conectan pantallas con datos (hoy leen del repositorio; los servicios llegan con M3)
src/db/             esquema, migraciones, repositorios y biblioteca incluida
src/state/          estado global persistido (preferencias)
src/ui/             design system: tema y componentes base
src/domain/         lógica pura del gimnasio
src/i18n/           textos en español e inglés
```

ESLint impone dos reglas (`eslint.config.js`):

- `src/domain/` no puede importar React, Expo, Zustand, Drizzle ni otras capas.
- `src/app/`, `src/ui/` y `src/features/*/ui/` no pueden importar la base de datos (`@/db`, `expo-sqlite`, `drizzle-orm`).

`src/state/preferences.ts` sí usa `expo-sqlite/kv-store`: es almacenamiento clave-valor para ajustes (acento y unidad de peso), no la base de datos de entrenamientos.

## Base de datos

- **Esquema:** `src/db/schema.ts`, con las tablas `exercises`, `workout_sessions`, `workout_exercises` y `sets` (propuesta, sección 3). Las rutinas llegan en M4 y los récords en M5, cada una con su migración.
- **Restricciones en la base:** CHECK para peso (0 a 1.500 kg), reps, RIR, RPE en pasos de 0,5, tipos de serie y fechas; claves foráneas activas. Un ejercicio usado en un entrenamiento no se puede borrar de verdad, solo marcar con `deleted_at`.
- **Migraciones:** se generan con `npm run db:generate` en `src/db/migrations/` y se incluyen en la app como texto (`babel-plugin-inline-import` y la extensión `sql` en `metro.config.js`). Las aplica `src/db/migrator.ts` al abrir la app, cada una en su transacción, usando la tabla de control de Drizzle (`__drizzle_migrations`). Nunca se edita una migración ya publicada.
- **Arranque:** `_layout.tsx` mantiene la pantalla de carga hasta que la base está lista (`useDatabasePreparation`). Si falla, muestra un error con "Reintentar"; nunca borra datos.
- **Biblioteca incluida:** `src/db/seed/exercise-catalog.ts`, 223 ejercicios con ID estable `system:<slug>`. Se carga en cada arranque sin duplicar ni tocar filas al día, aplica correcciones del catálogo y no revive un ejercicio oculto.
- **Todo es asíncrono.** La API síncrona de expo-sqlite bloquea la app y en web corta los resultados de más de 255 bytes, así que Drizzle usa el driver `sqlite-proxy` sobre `prepareAsync` / `executeForRawResultAsync`.
- **Web:** la base se abre después de leer las preferencias. expo-sqlite comparte un worker y, si dos bases se abren a la vez, lo inicia dos veces y la segunda falla.
- **Cambios que rehacen una tabla** (por ejemplo, ampliar un CHECK): el migrador apaga las claves foráneas fuera de la transacción, revisa `PRAGMA foreign_key_check` antes de confirmar y las vuelve a encender, como indica SQLite. drizzle-kit genera mal estas migraciones (copia columnas nuevas desde la tabla vieja y deja los CHECK con el nombre temporal): revisa y corrige el SQL antes de publicarlo, como en `0001_expanded_exercise_library.sql`.
- **Pendiente para M3:** las transacciones de `sqlite-proxy` mandan `BEGIN` y `COMMIT` como consultas sueltas; si otra consulta llega en medio, queda dentro. Antes de escribir entrenamientos hay que serializar las escrituras o usar `withExclusiveTransactionAsync`.

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
- Los repositorios, la biblioteca, el migrador y las restricciones se prueban contra SQLite real (`src/db/testing/test-database.ts`), no contra simulaciones.
- El dominio tiene cobertura completa de ramas.
