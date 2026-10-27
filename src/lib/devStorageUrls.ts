import { API_BASE_URL } from "./env";

// Em dev o storage é o LocalStack (porta 4566) na máquina do backend, e o backend grava a URL
// completa da imagem no banco — com o IP que a máquina tinha na hora do upload. Quando o IP muda
// (outra rede Wi-Fi), as fotos/avatares antigos continuam no bucket, mas a URL gravada aponta pra
// um host que não existe mais. Aqui reescrevemos o host dessas URLs pro da API atual
// (`EXPO_PUBLIC_API_BASE_URL`), que é a mesma máquina que roda o LocalStack.
//
// Só age quando a API é local/rede privada E a URL é `http://<ip-ou-localhost>:4566/...`: contra uma
// API de verdade (host público, storage S3/CDN) isto não faz nada.
const apiHost = /^https?:\/\/([^/:]+)/.exec(API_BASE_URL)?.[1] ?? null;
const PRIVATE_HOST = /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/;
const LOCALSTACK_URL = /^http:\/\/([^/:]+):4566\//;

const enabled = apiHost !== null && PRIVATE_HOST.test(apiHost);

function rewrite(value: unknown): unknown {
  if (typeof value === "string") {
    const match = LOCALSTACK_URL.exec(value);
    if (match && match[1] !== apiHost) return `http://${apiHost}:4566/${value.slice(match[0].length)}`;
    return value;
  }
  if (Array.isArray(value)) return value.map(rewrite);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)]));
  }
  return value;
}

export function rewriteDevStorageUrls<T>(payload: T): T {
  return enabled ? (rewrite(payload) as T) : payload;
}
