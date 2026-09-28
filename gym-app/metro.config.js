// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite en web usa SQLite compilado a WebAssembly.
config.resolver.assetExts.push("wasm");

// Las migraciones de Drizzle (src/db/migrations/*.sql) se importan como código.
config.resolver.sourceExts.push("sql");

// …y necesita SharedArrayBuffer, que el navegador solo habilita con aislamiento de origen.
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  middleware(req, res, next);
};

module.exports = config;
