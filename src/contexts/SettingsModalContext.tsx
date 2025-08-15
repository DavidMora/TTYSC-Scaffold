'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

type SettingsModalContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const SettingsModalContext = createContext<
  SettingsModalContextType | undefined
>(undefined);

export const SettingsModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { flag: isSettingsEnabled } = useFeatureFlag('FF_Settings_Menu');

  const open = useCallback(() => {
    if (!isSettingsEnabled) return;
    setIsOpen(true);
  }, [isSettingsEnabled]);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <SettingsModalContext.Provider value={value}>
      {children}
    </SettingsModalContext.Provider>
  );
};

export const useSettingsModal = (): SettingsModalContextType => {
  const ctx = useContext(SettingsModalContext);
  if (!ctx)
    throw new Error(
      'useSettingsModal must be used within SettingsModalProvider'
    );
  return ctx;
};
