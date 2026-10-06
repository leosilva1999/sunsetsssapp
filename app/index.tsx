import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/stores/authStore";

export default function Index() {
  const status = useAuthStore((s) => s.status);
  return <Redirect href={status === "signedIn" ? "/(tabs)" : "/(auth)/login"} />;
}
