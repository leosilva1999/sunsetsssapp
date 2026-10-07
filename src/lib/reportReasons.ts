import type { ReportReason } from "../types/entities";

// Rótulo pt-BR pra exibição — o valor mandado pra API é sempre o literal em inglês (seção 5.7
// da spec dá os rótulos; docs/API.md exige esses valores exatos).
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "Spam", label: "Spam" },
  { value: "Inappropriate", label: "Inadequado" },
  { value: "Harassment", label: "Assédio" },
  { value: "Other", label: "Outro" },
];
