import "@/i18n";

import {
  BarlowSemiCondensed_600SemiBold,
  BarlowSemiCondensed_700Bold,
  useFonts,
} from "@expo-google-fonts/barlow-semi-condensed";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useDatabasePreparation } from "@/features/startup/hooks/use-database-preparation";
import { DatabaseErrorScreen } from "@/features/startup/ui/database-error-screen";
import { useTheme } from "@/ui/theme";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { scheme, colors } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    BarlowSemiCondensed_600SemiBold,
    BarlowSemiCondensed_700Bold,
  });
  const database = useDatabasePreparation();
  // Si la fuente falla, la app sigue con la del sistema: nunca queda bloqueada en la carga.
  const fontsReady = fontsLoaded || fontError !== null;
  // La pantalla de carga sigue hasta que la base está lista o falló (y hay algo que mostrar).
  const ready = fontsReady && database.status !== "loading";

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!fontsReady) return null;

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {database.status === "ready" ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      ) : database.status === "error" ? (
        <DatabaseErrorScreen onRetry={database.retry} />
      ) : null}
    </>
  );
}
