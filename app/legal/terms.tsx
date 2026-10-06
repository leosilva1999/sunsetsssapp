import { LegalDocumentScreen } from "@/src/components/LegalDocumentScreen";
import { legalApi } from "@/src/api/legal";

export default function TermsScreen() {
  return <LegalDocumentScreen title="Termos de Uso" queryKey={["legal", "terms"]} fetchDocument={legalApi.getTerms} />;
}
