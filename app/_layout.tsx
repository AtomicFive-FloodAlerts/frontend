import { ThemeProvider } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import { LowPowerProvider } from '../components/LowPowerMode/LowPowerContext';

export default function RootLayout() {
  return (
  <ThemeProvider>
    <LowPowerProvider>
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="Flood-Alerts-SL"  /> 
    </Stack>
  </LowPowerProvider>
  </ThemeProvider>
  );
}
