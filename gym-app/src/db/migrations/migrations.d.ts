// Tipos de migrations.js, que genera drizzle-kit sin tipos. Este archivo no lo genera: se mantiene.
declare const bundle: {
  journal: {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[];
  };
  migrations: Record<string, string>;
};
export default bundle;
