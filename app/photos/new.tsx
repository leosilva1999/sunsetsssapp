import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.8: escolher foto (câmera/galeria) → recortar → buscar/cadastrar local → legenda →
// publicar, com upload em 2 passos via URL pré-assinada (nunca manda o binário pra API).
export default function PostPhotoScreen() {
  return (
    <ComingSoon
      headerTitle="Postar foto"
      icon="camera-outline"
      title="Postar uma foto"
      description="Escolher foto, buscar o local e publicar — próxima entrega."
    />
  );
}
