// A biblioteca de anúncios (`react-native-google-mobile-ads`) tem código nativo e AINDA não está
// instalada no projeto: entra só no lançamento com anúncios (exige build novo, App IDs no manifesto
// e as declarações de loja). O `require` é opcional (dentro de try/catch): sem a biblioteca, o
// carregamento devolve `null` e toda a camada de anúncios fica inerte — nada quebra no Expo Go nem
// nos builds atuais.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdsSdk = Record<string, any>;

let cached: AdsSdk | null | undefined;

export function loadAdsSdk(): AdsSdk | null {
  if (cached !== undefined) return cached;
  try {
    cached = require("react-native-google-mobile-ads") as AdsSdk;
  } catch {
    cached = null;
  }
  return cached;
}
