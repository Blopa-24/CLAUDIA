# Hoja de ruta y estado

Estado al 28 de septiembre de 2026. El plan completo y sus razones están en [`propuesta-inicial.md`](propuesta-inicial.md).

## Hitos

| Hito                         | Estado       | Qué deja                                                                                                     |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| M0. Base                     | ✅ Terminado | Proyecto Expo SDK 57, TypeScript estricto, ESLint con reglas de capas, Jest, CI, tema, idiomas y 5 pestañas  |
| M1. Motor de dominio         | ✅ Terminado | Conversión kg/lb, volumen, 1RM, récords y estados del entrenamiento, con 100 % de cobertura de ramas         |
| Extra: colores de acento     | ✅ Terminado | Azul, violeta, cian y rosa, elegibles en Perfil y guardados en el teléfono                                   |
| M2. Persistencia local       | ✅ Terminado | SQLite con migraciones, biblioteca de ejercicios, pestaña Ejercicios con búsqueda y filtro, unidad kg/lb     |
| M3. Entrenamiento activo     | ✅ Terminado | Registrar entrenamientos: series en un toque, rendimiento anterior, descanso, resumen con récords, historial |
| **M4. Rutinas y ejercicios** | 🔄 En curso  | Ejercicios personalizados, creador de rutinas, superseries                                                   |
| M5. Historial y progreso     | Pendiente    | Récords, gráficos, peso corporal y medidas                                                                   |
| M6. Cuenta y sincronización  | Pendiente    | Supabase, RLS, cola de sincronización                                                                        |
| M7. Pulido y lanzamiento     | Pendiente    | Exportar/importar, recordatorios, fotos, EAS                                                                 |

## Qué dejó M3

- **Inicio:** "Empezar entrenamiento", o "Continuar" con el tiempo y las series si quedó uno abierto.
- **Entrenamiento activo** (`/workout`): cronómetro sin pausas, pausar y reanudar, agregar ejercicios desde la biblioteca, rendimiento anterior de cada uno, series con peso, reps y RIR (o reps, segundos o metros según el ejercicio) y marca de calentamiento. La próxima serie viene rellena con la anterior: repetirla es un toque. Tocar una serie la edita o la borra.
- **Descanso:** tras cada serie, con −15, +15, pausa, saltar, vibración al terminar y duraciones a un toque (1:00, 1:30, 2:00, 3:00). La app recuerda el último descanso elegido en cada ejercicio. En Perfil se elige el descanso de siempre (0:30 a 5:00) y si empieza solo o queda listo para iniciarlo.
- **Un ejercicio a la vez** (pedido tras la primera prueba): "Terminar ejercicio" lo pliega en una línea con sus series y su mejor serie; tocarla lo reabre. Queda guardado (`workout_exercises.completed_at`, migración 0002).
- **Terminar:** confirmación y resumen con duración, ejercicios, series, volumen y récords. Sin series, se ofrece descartar.
- **Historial:** lista de entrenamientos terminados y detalle de cada uno.
- **Recuperación:** todo se guarda al instante; tras cerrar la app, el entrenamiento abierto sigue ahí.
- Probado de punta a punta en la versión web: dos entrenamientos, rendimiento anterior, récord de peso e historial.

**Queda pendiente de M3:** el flujo E2E con Maestro. Necesita un emulador o un teléfono conectado por cable al computador; se hace cuando se prepare la primera build de desarrollo (M7 o antes).

## M4, rutinas y ejercicios (en curso)

**Hecho: rutinas.**

- Inicio muestra "Tus rutinas", "Nueva rutina" y "Entrenamiento libre".
- Editor de rutinas: nombre, ejercicios en orden (subir, bajar, quitar), series, reps fijas o rango, RIR y descanso por ejercicio. Todo se valida antes de guardar y se guarda junto; salir con cambios pide confirmar.
- Pantalla de la rutina: ejercicios con sus objetivos, "Empezar entrenamiento", "Editar" y borrar (con confirmación). Si hay un entrenamiento abierto, ofrece continuarlo.
- Empezar desde una rutina copia su nombre, los ejercicios, los objetivos y el descanso al entrenamiento (migración 0003). Editar o borrar la rutina después no cambia lo ya entrenado.
- En el entrenamiento: el nombre de la rutina arriba, "Objetivo: 4 × 6–8 · RIR 2" en el ejercicio en curso y los siguientes como líneas pendientes; al terminar uno, se abre el siguiente.
- Prioridad del descanso: el elegido en la barra durante el entrenamiento, luego el de la rutina, luego el recordado para el ejercicio y al final el de Perfil.
- El historial y el resumen muestran el nombre de la rutina.

**Falta:**

1. Ejercicios personalizados (crear, editar, ocultar), con los tipos de registro que faltan (ver abajo).
2. Superseries (A1, A2) en rutinas y en el entrenamiento activo.
3. Reordenar las rutinas en Inicio.

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
- M3: entrenamiento libre (sin rutina) primero; las rutinas llegan en M4. Nunca hay dos entrenamientos abiertos: "Empezar" retoma el que quedó.
- M3: solo se editan entrenamientos abiertos. Corregir uno terminado desde el historial queda para M5.
- M3: los récords se calculan contra el historial al mostrar el resumen; guardarlos en una tabla llega con M5 (gráficos).
- M3: las rutas tipadas de Expo Router están apagadas (`app.json`). En Windows el generador toma archivos de `src/` como rutas y rompe la revisión de tipos; el CI nunca las revisó.

## Notas para trabajar en el proyecto

- Instala dependencias con `npx expo install <paquete>` para que calcen con SDK 57. En entornos donde `api.expo.dev` está bloqueado, antepone `EXPO_OFFLINE=1`.
- Antes de dar algo por terminado: `npm run typecheck`, `npm run lint`, `npm run format:check` y `npm test`. El CI corre lo mismo.
- La versión web (`npx expo export --platform web`) sirve para revisar pantallas sin teléfono. Requiere las cabeceras de aislamiento de origen descritas en [`ARCHITECTURE.md`](ARCHITECTURE.md). En Windows, `npx expo start --web` falla al empaquetar el worker de expo-sqlite ("Worker chunk not found"); la exportación sí funciona.
- Probada en un Android real con Expo Go (28 de septiembre de 2026, antes de M2). M2 y M3 se probaron en la versión web; falta confirmarlos en el teléfono. Tras cambios en `babel.config.js` o `metro.config.js`, reinicia con `npx expo start --clear`.
- La biblioteca incluida se edita en `src/db/seed/exercise-catalog.ts`. Un slug nunca se renombra ni se quita: los entrenamientos guardados lo usan.
