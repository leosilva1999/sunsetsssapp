import { ComingSoon } from "@/src/components/ui/ComingSoon";

// Seção 5.11: polling de unread-count (45s na web — avaliar push nativo FCM/APNs pro mobile),
// lista dos 4 tipos de notificação, marcar como lida ao tocar + navegar, "marcar todas como lidas".
export default function NotificationsScreen() {
  return (
    <ComingSoon
      headerTitle="Notificações"
      icon="notifications-outline"
      title="Notificações"
      description="Lista de notificações e marcação de leitura — próxima entrega."
    />
  );
}
