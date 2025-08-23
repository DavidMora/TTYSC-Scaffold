'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { useAuth } from '@/hooks/useAuth';

const numberToOrdinalWord = (num: number): string => {
  const ordinals = [
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
    'Twenty',
  ];

  if (num <= 20) {
    return ordinals[num - 1];
  }

  return num.toString();
};

const generateNameString = (counter: number, prefix: string): string => {
  const ordinal = numberToOrdinalWord(counter);
  return `${prefix} ${ordinal}`;
};

interface SequentialNamingContextType {
  generateAnalysisName: () => string;
  currentCounter: number;
}

const SequentialNamingContext = createContext<
  SequentialNamingContextType | undefined
>(undefined);

interface SequentialNamingProviderProps {
  children: ReactNode;
}

export const SequentialNamingProvider: React.FC<
  SequentialNamingProviderProps
> = ({ children }) => {
  const { session } = useAuth();

  const [counter, setCounter] = useState(1);

  const hasSessionRef = useRef<boolean>(false);
  const STORAGE_KEY = 'sequentialNamingCounter:session';
  const INIT_KEY = `${STORAGE_KEY}:initialized`;

  const clearSessionStorage = useCallback(() => {
    try {
      sessionStorage.removeItem(INIT_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [INIT_KEY, STORAGE_KEY]);

  const resetCounter = useCallback(() => {
    setCounter(1);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {}
  }, [STORAGE_KEY]);

  const hydrateFromStorage = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      const parsed = saved ? parseInt(saved, 10) : NaN;
      if (!isNaN(parsed) && parsed > 0) {
        setCounter(parsed);
      } else {
        resetCounter();
      }
    } catch {
      resetCounter();
    }
  }, [STORAGE_KEY, resetCounter]);

  const markInitialized = useCallback(() => {
    try {
      sessionStorage.setItem(INIT_KEY, 'true');
    } catch {}
  }, [INIT_KEY]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLoggedIn = !!session;

    if (!isLoggedIn && hasSessionRef.current) {
      clearSessionStorage();
      resetCounter();
      hasSessionRef.current = false;
      return;
    }

    if (!isLoggedIn) {
      hasSessionRef.current = false;
      return;
    }

    if (!hasSessionRef.current) {
      const alreadyInitialized = (() => {
        try {
          return sessionStorage.getItem(INIT_KEY) === 'true';
        } catch {
          return false;
        }
      })();

      if (alreadyInitialized) {
        hydrateFromStorage();
      } else {
        markInitialized();
        resetCounter();
      }
      hasSessionRef.current = true;
      return;
    }

    hydrateFromStorage();
    hasSessionRef.current = true;
  }, [
    session,
    clearSessionStorage,
    resetCounter,
    hydrateFromStorage,
    markInitialized,
    INIT_KEY,
  ]);

  const generateAnalysisName = useCallback((): string => {
    const nameWithOrdinal = generateNameString(counter, 'Analysis');
    setCounter((prev) => {
      const next = prev + 1;
      try {
        sessionStorage.setItem(STORAGE_KEY, next.toString());
      } catch {}
      return next;
    });
    return nameWithOrdinal;
  }, [counter]);

  const value: SequentialNamingContextType = useMemo(
    () => ({
      generateAnalysisName,
      currentCounter: counter,
    }),
    [generateAnalysisName, counter]
  );

  return (
    <SequentialNamingContext.Provider value={value}>
      {children}
    </SequentialNamingContext.Provider>
  );
};

export const useSequentialNaming = (): SequentialNamingContextType => {
  const context = useContext(SequentialNamingContext);
  if (context === undefined) {
    throw new Error(
      'useSequentialNaming must be used within a SequentialNamingProvider'
    );
  }
  return context;
};
