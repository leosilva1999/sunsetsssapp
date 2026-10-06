import { apiFetch } from "./client";
import type { LegalDocument } from "../types/entities";

// Seção 5.13 — públicas, somente leitura.
export const legalApi = {
  getTerms: () => apiFetch<LegalDocument>("/terms", { auth: false }),
  getPrivacy: () => apiFetch<LegalDocument>("/privacy", { auth: false }),
};
