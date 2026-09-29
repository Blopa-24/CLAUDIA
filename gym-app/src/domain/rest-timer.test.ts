import {
  adjustRest,
  DEFAULT_REST_S,
  formatRestChoice,
  isFinished,
  MAX_REST_S,
  pauseRest,
  readyRest,
  remainingMs,
  REST_PRESETS_S,
  resumeRest,
  startRest,
} from "./rest-timer";

const T0 = 1_000_000;

describe("temporizador de descanso", () => {
  it("parte con 90 s por defecto y cuenta hacia atrás", () => {
    const timer = startRest(T0);
    expect(DEFAULT_REST_S).toBe(90);
    expect(remainingMs(timer, T0)).toBe(90_000);
    expect(remainingMs(timer, T0 + 30_000)).toBe(60_000);
  });

  it("termina en cero y no baja de ahí", () => {
    const timer = startRest(T0, 60);
    expect(isFinished(timer, T0 + 59_999)).toBe(false);
    expect(isFinished(timer, T0 + 60_000)).toBe(true);
    expect(remainingMs(timer, T0 + 120_000)).toBe(0);
  });

  it("en pausa no avanza y al reanudar sigue desde donde quedó", () => {
    const paused = pauseRest(startRest(T0, 60), T0 + 20_000);
    expect(remainingMs(paused, T0 + 50_000)).toBe(40_000);
    const resumed = resumeRest(paused, T0 + 50_000);
    expect(remainingMs(resumed, T0 + 60_000)).toBe(30_000);
  });

  it("pausar dos veces o reanudar algo en marcha no cambia nada", () => {
    const running = startRest(T0);
    const paused = pauseRest(running, T0);
    expect(pauseRest(paused, T0 + 5_000)).toBe(paused);
    expect(resumeRest(running, T0 + 5_000)).toBe(running);
  });

  it("+15 y −15 segundos, sin bajar de cero, también en pausa", () => {
    const timer = startRest(T0, 30);
    expect(remainingMs(adjustRest(timer, T0, 15), T0)).toBe(45_000);
    expect(remainingMs(adjustRest(timer, T0 + 25_000, -15), T0 + 25_000)).toBe(0);
    const paused = pauseRest(timer, T0);
    expect(remainingMs(adjustRest(paused, T0, -15), T0)).toBe(15_000);
    expect(adjustRest(timer, T0, 15).totalS).toBe(45);
    expect(adjustRest(timer, T0, -60).totalS).toBe(0);
  });
});

describe("descanso preparado y opciones", () => {
  it("preparado no corre hasta iniciarlo, y no cuenta como terminado", () => {
    const ready = readyRest(120);
    expect(remainingMs(ready, T0 + 999_999)).toBe(120_000);
    expect(isFinished(readyRest(0), T0)).toBe(false);
    const running = resumeRest(ready, T0);
    expect(remainingMs(running, T0 + 20_000)).toBe(100_000);
  });

  it("pausar uno preparado no hace nada; ajustarlo cambia su duración", () => {
    const ready = readyRest(60);
    expect(pauseRest(ready, T0)).toBe(ready);
    expect(adjustRest(ready, T0, 15)).toEqual({ status: "ready", totalS: 75 });
  });

  it("limita la duración entre 0 y 15 minutos", () => {
    expect(startRest(T0, -30).totalS).toBe(0);
    expect(readyRest(99_999).totalS).toBe(MAX_REST_S);
    expect(adjustRest(startRest(T0, MAX_REST_S), T0, 60).totalS).toBe(MAX_REST_S);
  });

  it("las opciones van de 30 s a 5 min y se escriben como reloj", () => {
    expect(REST_PRESETS_S[0]).toBe(30);
    expect(REST_PRESETS_S[REST_PRESETS_S.length - 1]).toBe(300);
    expect(formatRestChoice(90)).toBe("1:30");
    expect(formatRestChoice(30)).toBe("0:30");
    expect(formatRestChoice(300)).toBe("5:00");
  });
});
