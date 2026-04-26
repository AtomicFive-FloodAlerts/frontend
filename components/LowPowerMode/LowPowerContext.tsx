import React, { createContext, useCallback, useContext, useState } from "react";

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

export function LowPowerProvider({ children }: { children: React.ReactNode }) {
  const [isLowPower, setIsLowPower] = useState(false);

  const enableLowPowerMode = useCallback(() => setIsLowPower(true), []);
  const disableLowPowerMode = useCallback(() => setIsLowPower(false), []);

  return (
    <LowPowerContext.Provider value={{ isLowPower, enableLowPowerMode, disableLowPowerMode }}>
      {children}
    </LowPowerContext.Provider>
  );
}

export function useLowPowerContext() {
  return useContext(LowPowerContext);
}
