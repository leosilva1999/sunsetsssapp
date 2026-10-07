import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { legalApi } from "../api/legal";
import type { LegalDocumentType } from "../types/entities";

export function useLegalDocument(type: LegalDocumentType) {
  return useQuery({
    queryKey: ["legal", type === "TermsOfService" ? "terms" : "privacy"],
    queryFn: type === "TermsOfService" ? legalApi.getTerms : legalApi.getPrivacy,
  });
}

// Cada save cria uma versão nova (seção 5.12) — sem edição in-loco.
export function useSaveLegalDocument(type: LegalDocumentType) {
  const queryClient = useQueryClient();
  const queryKey = ["legal", type === "TermsOfService" ? "terms" : "privacy"];
  return useMutation({
    mutationFn: (content: string) =>
      type === "TermsOfService" ? legalApi.putTerms(content) : legalApi.putPrivacy(content),
    onSuccess: (doc) => queryClient.setQueryData(queryKey, doc),
  });
}
