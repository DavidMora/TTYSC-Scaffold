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

const generateAnalysisName = (counter: number, prefix: string): string => {
  const ordinal = numberToOrdinalWord(counter);
  return `${prefix} ${ordinal}`;
};

interface UseSequentialNamingProps {
  initialCounter?: number;
  prefix?: string;
}

export const useSequentialNaming = ({
  initialCounter = 1,
  prefix = "Analysis",
}: UseSequentialNamingProps = {}) => {
  const [counter, setCounter] = useState(initialCounter);
  const [currentName, setCurrentName] = useState(() =>
    generateAnalysisName(initialCounter, prefix)
  );

  const generateNextName = useCallback(() => {
    setCounter((prevCounter) => {
      const nextCounter = prevCounter + 1;
      const newName = generateAnalysisName(nextCounter, prefix);
      setCurrentName(newName);
      return nextCounter;
    });

    return generateAnalysisName(counter + 1, prefix);
  }, [counter, prefix]);

  const resetCounter = useCallback(
    (newCounter: number = 1) => {
      setCounter(newCounter);
      setCurrentName(generateAnalysisName(newCounter, prefix));
    },
    [prefix]
  );

  const setCustomName = useCallback((name: string) => {
    setCurrentName(name);
  }, []);

  return {
    counter,
    currentName,
    generateNextName,
    resetCounter,
    setCustomName,
  };
};
