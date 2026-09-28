# GymSuper

App móvil para registrar entrenamientos de gimnasio: rutinas, series, peso corporal, medidas, récords y progreso. Funciona sin conexión.

**Estado:** hitos M0 (base del proyecto) y M1 (motor de dominio) terminados. Todavía no se pueden registrar entrenamientos; eso llega en M3. La hoja de ruta está en [`docs/propuesta-inicial.md`](docs/propuesta-inicial.md).

## Qué hay hoy

- Cinco pestañas: Inicio, Historial, Ejercicios, Progreso y Perfil. Las cuatro primeras están marcadas como "Disponible pronto".
- **Perfil → Color de acento:** azul, violeta, cian o rosa. La elección queda guardada en el teléfono.
- Modo claro y oscuro según el teléfono, y textos en español o inglés según el idioma del teléfono.
- El motor de cálculos (sin interfaz todavía): conversión kg/lb, volumen, 1RM estimado, récords personales y estados de un entrenamiento. Ver [`docs/DOMAIN.md`](docs/DOMAIN.md).

## Probarla en tu Android

Necesitas un computador con [Node.js 22](https://nodejs.org) y la app **Expo Go** instalada desde Google Play.

```bash
git clone https://github.com/Blopa-24/CLAUDIA.git
cd CLAUDIA
git checkout claude/epic-shannon-dkm9rd
cd gym-app
npm install
npx expo start
```

Escanea con Expo Go el código QR que aparece en la terminal. El teléfono y el computador tienen que estar en la misma red Wi-Fi; si no, usa `npx expo start --tunnel`.

## Comandos

| Comando                           | Qué hace                              |
| --------------------------------- | ------------------------------------- |
| `npm start`                       | Servidor de desarrollo de Expo        |
| `npm run typecheck`               | Revisa los tipos de TypeScript        |
| `npm run lint`                    | ESLint, incluidas las reglas de capas |
| `npm run format` / `format:check` | Prettier                              |
| `npm test`                        | Tests con Jest                        |
| `npm run test:coverage`           | Tests con cobertura                   |

El CI de GitHub (`.github/workflows/gym-app-ci.yml`) corre typecheck, lint, formato y tests en cada push que toca `gym-app/`.

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): stack, capas, estructura y decisiones.
- [`docs/DOMAIN.md`](docs/DOMAIN.md): reglas de cálculo del dominio.
- [`docs/propuesta-inicial.md`](docs/propuesta-inicial.md): propuesta aprobada y hoja de ruta.
- Reglas del proyecto: [`CLAUDE.md`](../CLAUDE.md) de la raíz y las skills en `.claude/skills/`. `AGENTS.md` trae las convenciones de Expo SDK 57.
