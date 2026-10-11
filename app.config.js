// Estende o app.json (que o Expo passa como `config`) só com o que vem de variável de ambiente:
// a chave do Maps SDK for Android, usada pelo react-native-maps em builds nativos (no Expo Go o
// mapa usa a chave do próprio Expo). Defina GOOGLE_MAPS_ANDROID_API_KEY no .env — veja .env.example.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY },
    },
  },
});
