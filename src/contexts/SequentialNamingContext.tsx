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

const DEDUPE_MS = 300;
const MOUNT_DUPE_MS = 800;

export const SequentialNamingProvider: React.FC<
  SequentialNamingProviderProps
> = ({ children }) => {
  const { session } = useAuth();

  const [counter, setCounter] = useState(1);

  const hasSessionRef = useRef<boolean>(false);
  const lastGeneratedAtRef = useRef<number>(0);
  const lastReturnedNameRef = useRef<string | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const counterRef = useRef<number>(1);
  const mountedAtRef = useRef<number>(Date.now());

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
    counterRef.current = 1;
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
        counterRef.current = parsed;
        setCounter(parsed);
      } else {
        counterRef.current = 1;
        resetCounter();
      }
    } catch {
      counterRef.current = 1;
      resetCounter();
    }
  }, [storageKey, resetCounter]);

  useEffect(() => {
    counterRef.current = counter;
  }, [counter]);

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;

      const next = e.newValue ? parseInt(e.newValue, 10) : NaN;
      if (Number.isFinite(next) && next > 0 && next !== counterRef.current) {
        counterRef.current = next;
        setCounter(next);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        hydrateFromStorage();
      }
    };

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [storageKey, hydrateFromStorage]);

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

    // Guard: prevent duplicate increments on immediate back-to-back calls
    // Includes initial mount window to avoid double calls when reopening
    if (
      (now - lastGeneratedAtRef.current < DEDUPE_MS ||
        now - mountedAtRef.current < MOUNT_DUPE_MS) &&
      lastReturnedNameRef.current
    ) {
      return lastReturnedNameRef.current;
    }

    const current = counterRef.current;
    const nameWithOrdinal = generateNameString(current, 'Analysis');
    const next = current + 1;

    // Synchronous increment to avoid duplicates on rapid calls
    counterRef.current = next;
    setCounter(next);

    try {
      localStorage.setItem(storageKey, next.toString());
    } catch {}

    lastGeneratedAtRef.current = now;
    lastReturnedNameRef.current = nameWithOrdinal;

    return nameWithOrdinal;
  }, [storageKey]);

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
