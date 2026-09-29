import { randomUUID } from "expo-crypto";

import type { ServiceDeps } from "./workout-service";

/** Reloj e IDs reales del teléfono. Los tests usan los suyos. */
export const deviceDeps: ServiceDeps = { now: () => Date.now(), newId: () => randomUUID() };
