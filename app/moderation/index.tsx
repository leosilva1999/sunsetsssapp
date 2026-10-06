import { RoleGate } from "@/src/components/ui/RoleGate";
import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.12: fila de denúncias, histórico de ações, (admin) editor de termos/privacidade e
// busca/mudança de papel de usuários.
export default function ModerationHomeScreen() {
  return (
    <RoleGate allow={["Moderator", "Admin"]}>
      <ComingSoon
        headerTitle="Moderação"
        icon="shield-checkmark-outline"
        title="Painel de moderação"
        description="Fila de denúncias e histórico de ações — próxima entrega."
      />
    </RoleGate>
  );
}
