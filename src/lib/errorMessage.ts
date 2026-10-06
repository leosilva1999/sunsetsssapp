import { ApiError } from "../api/client";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Sem conexão. Verifique sua internet e tente de novo.";
    return error.message || fallback;
  }
  return fallback;
}
