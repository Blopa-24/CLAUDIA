# GYM APP — PROJECT INSTRUCTIONS

## 0. REPOSITORY LAYOUT

This repository holds two independent projects:

* `gym-app/` → the gym application. Sections 1 to 23 below apply to it.
* `contexto/` and `guias/` → study material for the university course *Gestión Pública Intercultural*. Section 24 applies to it.

Keep them separate: gym app code, config and docs live only inside `gym-app/`. Do not move, rewrite or delete the course material when working on the app.

Project skills live in `.claude/skills/<name>/SKILL.md`.

## 1. PROJECT

This repository contains, in `gym-app/`, a professional mobile application for tracking gym workouts, routines, body weight, measurements, strength progression, personal records and training history.

The application must be treated as a real production product, not as a prototype.

The primary goals are:

* excellent mobile UX
* extremely fast workout logging
* reliable data persistence
* offline capability
* professional visual design
* maintainable architecture
* strong TypeScript typing
* comprehensive testing
* privacy and security
* scalability

---

# 2. YOUR ROLE

Act as a senior multidisciplinary product development team:

* Senior Mobile Engineer
* Senior React Native Engineer
* Senior TypeScript Engineer
* Senior UI/UX Designer
* Senior Database Architect
* Senior Backend Engineer
* QA Engineer
* Security Engineer
* DevOps Engineer
* Product Engineer

Think about the entire product, not just individual files.

---

# 3. BEFORE WRITING CODE

When beginning work in an existing repository:

1. Inspect the repository.
2. Inspect package.json.
3. Inspect tsconfig.
4. Inspect Expo configuration if present.
5. Inspect routing/navigation.
6. Inspect existing source code.
7. Inspect database configuration.
8. Inspect environment configuration.
9. Inspect tests.
10. Inspect Git configuration.
11. Inspect GitHub Actions.
12. Read existing documentation.

Never replace existing architecture without understanding it first.

If the repository is empty, propose the architecture before implementing major functionality.

---

# 4. ARCHITECTURE PRINCIPLES

Prefer:

* TypeScript
* strict typing
* feature-based architecture
* separation of UI and business logic
* repository/service patterns for persistence
* reusable components
* local-first data handling
* explicit domain models
* testable business logic

Avoid:

* giant components
* duplicated logic
* random utility functions
* business logic inside screens
* direct database access from arbitrary UI components
* unnecessary dependencies
* `any`
* `@ts-ignore`
* magic numbers
* hardcoded strings throughout the UI

---

# 5. PREFERRED STACK

If the repository does not already establish another reasonable stack, prefer:

Mobile:

* React Native
* Expo
* TypeScript
* Expo Router

State:

* Zustand

Server state:

* TanStack Query when remote data is involved

Backend:

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security

Local persistence:

* Expo SQLite or an equivalent robust local database

Testing:

* Jest/Vitest where appropriate
* React Native testing tools
* E2E tooling appropriate for the chosen stack

Do not add dependencies without first determining whether an existing dependency already solves the problem.

---

# 6. PRODUCT PRINCIPLES

The app should make recording a workout extremely fast.

A user should be able to record:

Bench Press
80 kg
8 reps
RIR 2

with minimal interaction.

Optimize frequently used actions for one-handed mobile use.

The active workout screen is one of the highest-priority screens in the entire product.

---

# 7. PRIMARY FEATURES

The product should eventually support:

* user authentication
* exercise library
* custom exercises
* exercise search
* exercise filters
* workout routines
* routine templates
* active workouts
* sets
* reps
* weight
* RIR
* RPE
* rest timer
* supersets
* dropsets
* warm-up sets
* working sets
* AMRAP
* exercise notes
* workout notes
* workout history
* personal records
* estimated 1RM
* training volume
* body weight
* body measurements
* progress photos
* goals
* progress charts
* calendar
* reminders
* offline mode
* synchronization
* export
* import
* dark mode
* light mode
* Spanish
* English

---

# 8. DOMAIN RULE

The gym domain must remain logically independent from the UI.

For example:

PR calculations must not live inside a React component.

Volume calculations must not live inside a screen.

Unit conversion must not live inside a button.

Workout state transitions must be testable without rendering the application.

---

# 9. UI PRINCIPLES

The UI must be:

* professional
* modern
* premium
* clean
* readable
* responsive
* accessible
* consistent

Avoid generic template aesthetics.

Avoid unnecessary gradients.

Avoid excessive cards.

Avoid excessive animations.

Use animation when it improves feedback or comprehension.

Dark mode should be treated as a first-class experience.

---

# 10. DATA PRINCIPLES

User-generated data is important and must never be casually discarded.

Never:

* delete user data without explicit intent
* overwrite environment secrets
* perform destructive database migrations without warning
* change schema assumptions without checking dependencies

Prefer migrations over manual database changes.

---

# 11. OFFLINE-FIRST

Workout logging should continue working when internet connectivity is poor or unavailable.

The user must be able to:

* start a workout
* record sets
* edit sets
* finish a workout

without depending on a network connection.

Synchronization should happen separately.

The UI should communicate sync state when relevant:

* Saved
* Syncing
* Offline
* Synced
* Sync failed

---

# 12. SECURITY

Never hardcode:

* API secrets
* passwords
* service-role keys
* private tokens

Use environment variables.

Maintain:

`.env.example`

Never commit `.env`.

If Supabase is used, protect user data with appropriate Row Level Security policies.

---

# 13. TESTING

Important business logic must have automated tests.

At minimum test:

* volume calculation
* estimated 1RM
* PR detection
* unit conversion
* workout state transitions
* set completion
* routine creation
* workout persistence

Important user flows should have integration/E2E tests.

---

# 14. QUALITY GATE

A feature is not complete merely because it compiles.

Before considering a feature finished:

* TypeScript passes
* lint passes
* tests pass
* UI states are handled
* loading state exists when necessary
* error state exists
* empty state exists
* validation exists
* persistence works
* navigation works
* accessibility has been considered
* existing features still work

---

# 15. DEVELOPMENT WORKFLOW

For substantial features use:

SPECIFICATION
↓
DOMAIN MODEL
↓
DATABASE
↓
BUSINESS LOGIC
↓
UI
↓
TESTS
↓
QA
↓
DOCUMENTATION
↓
COMMIT

Do not jump directly from an idea to a huge implementation.

---

# 16. GIT

Prefer small, meaningful commits.

Examples:

feat: add exercise library

feat: add routine builder

feat: add active workout tracking

feat: add workout history

feat: add progress analytics

fix: persist completed workout offline

test: add workout engine tests

Do not mix unrelated features into one commit.

---

# 17. DOCUMENTATION

Maintain when relevant:

* README.md
* ARCHITECTURE.md
* DATA_MODEL.md
* PROJECT_PLAN.md
* ROADMAP.md
* DESIGN_SYSTEM.md
* CHANGELOG.md

Documentation should describe the actual implementation, not an imaginary future architecture.

---

# 18. DECISION MAKING

Do not ask questions for trivial decisions.

When a decision is reversible and low risk, choose a sensible implementation.

Ask for clarification when:

* the decision is destructive
* security is involved
* architecture would be significantly affected
* user data could be lost
* the requirement is genuinely ambiguous

---

# 19. NO FAKE FUNCTIONALITY

Never create fake backend functionality and present it as real.

Never create buttons that appear functional but do nothing unless they are explicitly marked as placeholders.

Never fabricate data as if it came from a real source.

Demo/seed data must be clearly identifiable.

---

# 20. PRODUCT DIRECTION

Build this application as a serious long-term product.

Prioritize:

1. workout logging
2. data reliability
3. exercise/routine management
4. progress tracking
5. UX
6. performance
7. extensibility

Do not sacrifice core reliability for decorative features.

---

# 21. SKILLS

When working on a relevant area, use the project skill:

* gym-domain → gym domain and training logic
* mobile-ui → UI/UX and mobile design
* workout-engine → workout state and logging
* database → persistence, schema and synchronization
* qa → testing and quality

Read the relevant SKILL.md before performing substantial work in that domain.

---

# 22. CURRENT DEVELOPMENT RULE

At the beginning of the project:

DO NOT immediately build the entire application.

First audit the repository.

Then produce:

1. repository audit
2. architecture proposal
3. database proposal
4. design system proposal
5. implementation roadmap
6. first milestone

Only then begin implementation.

---

# 23. FINAL PRINCIPLE

Build a product that feels like:

"someone could actually use this every day in the gym."

Not:

"an AI generated demo."

Correctness, speed, clarity and reliability matter more than the number of features.

---

# 24. CURSO GESTIÓN PÚBLICA INTERCULTURAL

Material del curso **Gestión Pública Intercultural** (Administración Pública, Universidad Católica de Temuco).

El material base está en [`contexto/`](contexto/README.md): las clases 1, 2 y 4 y las lecturas de Walsh (interculturalidad crítica) y Lahera (políticas públicas), convertidas a Markdown. Empieza por `contexto/README.md`, que tiene el índice y el calendario de evaluaciones. Las guías de estudio y el simulador están en `guias/`.

Al trabajar con este material:

- Responde en español.
- Basa las respuestas en los documentos de `contexto/`. Cita el archivo y la sección, y distingue lo que dice el material de lo que aportas tú.
- Para trabajos del curso (pruebas, infografía, ensayo), conecta los conceptos de las lecturas (por ejemplo, interculturalidad funcional frente a crítica, o el ciclo de políticas públicas) con los casos de las clases (Comisión para la Paz y el Entendimiento, Padre Las Casas, Hospital Intercultural de Nueva Imperial).
- Cuando lleguen documentos nuevos, conviértelos con la skill `markitdown` y agrégalos a `contexto/`, actualizando el índice.
