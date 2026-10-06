import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.10: lista paginada, sem botão de seguir (isFollowedByCurrentUser vem sempre false
// nesses dois endpoints — não resolvido pro caller).
export default function FollowersScreen() {
  return <ComingSoon headerTitle="Seguidores" icon="people-outline" title="Seguidores" />;
}
