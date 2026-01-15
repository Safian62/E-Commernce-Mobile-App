import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthRoutesLayout() {
  const { token, loading } = useAuth();

  if (loading) return null;

  if (token) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
