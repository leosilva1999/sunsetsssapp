import type { ReactNode } from "react";
import type { UserRole } from "../../types/entities";
import { useAuthStore } from "../../stores/authStore";
import { ComingSoon } from "./ComingSoon";

interface RoleGateProps {
  allow: UserRole[];
  children: ReactNode;
}

/** Esconde telas de moderação de quem não tem o papel exigido — seção 5.12. O backend já
 *  recusa (403) essas chamadas pra quem não tem o papel; isso é só a UX de não oferecer a
 *  tela, não uma camada de segurança por si só. */
export function RoleGate({ allow, children }: RoleGateProps) {
  const role = useAuthStore((s) => s.user?.role);

  if (!role || !allow.includes(role)) {
    return (
      <ComingSoon
        headerTitle="Acesso restrito"
        icon="lock-closed-outline"
        title="Acesso restrito"
        description="Esta área é exclusiva pra moderadores e administradores."
      />
    );
  }

  return <>{children}</>;
}
