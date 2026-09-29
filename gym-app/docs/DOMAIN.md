# Reglas del dominio

Funciones puras en `src/domain/`, sin React ni base de datos, cada una con sus tests. Estas reglas son parte del producto: cambiarlas cambia los números que ve la persona.

## Peso (`units.ts`)

- Se guarda en kilogramos, sin redondear. 1 lb = 0,45359237 kg (exacto).
- `roundForDisplay(valor, paso)` redondea solo para mostrar, por ejemplo a 0,5 kg.
- Un valor no numérico (`NaN`, infinito) es un error de programación y lanza `RangeError`.

## Volumen (`volume.ts`)

| Tipo de ejercicio                 | Volumen                                         |
| --------------------------------- | ----------------------------------------------- |
| Peso y reps, bilateral            | peso × reps                                     |
| Peso y reps, unilateral           | peso × reps × 2 (reps y peso anotados por lado) |
| Con dos cargas (`loadCount: 2`)   | lo anterior × 2 (se anota el peso de una carga) |
| Peso corporal, tiempo o distancia | `null`: no tiene volumen en kg                  |

- **Dos mancuernas se anotan con el peso de una** (decidido el 28 de septiembre de 2026). Un press con dos mancuernas de 30 kg se anota "30 kg" y su volumen es 30 × reps × 2. Una zancada con dos mancuernas es unilateral y de dos cargas: × 4. Los récords de peso y el 1RM estimado usan el peso anotado, el de una mancuerna.
- Solo cuentan series completadas con peso y reps conocidos y no negativos.
- El total excluye el calentamiento, salvo que se pida `includeWarmups`.

## 1RM estimado (`one-rep-max.ts`)

- Fórmula de Epley: `peso × (1 + reps / 30)`.
- Con 1 rep, el 1RM es el propio peso.
- Solo para peso y reps, con peso > 0 y reps enteras entre 1 y 12. Fuera de eso devuelve `null`.

## Récords personales (`personal-records.ts`)

| Récord                | Definición                                                    |
| --------------------- | ------------------------------------------------------------- |
| `heaviest_weight`     | Mayor peso en una serie válida                                |
| `best_e1rm`           | Mayor 1RM estimado de una serie válida                        |
| `most_reps_at_weight` | Más reps con un peso ya levantado antes (comparado en gramos) |
| `best_session_volume` | Mayor volumen del ejercicio en una sesión                     |

- **Serie válida:** completada, no es calentamiento, peso > 0 y reps enteras ≥ 1.
- Hay récord solo si se supera la marca estrictamente; empatar no cuenta.
- La primera sesión de un ejercicio fija la marca base sin reportar récords.
- Se reporta como máximo un récord de reps por sesión: el del peso más alto.
- Los ejercicios sin peso no generan récords en kg.
- El resultado no depende del orden de las series.

## Búsqueda de ejercicios (`exercise.ts`)

- Busca en el nombre en español y en inglés, sin importar tildes ni mayúsculas.
- Cada palabra escrita tiene que aparecer, en cualquier orden: "banca press" encuentra "Press de banca".
- El filtro de músculo mira solo el músculo principal.
- Los resultados se ordenan alfabéticamente en el idioma de la app.

## Estados de un entrenamiento (`workout-session.ts`)

```
planned ─start→ active ─pause→ paused ─resume→ active
active / paused ─finish→ completed
planned / active / paused ─abandon→ abandoned
```

- `completed` y `abandoned` son finales. Un entrenamiento abandonado se conserva con su hora de término.
- Una transición no permitida devuelve el error `invalid_transition`. Una hora anterior al inicio o a la pausa devuelve `time_went_backwards`.
- `activeDurationMs()` descuenta todas las pausas, incluida una pausa abierta.
- Las horas son milisegundos UTC.
