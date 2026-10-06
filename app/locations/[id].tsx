import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.4: nome/cidade/nota, horário do pôr do sol (sunrise-sunset.org, com atribuição),
// mapa, grid de fotos do local, avaliações, avaliar/editar/remover a própria avaliação.
export default function LocationDetailScreen() {
  return (
    <ComingSoon
      headerTitle="Local"
      icon="location-outline"
      title="Detalhe do local"
      description="Sunset de hoje, mapa, fotos e avaliações — próxima entrega."
    />
  );
}
