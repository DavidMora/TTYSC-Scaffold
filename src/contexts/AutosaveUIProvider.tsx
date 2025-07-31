"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";

interface AutosaveUIContextType {
  showAutoSaved: boolean;
  activateAutosaveUI: () => void;
}

const AutosaveUIContext = createContext<AutosaveUIContextType | undefined>(
  undefined
);

export const AutosaveUIProvider = ({ children }: { children: ReactNode }) => {
  const [showAutoSaved, setShowAutoSaved] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activateAutosaveUI = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setShowAutoSaved(true);
    timeoutRef.current = setTimeout(() => {
      setShowAutoSaved(false);
      timeoutRef.current = null;
    }, 2000);
  }, []);

  const contextValue = useMemo(
    () => ({
      showAutoSaved,
      activateAutosaveUI,
    }),
    [showAutoSaved, activateAutosaveUI]
  );

  return (
    <AutosaveUIContext.Provider value={contextValue}>
      {children}
    </AutosaveUIContext.Provider>
  );
};

export const useAutosaveUI = (): AutosaveUIContextType => {
  const context = useContext(AutosaveUIContext);
  if (!context) {
    throw new Error("useAutosaveUI must be used within an AutosaveUIProvider");
  }

  return context;
};
