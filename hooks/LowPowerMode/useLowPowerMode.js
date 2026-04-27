import { useCallback, useState } from 'react';

/**
 * useLowPowerMode
 * Global hook to manage low power mode state.
 */
export function useLowPowerMode() {
  const [isLowPower, setIsLowPower] = useState(false);

  const enableLowPowerMode = useCallback(() => {
    setIsLowPower(true);
  }, []);

  const disableLowPowerMode = useCallback(() => {
    setIsLowPower(false);
  }, []);

  return { isLowPower, enableLowPowerMode, disableLowPowerMode };
}
