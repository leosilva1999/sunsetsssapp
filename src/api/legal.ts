import { apiFetch } from "./client";
import type { LegalAcceptance, LegalDocument } from "../types/entities";
import type { LegalVersions } from "../types/api";

// Seção 5.13 — leitura é pública. Escrita (seção 5.12) é 🛡️ Admin only: cada PUT cria uma
// versão nova (sem edição in-loco), numerada independentemente por documento.
export const legalApi = {
  getTerms: () => apiFetch<LegalDocument>("/terms", { auth: false }),
  getPrivacy: () => apiFetch<LegalDocument>("/privacy", { auth: false }),

  // 🔒 Estado de aceite do usuário logado, fresco (usar pra rechecar, ex.: ao abrir o app).
  getMyAcceptance: () => apiFetch<LegalAcceptance>("/users/me/legal-acceptances"),
  // 🔒 Registra o aceite das versões mostradas — ambas precisam ser as vigentes (400 senão).
  acceptMine: (versions: LegalVersions) =>
    apiFetch<LegalAcceptance>("/users/me/legal-acceptances", { method: "POST", body: versions }),

  putTerms: (content: string) => apiFetch<LegalDocument>("/terms", { method: "PUT", body: { content } }),
  putPrivacy: (content: string) => apiFetch<LegalDocument>("/privacy", { method: "PUT", body: { content } }),
};
