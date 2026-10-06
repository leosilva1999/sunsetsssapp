import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/stores/authStore";

// Primeira tela: login (incentiva criar conta), a menos que já exista sessão — nesse caso vai
// direto pra Home. Quem não quer logar ainda usa o link "entrar como visitante" na tela de
// login, que leva pra `/(tabs)` sem autenticar — esse grupo não é gated (ver seu _layout.tsx),
// só ações específicas (perfil próprio, postar foto) é que exigem sessão.
export default function Index() {
  const status = useAuthStore((s) => s.status);
  return <Redirect href={status === "signedIn" ? "/(tabs)" : "/(auth)/login"} />;
}
