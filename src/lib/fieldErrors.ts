import { ApiError } from "../api/client";

// Erros de validação da API vêm como `{ title, errors: { Campo: ["mensagem", ...] } | null,
// requestId }` (docs/API.md, "Error format"). Devolve a primeira mensagem de um campo, ou null.
// Todas as mensagens de um campo (ex.: `errors.candidateLocationIds` do 409 de POST /locations).
export function getFieldErrors(error: unknown, field: string): string[] {
  if (!(error instanceof ApiError)) return [];
  const errors = (error.payload as { errors?: Record<string, unknown> | null } | null | undefined)?.errors;
  const value = errors?.[field];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return typeof value === "string" ? [value] : [];
}

export function getFieldError(error: unknown, field: string): string | null {
  if (!(error instanceof ApiError)) return null;
  const errors = (error.payload as { errors?: Record<string, unknown> | null } | null | undefined)?.errors;
  const value = errors?.[field];
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : null;
  return typeof value === "string" ? value : null;
}
