import React, { createContext, useContext, useState, ReactNode } from "react";

interface RawDataModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const RawDataModalContext = createContext<RawDataModalContextType | undefined>(
  undefined
);

export const RawDataModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = React.useCallback(() => {
    console.log("Opening Raw Data Modal");
    setIsOpen(true);
  }, []);
  const close = React.useCallback(() => {
    console.log("Closing Raw Data Modal");
    setIsOpen(false);
  }, []);

  const value = React.useMemo(
    () => ({ isOpen, open, close }),
    [isOpen, open, close]
  );

  return (
    <RawDataModalContext.Provider value={value}>
      {children}
    </RawDataModalContext.Provider>
  );
};

export const useRawDataModal = () => {
  const context = useContext(RawDataModalContext);
  if (!context) {
    throw new Error(
      "useRawDataModal must be used within a RawDataModalProvider"
    );
  }
  return context;
};
