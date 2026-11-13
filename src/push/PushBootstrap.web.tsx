// Web: sem push (a lib de notificações do Expo não cobre a plataforma). Existe pra o bundle web não
// carregar o código nativo de notificações.
export function PushBootstrap() {
  return null;
}
