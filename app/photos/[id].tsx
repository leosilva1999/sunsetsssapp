import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.7: imagem grande, curtir, autor (seguir), local, legenda, excluir/denunciar,
// comentários com 1 nível de resposta.
export default function PhotoDetailScreen() {
  return (
    <ComingSoon
      headerTitle="Foto"
      icon="image-outline"
      title="Detalhe da foto"
      description="Curtidas, comentários e respostas — próxima entrega."
    />
  );
}
