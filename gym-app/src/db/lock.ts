/**
 * Cola de tareas: cada una empieza cuando termina la anterior, falle o no.
 *
 * La base se usa a través de sqlite-proxy, que manda BEGIN y COMMIT como consultas sueltas; si
 * otra consulta llegara en medio, quedaría dentro de la transacción ajena. Pasar todo por esta
 * cola lo evita.
 */
export type Lock = <T>(task: () => Promise<T>) => Promise<T>;

export function createLock(): Lock {
  let tail: Promise<unknown> = Promise.resolve();
  return <T>(task: () => Promise<T>): Promise<T> => {
    const result = tail.then(task, task);
    tail = result.catch(() => undefined);
    return result;
  };
}
