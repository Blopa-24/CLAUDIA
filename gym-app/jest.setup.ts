// El almacén clave-valor de expo-sqlite es nativo: en los tests se reemplaza por uno en memoria.
jest.mock("expo-sqlite/kv-store", () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: jest.fn(async (key: string) => data.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      data.delete(key);
    }),
  };
  return { __esModule: true, default: storage };
});
