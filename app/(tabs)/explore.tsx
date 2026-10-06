import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.3 da spec: busca instantânea de locais (full-text 3+ chars) + grid de cards.
export default function ExploreScreen() {
  return (
    <ComingSoon
      icon="compass-outline"
      title="Explorar locais"
      description="Busca de locais por nome/cidade e grid de cards com nota média — próxima entrega."
    />
  );
}
