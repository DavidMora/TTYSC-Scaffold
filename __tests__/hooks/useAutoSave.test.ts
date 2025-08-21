import { renderHook } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const mockOnSave = jest.fn();
      const { result } = renderHook(() =>
        useAutoSave({
          onSave: mockOnSave,
        })
      );

      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSaved).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should not trigger autosave on initial mount', () => {
      const mockOnSave = jest.fn();
      renderHook(() =>
        useAutoSave({
          valueToWatch: 'initial-value',
          onSave: mockOnSave,
        })
      );

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Autosave Triggering', () => {
    it('should trigger autosave when valueToWatch changes', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ value }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
            delayMs: 100,
          }),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });

      // Wait for the short delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSaved).toBeInstanceOf(Date);
      expect(result.current.error).toBe(null);
    });

    it('should use custom delay when provided', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ value }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
            delayMs: 200,
          }),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });

      // Should not trigger before delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockOnSave).not.toHaveBeenCalled();

      // Should trigger after custom delay
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(result.current.isSaving).toBe(false);
    });

    it('should not trigger autosave when valueToWatch is the same', () => {
      const mockOnSave = jest.fn();
      const { rerender } = renderHook(
        ({ value }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
          }),
        { initialProps: { value: 'same-value' } }
      );

      rerender({ value: 'same-value' });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Debouncing', () => {
    it('should debounce multiple rapid changes', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ value }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
            delayMs: 100,
          }),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'change1' });
      rerender({ value: 'change2' });
      rerender({ value: 'change3' });

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('Success Handling', () => {
    it('should call onSuccess callback when save succeeds', async () => {
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const mockOnSuccess = jest.fn();
      const { rerender } = renderHook(
        ({ value }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
            onSuccess: mockOnSuccess,
            delayMs: 100,
          }),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });

      // Wait for the short delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors and call onError callback', async () => {
      const mockError = new Error('Save failed');
      const mockOnSave = jest.fn().mockRejectedValue(mockError);
      const mockOnError = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result, rerender } = renderHook(
        ({ value }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
            onError: mockOnError,
            delayMs: 100,
          }),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });

      // Wait for the short delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockOnError).toHaveBeenCalledWith(mockError);
      expect(result.current.error).toBe(mockError);
      expect(result.current.isSaving).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Autosave failed:', mockError);

      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const mockOnSave = jest.fn();
      const { rerender, unmount } = renderHook(
        ({ value }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
          }),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });

      unmount();

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should not trigger autosave when valueToWatch is undefined', () => {
      const mockOnSave = jest.fn();
      const { rerender } = renderHook(
        ({ value }: { value: unknown }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
          }),
        { initialProps: { value: 'initial' as unknown } }
      );

      rerender({ value: undefined });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should not trigger autosave when valueToWatch is null', () => {
      const mockOnSave = jest.fn();
      const { rerender } = renderHook(
        ({ value }: { value: unknown }) =>
          useAutoSave({
            valueToWatch: value,
            onSave: mockOnSave,
          }),
        { initialProps: { value: 'initial' as unknown } }
      );

      rerender({ value: null });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
