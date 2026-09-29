# Hoja de ruta y estado

Estado al 28 de septiembre de 2026. El plan completo y sus razones están en [`propuesta-inicial.md`](propuesta-inicial.md).

## Hitos

| Hito                         | Estado       | Qué deja                                                                                                    |
| ---------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- |
| M0. Base                     | ✅ Terminado | Proyecto Expo SDK 57, TypeScript estricto, ESLint con reglas de capas, Jest, CI, tema, idiomas y 5 pestañas |
| M1. Motor de dominio         | ✅ Terminado | Conversión kg/lb, volumen, 1RM, récords y estados del entrenamiento, con 100 % de cobertura de ramas        |
| Extra: colores de acento     | ✅ Terminado | Azul, violeta, cian y rosa, elegibles en Perfil y guardados en el teléfono                                  |
| M2. Persistencia local       | ✅ Terminado | SQLite con migraciones, biblioteca de ejercicios, pestaña Ejercicios con búsqueda y filtro, unidad kg/lb    |
| **M3. Entrenamiento activo** | ⏭️ Siguiente | Primer momento en que la app sirve en el gimnasio                                                           |
| M4. Rutinas y ejercicios     | Pendiente    | Ejercicios personalizados, creador de rutinas, superseries                                                  |
| M5. Historial y progreso     | Pendiente    | Récords, gráficos, peso corporal y medidas                                                                  |
| M6. Cuenta y sincronización  | Pendiente    | Supabase, RLS, cola de sincronización                                                                       |
| M7. Pulido y lanzamiento     | Pendiente    | Exportar/importar, recordatorios, fotos, EAS                                                                |

## Siguiente: M3, entrenamiento activo

1. Serializar las escrituras en la base antes de guardar series (ARCHITECTURE.md, "Pendiente para M3").
2. Repositorios y servicios de entrenamientos: iniciar, agregar ejercicio, registrar y editar series, terminar. Cada acción se guarda al instante.
3. Pantalla de entrenamiento activo: registrar una serie en pocos toques, con el rendimiento anterior a la vista.
4. Temporizador de descanso, resumen con récords y recuperación tras un cierre inesperado.
5. Inicio e Historial funcionando, y el primer flujo E2E con Maestro.

## Hecho después de M2

- **Biblioteca ampliada a 223 ejercicios** (de 64), elegidos a partir del directorio de StrengthLog y la biblioteca de Hevy, más variantes recientes: curl bayesiano, sentadilla péndulo y con cinturón, remo foca y Meadows, encogimiento Kelso, press JM, nórdico inverso, elevación de tibiales, hip thrust en máquina, plancha Copenhague. Cinco grupos musculares nuevos (zona lumbar, trapecios, aductores, abductores, tibiales) y seis tipos de equipamiento (barra Z, barra hexagonal, landmine, disco, balón medicinal, anillas o TRX).
- **Peso con dos mancuernas:** se anota el de una (DOMAIN.md, "Volumen").

## Pendiente para M4

- Tipos de registro que faltan, y por eso sus ejercicios no están en la biblioteca: peso con distancia (paseo del granjero, trineo), peso con tiempo (plancha con peso) y asistidos (dominadas en máquina de asistencia, donde más peso es menos esfuerzo).

## Decisiones tomadas

- Nombre: **GymSuper**. Se prueba en **Android** con Expo Go.
- Español por defecto, inglés disponible. Kilogramos por defecto.
- Sin cuenta obligatoria: la app funciona sin conexión y la cuenta llega en M6.
- Colores fijos del código de los discos olímpicos (verde éxito, amarillo récord, rojo peligro) y cuatro acentos elegibles. El naranjo se descartó porque se confunde con el amarillo de récord.
- Rutas en `src/app/` (convención de Expo SDK 57). React Native 0.86 y TypeScript 6.0, los que fija la plantilla.
- M2: los ajustes (acento, unidad) siguen en el almacén clave-valor; no hay tabla `user_settings` hasta que la sincronización (M6) la necesite. Así hay un solo lugar para cada ajuste.
- M2: cada ejercicio guarda su nombre en español y en inglés (`name_es`, `name_en`) para buscar en los dos idiomas. Los personalizados (M4) llevarán el mismo nombre en ambas.

## Notas para trabajar en el proyecto

- Instala dependencias con `npx expo install <paquete>` para que calcen con SDK 57. En entornos donde `api.expo.dev` está bloqueado, antepone `EXPO_OFFLINE=1`.
- Antes de dar algo por terminado: `npm run typecheck`, `npm run lint`, `npm run format:check` y `npm test`. El CI corre lo mismo.
- La versión web (`npx expo export --platform web`) sirve para revisar pantallas sin teléfono. Requiere las cabeceras de aislamiento de origen descritas en [`ARCHITECTURE.md`](ARCHITECTURE.md). En Windows, `npx expo start --web` falla al empaquetar el worker de expo-sqlite ("Worker chunk not found"); la exportación sí funciona.
- Probada en un Android real con Expo Go (28 de septiembre de 2026, antes de M2). Tras cambios en `babel.config.js` o `metro.config.js`, reinicia con `npx expo start --clear`.
- La biblioteca incluida se edita en `src/db/seed/exercise-catalog.ts`. Un slug nunca se renombra ni se quita: los entrenamientos guardados lo usan.
