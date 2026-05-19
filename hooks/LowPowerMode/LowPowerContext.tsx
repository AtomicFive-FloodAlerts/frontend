import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface LowPowerContextType {
  isLowPower: boolean;
  enableLowPowerMode: () => void;
  disableLowPowerMode: () => void;
}

const LowPowerContext = createContext<LowPowerContextType>({
  isLowPower: false,
  enableLowPowerMode: () => {},
  disableLowPowerMode: () => {},
});

interface LowPowerProviderProps {
  children: React.ReactNode;
  onEnableDarkMode: () => void;
  onDisableDarkMode: () => void;
}

export function LowPowerProvider({ children, onEnableDarkMode, onDisableDarkMode }: LowPowerProviderProps) {
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("lowPowerMode").then((value) => {
      if (value && JSON.parse(value) === true) {
        setIsLowPower(true);
        onEnableDarkMode();
      }
    });
  }, []);

  const enableLowPowerMode = useCallback(async () => {
    setIsLowPower(true);
    onEnableDarkMode();
    await AsyncStorage.setItem("lowPowerMode", JSON.stringify(true));
  }, [onEnableDarkMode]);

  const disableLowPowerMode = useCallback(async () => {
    setIsLowPower(false);
    onDisableDarkMode();
    await AsyncStorage.setItem("lowPowerMode", JSON.stringify(false));
  }, [onDisableDarkMode]);

  return (
    <LowPowerContext.Provider value={{ isLowPower, enableLowPowerMode, disableLowPowerMode }}>
      {children}
    </LowPowerContext.Provider>
  );
}

export function useLowPowerContext() {
  return useContext(LowPowerContext);
}