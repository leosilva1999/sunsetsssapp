import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.9: nome, avatar (upload em 2 passos + recorte), bio até 160 caracteres.
// PATCH /users/me é partial update de verdade — omitir mantém, null limpa, valor substitui.
export default function EditProfileScreen() {
  return <ComingSoon headerTitle="Editar perfil" icon="create-outline" title="Editar perfil" />;
}
