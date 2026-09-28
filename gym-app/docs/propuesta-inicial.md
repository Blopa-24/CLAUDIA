# Propuesta inicial: app de gimnasio

**Estado:** propuesta, pendiente de aprobación. No hay código todavía.
**Fecha:** 28 de septiembre de 2026.
**Base:** `CLAUDE.md` (secciones 1 a 23) y las skills `gym-domain`, `workout-engine`, `database`, `mobile-ui` y `qa`.

Este documento cubre los seis entregables de la sección 22 del `CLAUDE.md`: auditoría, arquitectura, base de datos, design system, hoja de ruta y primer hito. Cuando exista código, esta propuesta se convertirá en `ARCHITECTURE.md`, `DATA_MODEL.md`, `DESIGN_SYSTEM.md` y `ROADMAP.md`, que describirán lo implementado.

---

## 1. Auditoría del repositorio

Revisé los 12 puntos de la sección 3.

| Punto                 | Estado                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Repositorio           | Contiene dos proyectos: esta app (`gym-app/`, vacía) y el material del curso de Gestión Pública Intercultural (`contexto/`, `guias/`). |
| `package.json`        | No existe.                                                                                                                             |
| `tsconfig`            | No existe.                                                                                                                             |
| Configuración de Expo | No existe.                                                                                                                             |
| Rutas y navegación    | No existen.                                                                                                                            |
| Código fuente         | No hay código de la app. En `guias/generador/` hay scripts de Node del curso, que no se relacionan con la app.                         |
| Base de datos         | No existe.                                                                                                                             |
| Variables de entorno  | No hay `.env` ni `.env.example`.                                                                                                       |
| Tests                 | No existen.                                                                                                                            |
| Git                   | Una rama, `claude/epic-shannon-dkm9rd`. No hay `.gitignore`.                                                                           |
| GitHub Actions        | No existen.                                                                                                                            |
| Documentación         | `CLAUDE.md` y 5 skills de la app en `.claude/skills/`, más la skill `markitdown` del curso.                                            |

**Conclusión:** la app parte desde cero, así que no hay arquitectura previa que respetar.

**Tres puntos a tener en cuenta:**

1. **Falta un `.gitignore`.** Hay que crearlo antes del primer `npm install`; si no, se subirían `node_modules` y, más adelante, el `.env`.
2. **El entorno de desarrollo es un contenedor en la nube, sin emulador de teléfono.** Aquí se pueden correr el typecheck, el lint y todos los tests. La app se prueba en tu teléfono con **Expo Go** o con un _development build_.
3. **Conviene separar la app del curso a futuro.** Por ahora conviven sin problema, cada uno en su carpeta. Si la app crece, lo más limpio es moverla a su propio repositorio.

---

## 2. Arquitectura propuesta

### 2.1 Stack

Son las versiones estables de hoy. Al crear el proyecto se usarán las que fije la plantilla de Expo.

| Área               | Elección                                        | Versión                  | Por qué                                                                                                                |
| ------------------ | ----------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Framework          | Expo + React Native                             | SDK 57 / RN 0.87         | Es el stack preferido en el `CLAUDE.md`.                                                                               |
| Navegación         | Expo Router                                     | 57                       | Rutas por archivos, _deep links_ y tipado de rutas.                                                                    |
| Lenguaje           | TypeScript en modo `strict`                     | la que fije la plantilla | Además: `noUncheckedIndexedAccess`, sin `any` ni `@ts-ignore` (sección 4).                                             |
| Base local         | expo-sqlite                                     | 57                       | Base relacional real en el teléfono, con transacciones e índices.                                                      |
| Acceso a datos     | Drizzle ORM + drizzle-kit                       | 0.45 / 0.31              | Esquema tipado y migraciones versionadas sobre SQLite. Los tipos del esquema son los mismos que usan los repositorios. |
| Estado de UI       | Zustand                                         | 5                        | Solo para estado efímero de la interfaz. La fuente de verdad es SQLite.                                                |
| Validación         | Zod                                             | 4                        | Valida datos en los bordes: formularios, importación y respuestas remotas.                                             |
| Idiomas            | i18next + react-i18next                         | 26 / 17                  | Español e inglés, sin textos escritos directo en las pantallas (sección 4).                                            |
| Tests              | Jest (jest-expo) + React Native Testing Library | 57 / 14                  | Un solo runner para el dominio y los componentes.                                                                      |
| E2E                | Maestro                                         | —                        | Flujos completos en un dispositivo real o emulador (a partir de M3).                                                   |
| Backend (M6)       | Supabase: Auth, Postgres y RLS                  | supabase-js 2            | Solo cuando llegue la sincronización.                                                                                  |
| Estado remoto (M6) | TanStack Query                                  | 5                        | Solo para datos remotos, como indica la sección 5.                                                                     |

**Alternativa a Drizzle:** usar SQL escrito a mano con un migrador propio. Tiene una dependencia menos, pero hay que mantener a mano los tipos de cada consulta. Recomiendo Drizzle porque la sección 4 prioriza el tipado fuerte.

### 2.2 Capas

La lógica del gimnasio no depende de la interfaz ni de la base de datos (sección 8):

```
app/ (rutas de Expo Router)
  └─ features/<feature>/ui        pantallas y componentes
       └─ features/<feature>/hooks    conectan la UI con los casos de uso
            └─ features/<feature>/services   casos de uso: iniciar entrenamiento, completar serie…
                 ├─ domain/          funciones puras: volumen, 1RM, récords, conversión, máquina de estados
                 └─ db/repositories   único punto de acceso a SQLite
                      └─ db/schema + db/migrations
sync/ (M6)   cola de sincronización, separada de todo lo anterior
```

**Reglas de dependencia.** Las reviso con ESLint (`no-restricted-imports`) para que no dependan de la memoria de nadie:

- `domain/` no importa nada de React, React Native ni la base de datos.
- Las pantallas nunca importan `db/`. Siempre pasan por un hook y un servicio.
- `sync/` lee y escribe a través de los repositorios, nunca desde la UI.

### 2.3 Estructura de carpetas

```
gym-app/
├── app/                      rutas (Expo Router)
│   ├── (tabs)/               inicio, historial, ejercicios, progreso, perfil
│   └── workout/[id].tsx      entrenamiento activo
├── src/
│   ├── domain/               tipos y funciones puras, con sus tests al lado
│   ├── features/
│   │   ├── workout/          ui/ hooks/ services/
│   │   ├── routines/
│   │   ├── exercises/
│   │   ├── history/
│   │   └── body/
│   ├── db/                   schema.ts, migrations/, repositories/, seed/
│   ├── ui/                   design system: tokens, tema, componentes base
│   ├── i18n/                 es.json, en.json
│   └── lib/                  utilidades acotadas (ids, fechas, logger)
├── e2e/                      flujos de Maestro
├── docs/
├── .env.example
└── package.json
```

### 2.4 Decisiones de fondo

- **El entrenamiento activo se guarda en SQLite en cada acción.** Zustand solo guarda la posición del cursor (qué ejercicio y qué serie) y el temporizador. Si la app se cierra, se reconstruye desde la base (`workout-engine`: _"Never rely exclusively on an in-memory React state"_).
- **Unidades:** el peso se guarda en kilogramos con toda su precisión. También se guarda la unidad en que se ingresó, para mostrar exactamente lo que la persona escribió (100 lb se vuelve a ver como 100 lb, no como 99,9).
- **Fechas:** en milisegundos UTC. Se convierten a la zona horaria del teléfono solo al mostrarlas.
- **IDs:** UUID generados en el teléfono, así se puede crear datos sin conexión y sincronizarlos después sin choques.
- **Errores:** los servicios devuelven resultados tipados (éxito o error con un código). La UI traduce cada código a un mensaje.

---

## 3. Base de datos propuesta

### 3.1 Principios

- **SQLite en el teléfono es la fuente de verdad** para registrar entrenamientos. Supabase llega en M6 como copia sincronizada.
- **Todas las tablas importantes llevan** `id`, `created_at`, `updated_at` y `deleted_at` desde el primer día. El borrado es lógico: un ejercicio borrado no deja ilegibles los entrenamientos antiguos.
- **Rutina e historial son cosas distintas.** Al iniciar un entrenamiento se copian el nombre de la rutina y de cada ejercicio (_snapshot_). Editar una rutina después no cambia el historial.
- **Las migraciones son versionadas y reproducibles.** Una migración destructiva requiere un aviso previo y un respaldo.

### 3.2 Tablas

Estas son las tablas locales de M2 a M5. Las columnas marcadas "M6" se agregan con la sincronización.

**`exercises`**: biblioteca de ejercicios, de sistema y personalizados.
`id` · `name` · `is_custom` · `primary_muscle` · `secondary_muscles` (JSON) · `equipment` · `movement_pattern` · `laterality` (bilateral/unilateral) · `tracking_type` (peso y reps / solo reps / tiempo / distancia) · `notes`

**`routines`** y **`routine_exercises`**: el plan.
`routines`: `id` · `name` · `notes` · `position`
`routine_exercises`: `id` · `routine_id` · `exercise_id` · `position` · `superset_group` · `target_sets` · `target_reps_min` · `target_reps_max` · `target_rir` · `rest_seconds` · `notes`

**`workout_sessions`**: lo que realmente se hizo.
`id` · `routine_id` (puede ser nulo) · `routine_name_snapshot` · `status` (planned/active/paused/completed/abandoned) · `started_at` · `ended_at` · `notes`

**`workout_exercises`**
`id` · `session_id` · `exercise_id` · `exercise_name_snapshot` · `position` · `superset_group` · `notes`

**`sets`**
`id` · `workout_exercise_id` · `position` · `type` (warmup/working/dropset/failure/amrap) · `weight_kg` · `entered_unit` (kg/lb) · `reps` · `rir` · `rpe` · `duration_s` · `distance_m` · `rest_s` · `completed_at` · `parent_set_id` (enlaza cada tramo de un dropset con su serie principal) · `notes`

**`personal_records`**
`id` · `exercise_id` · `set_id` · `kind` (peso máximo / reps a un peso / 1RM estimado / volumen) · `value` · `achieved_at`

**`body_weight_entries`**: `id` · `weight_kg` · `entered_unit` · `measured_at`
**`body_measurements`**: `id` · `kind` (cintura, pecho… o personalizada) · `value_cm` · `measured_at`
**`user_settings`**: una sola fila con la unidad preferida, el idioma, el tema y el descanso por defecto.

**M6:** a cada tabla se le suma `user_id`, y aparece la tabla `sync_queue`: `id` · `table` · `row_id` · `operation` · `payload` · `attempts` · `last_error` · `next_retry_at`.

### 3.3 Índices iniciales

Solo en columnas que se consultan de verdad:

- `sets(workout_exercise_id)`
- `workout_exercises(session_id)`
- `workout_exercises(exercise_id)`, para el rendimiento anterior de un ejercicio
- `workout_sessions(started_at)`, para el historial
- `workout_sessions(status)`, para recuperar el entrenamiento activo
- `personal_records(exercise_id, kind)`

### 3.4 Validación

| Campo  | Regla                                                    |
| ------ | -------------------------------------------------------- |
| Peso   | ≥ 0 y ≤ 1.500 kg                                         |
| Reps   | Entero ≥ 0. En AMRAP no hay máximo.                      |
| RIR    | Entero de 0 a 10, o vacío                                |
| RPE    | De 1 a 10 en pasos de 0,5, o vacío                       |
| Fechas | Válidas; `ended_at` no puede ser anterior a `started_at` |

Los límites buscan evitar datos corruptos, no restringir el entrenamiento avanzado.

### 3.5 Supabase (M6)

- Las mismas tablas, con `user_id` y políticas RLS del tipo `user_id = auth.uid()` para leer, crear, editar y borrar.
- Las fotos de progreso van en un bucket **privado**, con URL firmadas.
- La clave `service_role` nunca va en la app.

**Conflictos:** propongo dos estrategias.

- **Series y entrenamientos terminados:** casi no se editan, así que los conflictos serán raros. Gana la última escritura por fila, según `updated_at`.
- **Rutinas y ajustes:** también gana la última escritura, pero se registra un aviso cuando se pisa un cambio hecho en otro dispositivo.

La estrategia se documentará antes de implementar la sincronización.

---

## 4. Design system propuesto

### 4.1 Personalidad

Atlética, tranquila y rápida (skill `mobile-ui`). La app se usa entre series, con el pulso alto y una mano ocupada: los números tienen que leerse de un vistazo.

### 4.2 Color: el código de los discos olímpicos

Propongo tomar los colores de los discos de competición: rojo 25 kg, azul 20 kg, amarillo 15 kg y verde 10 kg. Es un código que cualquiera que entrena reconoce, y le da a la app una identidad propia en vez de una paleta genérica.

| Rol      | Referencia                     | Uso                                                               |
| -------- | ------------------------------ | ----------------------------------------------------------------- |
| Primario | Azul (disco de 20 kg)          | Acción principal, como "Completar serie", y los elementos activos |
| Éxito    | Verde (disco de 10 kg)         | Serie completada, guardado                                        |
| Récord   | Amarillo (disco de 15 kg)      | Récords personales                                                |
| Peligro  | Rojo (disco de 25 kg)          | Borrar, errores                                                   |
| Neutros  | Grafito, con un leve tono azul | Fondos, superficies, bordes y texto                               |

- **El modo oscuro va primero.** Gimnasios con poca luz y pantallas a media intensidad. No es una inversión del modo claro: tiene sus propios tonos y la elevación se marca con superficies más claras, no con sombras.
- **El color nunca es la única señal.** Una serie completada lleva un ícono ✓ y un texto accesible además del verde.
- Los valores hexadecimales exactos se ajustan en M0, validando contraste AA en los dos temas.

### 4.3 Tipografía

- **Textos:** la fuente del sistema (SF Pro en iPhone, Roboto en Android). Es la más legible, no suma peso a la app y respeta el tamaño de letra que la persona configuró.
- **Números grandes** (peso, reps, temporizador): **Barlow Semi Condensed**, con cifras de ancho fijo. Tiene aire de marcador deportivo y permite números grandes en poco espacio.
- **Escala:** 12 · 14 · 16 · 20 · 24 · 32 · 48.

### 4.4 Espacio y forma

- Grilla de 4 puntos.
- **Zonas táctiles de al menos 48 × 48** y botones principales de 56 de alto, al alcance del pulgar.
- Radios pequeños (8 y 12).
- Pocas tarjetas: las listas se separan con espacio y líneas finas (sección 9: _"Avoid excessive cards"_).

### 4.5 Pantalla de entrenamiento activo (boceto)

Sigue el orden de prioridades de la skill `mobile-ui`:

```
┌──────────────────────────────────┐
│ ← Pausar          38:12   Terminar│
├──────────────────────────────────┤
│ Press banca            3 de 4    │  ejercicio y serie actuales
│ Anterior: 80 kg × 8 · RIR 2      │  rendimiento anterior
│                                  │
│   ┌────────┐ ┌──────┐ ┌──────┐   │
│   │ 80,0 kg│ │  8   │ │ RIR 2│   │  peso · reps · RIR (teclado numérico)
│   └────────┘ └──────┘ └──────┘   │
│                                  │
│ ┌──────────────────────────────┐ │
│ │      ✓  Completar serie      │ │  acción principal, al alcance del pulgar
│ └──────────────────────────────┘ │
│  Descanso 01:30   −15  +15  Saltar│  temporizador
├──────────────────────────────────┤
│ 1 ✓ 80 × 8   2 ✓ 80 × 8   3 · · · │  series del ejercicio
└──────────────────────────────────┘
```

**El objetivo:** registrar "80 kg × 8, RIR 2" con **un solo toque** cuando se repite la serie anterior, y con dos o tres toques cuando cambia un valor.

### 4.6 Componentes base

`AppButton` · `NumberInput` (con `WeightInput` y `RepInput` encima) · `SetRow` · `ExerciseHeader` · `RestTimer` · `PRBadge` · `EmptyState` · `ErrorState` · `LoadingState` · `BottomSheet`. Cada uno se diseña con sus estados de carga, vacío, error y deshabilitado.

---

## 5. Hoja de ruta

Cada hito termina con la puerta de calidad de la sección 14 aprobada: typecheck, lint, tests y los estados de UI resueltos.

| Hito                            | Qué entrega                                                                                                                                                                                           | Qué puedes hacer al terminar                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **M0. Base**                    | Proyecto Expo en `gym-app/`, TypeScript estricto, ESLint y Prettier, Jest, CI en GitHub Actions, `.gitignore` y `.env.example`, tokens del tema, i18n es/en y la navegación de pestañas vacía         | Abrir la app en tu teléfono con Expo Go y ver la estructura |
| **M1. Motor de dominio**        | Funciones puras con tests: volumen, 1RM (Epley), conversión kg/lb, detección de récords y la máquina de estados del entrenamiento                                                                     | Nada visible todavía; es la base confiable de todo lo demás |
| **M2. Persistencia local**      | Esquema de SQLite, migraciones, repositorios con tests y una biblioteca inicial de ejercicios, marcada como datos de ejemplo                                                                          | Ver y buscar ejercicios                                     |
| **M3. Entrenamiento activo**    | Iniciar un entrenamiento libre, registrar series rápido, ver el rendimiento anterior, temporizador de descanso, terminar con resumen, recuperar tras un cierre inesperado y el primer E2E con Maestro | **Usar la app en el gimnasio**                              |
| **M4. Rutinas y ejercicios**    | Ejercicios personalizados, filtros, creador de rutinas, iniciar desde una rutina y superseries                                                                                                        | Planificar tu semana                                        |
| **M5. Historial y progreso**    | Historial, récords, gráficos de fuerza y volumen, peso corporal y medidas                                                                                                                             | Ver tu progreso                                             |
| **M6. Cuenta y sincronización** | Cuenta con Supabase, RLS, cola de sincronización con reintentos e indicadores de estado (Guardado, Sincronizando, Sin conexión, Error)                                                                | Respaldo en la nube y uso en varios dispositivos            |
| **M7. Pulido y lanzamiento**    | Exportar e importar (JSON y CSV), recordatorios, fotos de progreso, revisión de accesibilidad y builds con EAS                                                                                        | Publicar                                                    |

El hito que importa es **M3**: es el primer momento en que la app sirve de verdad en el gimnasio. M0 a M2 existen para que M3 sea confiable.

---

## 6. Primer hito: M0 + M1

Propongo empezar con M0 y M1 juntos, porque M1 no necesita pantallas y se puede probar completo en este entorno.

### Tareas y commits previstos

1. `chore: scaffold expo app in gym-app` — plantilla de Expo SDK 57 con Expo Router, TypeScript estricto y `.gitignore`.
2. `chore: add eslint, prettier and import boundaries` — incluye las reglas de dependencia de la sección 2.2.
3. `chore: add jest with jest-expo` — un test de ejemplo que pase.
4. `ci: add typecheck, lint and test workflow` — GitHub Actions en cada push.
5. `feat: add theme tokens and i18n setup` — colores de los dos temas, escala tipográfica, es.json y en.json.
6. `feat: add tab navigation shell` — cinco pestañas con estados vacíos reales, sin botones falsos (sección 19).
7. `feat(domain): add weight conversion` — con tests.
8. `feat(domain): add volume calculation` — con tests. Define explícitamente los casos unilaterales, de peso corporal y de tiempo o distancia.
9. `feat(domain): add estimated 1RM (Epley)` — con tests, y rechaza datos inválidos.
10. `feat(domain): add PR detection` — con definiciones escritas de cada tipo de récord y tests.
11. `feat(domain): add workout session state machine` — planned → active ⇄ paused → completed / abandoned, con tests de cada transición.
12. `docs: add README, ARCHITECTURE and DOMAIN notes` — describen lo implementado.

### Criterios de aceptación

- `npm run typecheck`, `npm run lint` y `npm test` pasan en local y en CI.
- Las funciones del dominio tienen cobertura completa de sus ramas, incluidos los datos inválidos.
- `domain/` no importa React ni la base de datos, y ESLint lo verifica.
- La app abre en Expo Go en modo claro y oscuro, en español e inglés.
- No hay `any`, `@ts-ignore` ni textos escritos directo en las pantallas.

---

## 7. Decisiones que necesito de ti

Para cada punto dejo una propuesta por defecto. Si no me dices otra cosa, sigo con ella.

| Decisión                         | Propuesta por defecto                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Nombre de la app                 | "Gym App" como nombre provisorio                                                                      |
| Idioma por defecto               | Español, con inglés disponible                                                                        |
| Unidad por defecto               | Kilogramos                                                                                            |
| ¿Cuenta obligatoria?             | No. La app funciona sin cuenta desde el principio; la cuenta llega en M6 para respaldar y sincronizar |
| ¿Cómo la vas a probar?           | En tu teléfono con Expo Go. Dime si usas Android o iPhone                                             |
| Biblioteca inicial de ejercicios | Unos 60 ejercicios comunes, con nombres en español e inglés, marcados como datos de ejemplo           |
| Paleta de los discos olímpicos   | Sí                                                                                                    |
