import { useState, useCallback } from "react";

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

export const useSequentialNaming = () => {
  const [counter, setCounter] = useState(1);

  const generateAnalysisName = useCallback((): string => {
    const nameWithOrdinal = generateNameString(counter, "Analysis");
    const nextCounter = counter + 1;
    setCounter(nextCounter);
    return nameWithOrdinal;
  }, [counter]);

  return {
    generateAnalysisName,
    currentCounter: counter,
  };
};
