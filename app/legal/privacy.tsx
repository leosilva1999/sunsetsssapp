import { LegalDocumentScreen } from "@/src/components/LegalDocumentScreen";
import { legalApi } from "@/src/api/legal";

export default function PrivacyScreen() {
  return (
    <LegalDocumentScreen title="Política de Privacidade" queryKey={["legal", "privacy"]} fetchDocument={legalApi.getPrivacy} />
  );
}
