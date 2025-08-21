import { useState, useEffect, useRef, useCallback } from 'react';

interface AutosaveOptions {
  valueToWatch?: unknown;
  onSave: () => Promise<void> | void;
  delayMs?: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

interface AutosaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: unknown;
}

export const useAutoSave = (options: AutosaveOptions) => {
  const [state, setState] = useState<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const previousValueRef = useRef<unknown>(undefined);

  const executeAutosave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState((prev) => ({ ...prev, error: null }));

    timeoutRef.current = setTimeout(async () => {
      setState((prev) => ({ ...prev, isSaving: true }));
      try {
        await options.onSave();
        setState((prev) => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          error: null,
        }));
        options.onSuccess?.();
      } catch (err) {
        console.error('Autosave failed:', err);
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: err,
        }));
        options.onError?.(err);
      }
    }, options.delayMs || 1500);
  }, [options]);

  useEffect(() => {
    const { valueToWatch } = options;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousValueRef.current = valueToWatch;
      return;
    }

    if (valueToWatch === previousValueRef.current) {
      return;
    }

    previousValueRef.current = valueToWatch;

    if (valueToWatch == null) {
      return;
    }

    executeAutosave();
  }, [options, executeAutosave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    executeAutosave,
  };
};
