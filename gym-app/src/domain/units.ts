// Conversión de peso (skill gym-domain, "WEIGHT").
// Regla: el peso se guarda en kilogramos con toda su precisión y se convierte solo al mostrarlo.

export type WeightUnit = "kg" | "lb";

/** Kilogramos por libra, exacto por definición internacional (1959). */
export const KG_PER_LB = 0.45359237;

function assertFinite(value: number): void {
  if (!Number.isFinite(value)) throw new RangeError(`Peso no numérico: ${value}`);
}

/** Convierte un peso ingresado en `unit` a kilogramos, sin redondear. */
export function toKg(value: number, unit: WeightUnit): number {
  assertFinite(value);
  return unit === "kg" ? value : value * KG_PER_LB;
}

/** Convierte kilogramos guardados a la unidad en que se van a mostrar, sin redondear. */
export function fromKg(kg: number, unit: WeightUnit): number {
  assertFinite(kg);
  return unit === "kg" ? kg : kg / KG_PER_LB;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  return fromKg(toKg(value, from), to);
}

/**
 * Redondea para mostrar en pantalla al múltiplo más cercano de `step` (por ejemplo 0,5 kg o 0,1 lb).
 * Solo para presentación: nunca se usa antes de guardar.
 */
export function roundForDisplay(value: number, step: number): number {
  assertFinite(value);
  if (!(step > 0)) throw new RangeError(`Paso de redondeo inválido: ${step}`);
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number((Math.round(value / step) * step).toFixed(decimals));
}
