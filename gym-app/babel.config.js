// https://docs.expo.dev/versions/v57.0.0/config/babel/
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Las migraciones de Drizzle son archivos .sql que se incluyen como texto en la app.
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};
