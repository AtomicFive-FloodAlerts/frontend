import useTheme, { ThemeProvider } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import { ReactNode } from "react";
import { LowPowerProvider } from '../hooks/LowPowerMode/LowPowerContext';


// Called as a wrapper for all the pages
function AppProviders({ children }: { children: ReactNode }) {
  const { setDarkMode } = useTheme();

  return (
    <LowPowerProvider
      onEnableDarkMode={() => setDarkMode(true)}
      onDisableDarkMode={() => setDarkMode(false)}
    >
      {children}
    </LowPowerProvider>
  );
}

export default function RootLayout() {
  return (
  <ThemeProvider>
    <AppProviders>
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="Flood-Alerts-SL"  /> 
    </Stack>
  </AppProviders>
  </ThemeProvider>
  );
}
