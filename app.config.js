const fs = require("fs");

// Estende o app.json (que o Expo passa como `config`) só com o que vem de variável de ambiente ou de
// arquivo que não vai pro repositório:
//  - a chave do Maps SDK for Android, usada pelo react-native-maps em builds nativos (no Expo Go o
//    mapa usa a chave do próprio Expo). Defina GOOGLE_MAPS_ANDROID_API_KEY — veja .env.example;
//  - o `google-services.json` do Firebase, exigido pelo Android pra receber push (FCM). No EAS ele vem
//    de uma variável de ambiente do tipo arquivo (`GOOGLE_SERVICES_JSON`, o Expo entrega o caminho);
//    localmente, de ./google-services.json. Se não existir, a config simplesmente não o inclui — o
//    app continua compilando, só não consegue obter o token de push (o registro falha em silêncio).
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || "./google-services.json";

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(fs.existsSync(googleServicesFile) ? { googleServicesFile } : {}),
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY },
    },
  },
});
