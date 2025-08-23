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

  if (num >= 1 && num <= ordinals.length) {
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
  const lastGeneratedAtRef = useRef<number>(0);
  const lastReturnedNameRef = useRef<string | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const isGeneratingRef = useRef<boolean>(false);

  const storageKey = useMemo(() => {
    const userId = (session as { user?: { id?: string | null } } | null)?.user
      ?.id;
    return userId
      ? `sequentialNamingCounter:user:${userId}`
      : 'sequentialNamingCounter:user:anonymous';
  }, [session]);

  const clearStoredCounter = useCallback(() => {
    try {
      const keyToClear = lastUserIdRef.current
        ? `sequentialNamingCounter:user:${lastUserIdRef.current}`
        : storageKey;
      localStorage.removeItem(keyToClear);
    } catch {}
  }, [storageKey]);

  const resetCounter = useCallback(() => {
    setCounter(1);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {}
  }, [storageKey]);

  const hydrateFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? parseInt(saved, 10) : NaN;
      if (!isNaN(parsed) && parsed > 0) {
        setCounter(parsed);
      } else {
        resetCounter();
      }
    } catch {
      resetCounter();
    }
  }, [storageKey, resetCounter]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLoggedIn = !!session;

    if (!isLoggedIn) {
      if (hasSessionRef.current) {
        clearStoredCounter();
        resetCounter();
      }
      hasSessionRef.current = false;
      lastUserIdRef.current = null;
      return;
    }

    // track user id while logged in for correct cleanup on logout
    lastUserIdRef.current =
      (session as { user?: { id?: string | null } } | null)?.user?.id ?? null;

    hydrateFromStorage();
    hasSessionRef.current = true;
  }, [session, clearStoredCounter, resetCounter, hydrateFromStorage]);

  const generateAnalysisName = useCallback((): string => {
    const now = Date.now();

    // Protection against very rapid calls
    if (now - lastGeneratedAtRef.current < 150 && lastReturnedNameRef.current) {
      return lastReturnedNameRef.current;
    }

    // Protection against race conditions
    if (isGeneratingRef.current) {
      return (
        lastReturnedNameRef.current || generateNameString(counter, 'Analysis')
      );
    }

    isGeneratingRef.current = true;

    try {
      const current = counter;
      const nameWithOrdinal = generateNameString(current, 'Analysis');
      const next = current + 1;

      // Update state first for immediate consistency
      setCounter(next);

      // Update localStorage asynchronously
      try {
        localStorage.setItem(storageKey, next.toString());
      } catch (error) {
        // If localStorage fails, the state is already updated
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to persist counter:', error);
        }
      }

      // Update references for protection
      lastGeneratedAtRef.current = now;
      lastReturnedNameRef.current = nameWithOrdinal;

      return nameWithOrdinal;
    } finally {
      // Release the flag after a small delay to avoid race conditions
      // in case of very rapid re-renders
      setTimeout(() => {
        isGeneratingRef.current = false;
      }, 10);
    }
  }, [counter, storageKey]);

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
