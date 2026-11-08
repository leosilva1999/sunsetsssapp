import { ApiError } from "../api/client";

function formatUntil(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Login/Google de conta banida respondem 403 `{ title, errors: { reason: [..], bannedUntil?: [..] } }`
// (docs/API.md, "Banned accounts"). Um 403 de papel vem com corpo vazio — mas aqui, no login, só
// existe o ban. Devolve a mensagem pronta pra exibir, ou null se o erro não for esse caso.
export function getBanMessage(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 403) return null;

  const errors = (error.payload as { errors?: Record<string, unknown> | null } | null | undefined)?.errors;
  const first = (value: unknown) => (Array.isArray(value) && typeof value[0] === "string" ? value[0] : null);
  const reason = first(errors?.reason);
  const until = first(errors?.bannedUntil);
  const untilText = until ? formatUntil(until) : null;

  const lines = ["Esta conta está suspensa."];
  if (reason) lines.push(`Motivo: ${reason}`);
  lines.push(untilText ? `A suspensão termina em ${untilText}.` : "A suspensão não tem data para terminar.");
  return lines.join("\n");
}
