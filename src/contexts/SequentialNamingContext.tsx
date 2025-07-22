"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

const numberToOrdinalWord = (num: number): string => {
  const ordinals = [
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
    "Twenty",
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
  const [counter, setCounter] = useState(1);

  const generateAnalysisName = useCallback((): string => {
    let nameWithOrdinal = "";
    setCounter((currentCounter) => {
      nameWithOrdinal = generateNameString(currentCounter, "Analysis");
      return currentCounter + 1;
    });
    return nameWithOrdinal;
  }, []);

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
      "useSequentialNaming must be used within a SequentialNamingProvider"
    );
  }
  return context;
};
