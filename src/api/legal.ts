import { apiFetch } from "./client";
import type { LegalDocument } from "../types/entities";

// Seção 5.13 — leitura é pública. Escrita (seção 5.12) é 🛡️ Admin only: cada PUT cria uma
// versão nova (sem edição in-loco), numerada independentemente por documento.
export const legalApi = {
  getTerms: () => apiFetch<LegalDocument>("/terms", { auth: false }),
  getPrivacy: () => apiFetch<LegalDocument>("/privacy", { auth: false }),

  putTerms: (content: string) => apiFetch<LegalDocument>("/terms", { method: "PUT", body: { content } }),
  putPrivacy: (content: string) => apiFetch<LegalDocument>("/privacy", { method: "PUT", body: { content } }),
};
