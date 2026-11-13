import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const INSTALL_ID_KEY = "sunsetsss.installId";
let cached: string | null = null;

// UUID por instalação do app (docs/API.md, `POST /users/me/devices`): quando o sistema troca o token
// de push do mesmo aparelho, a API atualiza a linha em vez de duplicar. Fica no SecureStore.
export async function getInstallId(): Promise<string> {
  if (cached) return cached;
  try {
    let id = await SecureStore.getItemAsync(INSTALL_ID_KEY);
    if (!id) {
      id = Crypto.randomUUID();
      await SecureStore.setItemAsync(INSTALL_ID_KEY, id);
    }
    cached = id;
  } catch {
    // SecureStore indisponível: um id só pra esta execução (o aparelho será registrado de novo).
    cached = Crypto.randomUUID();
  }
  return cached;
}
