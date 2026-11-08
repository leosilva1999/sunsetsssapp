import type { ReportReason } from "../types/entities";

type ReasonOption = { value: ReportReason; label: string };

// Rótulo pt-BR pra exibição — o valor mandado pra API é sempre o literal em inglês (seção 5.7
// da spec dá os rótulos; docs/API.md exige esses valores exatos). Lista completa: usada pra
// traduzir o motivo de qualquer denúncia na fila de moderação.
export const REPORT_REASONS: ReasonOption[] = [
  { value: "Spam", label: "Spam" },
  { value: "Inappropriate", label: "Inadequado" },
  { value: "Harassment", label: "Assédio" },
  { value: "Other", label: "Outro" },
  { value: "IncorrectInfo", label: "Informação incorreta" },
];

const pick = (...values: ReportReason[]) =>
  values.map((value) => REPORT_REASONS.find((option) => option.value === value)!);

// Foto, comentário e usuário: sem "informação incorreta" (pensada pra locais — docs/API.md).
export const REPORT_REASONS_FOR_CONTENT = pick("Spam", "Inappropriate", "Harassment", "Other");
// Local: "informação incorreta" (pino, nome ou cidade errados) primeiro — um moderador corrige o pino.
export const REPORT_REASONS_FOR_LOCATION = pick("IncorrectInfo", "Spam", "Inappropriate", "Other");
