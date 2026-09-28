# Hoja de ruta y estado

Estado al 28 de septiembre de 2026. El plan completo y sus razones están en [`propuesta-inicial.md`](propuesta-inicial.md).

## Hitos

| Hito                        | Estado       | Qué deja                                                                                                    |
| --------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| M0. Base                    | ✅ Terminado | Proyecto Expo SDK 57, TypeScript estricto, ESLint con reglas de capas, Jest, CI, tema, idiomas y 5 pestañas |
| M1. Motor de dominio        | ✅ Terminado | Conversión kg/lb, volumen, 1RM, récords y estados del entrenamiento, con 100 % de cobertura de ramas        |
| Extra: colores de acento    | ✅ Terminado | Azul, violeta, cian y rosa, elegibles en Perfil y guardados en el teléfono                                  |
| **M2. Persistencia local**  | ⏭️ Siguiente | Ver abajo                                                                                                   |
| M3. Entrenamiento activo    | Pendiente    | Primer momento en que la app sirve en el gimnasio                                                           |
| M4. Rutinas y ejercicios    | Pendiente    | Ejercicios personalizados, creador de rutinas, superseries                                                  |
| M5. Historial y progreso    | Pendiente    | Récords, gráficos, peso corporal y medidas                                                                  |
| M6. Cuenta y sincronización | Pendiente    | Supabase, RLS, cola de sincronización                                                                       |
| M7. Pulido y lanzamiento    | Pendiente    | Exportar/importar, recordatorios, fotos, EAS                                                                |

## Siguiente: M2, persistencia local

1. SQLite con Drizzle ORM: esquema y migraciones de `exercises`, `workout_sessions`, `workout_exercises`, `sets` y `user_settings` (propuesta, sección 3).
2. Repositorios con tests: la única puerta de entrada a la base (skill `database`).
3. Biblioteca inicial de unos 60 ejercicios en español e inglés, marcados como datos de ejemplo (CLAUDE.md, sección 19).
4. Pestaña **Ejercicios** real: lista, búsqueda y filtro por músculo.
5. **Unidad kg/lb** en Perfil, guardada en las preferencias.

Después viene **M3**: empezar un entrenamiento, registrar series rápido con el rendimiento anterior a la vista, temporizador de descanso, resumen con récords, recuperación tras un cierre inesperado, e Inicio e Historial funcionando.

## Decisiones tomadas

- Nombre: **GymSuper**. Se prueba en **Android** con Expo Go.
- Español por defecto, inglés disponible. Kilogramos por defecto.
- Sin cuenta obligatoria: la app funciona sin conexión y la cuenta llega en M6.
- Colores fijos del código de los discos olímpicos (verde éxito, amarillo récord, rojo peligro) y cuatro acentos elegibles. El naranjo se descartó porque se confunde con el amarillo de récord.
- Rutas en `src/app/` (convención de Expo SDK 57). React Native 0.86 y TypeScript 6.0, los que fija la plantilla.

## Notas para trabajar en el proyecto

- Instala dependencias con `npx expo install <paquete>` para que calcen con SDK 57. En entornos donde `api.expo.dev` está bloqueado, antepone `EXPO_OFFLINE=1`.
- Antes de dar algo por terminado: `npm run typecheck`, `npm run lint`, `npm run format:check` y `npm test`. El CI corre lo mismo.
- La versión web (`npx expo export --platform web`) sirve para revisar pantallas sin teléfono. Requiere las cabeceras de aislamiento de origen descritas en [`ARCHITECTURE.md`](ARCHITECTURE.md).
- Aún no se ha probado en un Android real. Es lo primero que hay que confirmar.
