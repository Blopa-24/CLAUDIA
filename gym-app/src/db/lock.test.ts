import { createLock } from "./lock";

const tick = () => new Promise((resolve) => setTimeout(resolve, 1));

describe("createLock", () => {
  it("corre las tareas de a una, en el orden en que llegan", async () => {
    const lock = createLock();
    const log: string[] = [];
    const task = (name: string) => async () => {
      log.push(`${name}:inicio`);
      await tick();
      log.push(`${name}:fin`);
      return name;
    };
    const results = await Promise.all([lock(task("a")), lock(task("b")), lock(task("c"))]);
    expect(results).toEqual(["a", "b", "c"]);
    expect(log).toEqual(["a:inicio", "a:fin", "b:inicio", "b:fin", "c:inicio", "c:fin"]);
  });

  it("si una tarea falla, avisa el error y la siguiente corre igual", async () => {
    const lock = createLock();
    const failing = lock(async () => {
      throw new Error("falló");
    });
    const next = lock(async () => "sigue");
    await expect(failing).rejects.toThrow("falló");
    await expect(next).resolves.toBe("sigue");
  });
});
