import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useSequentialNaming,
  SequentialNamingProvider,
} from '@/contexts/SequentialNamingContext';

// Mock auth context used inside provider (mutable session)
const mockAuthState = { session: { user: { id: 'u1' } } };

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => mockAuthState),
}));

// Mock localStorage used by provider
const localStore: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) =>
    key in localStore ? localStore[key] : null
  ),
  setItem: jest.fn((key: string, value: string) => {
    localStore[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStore[key];
  }),
  clear: jest.fn(() => {
    for (const k of Object.keys(localStore)) delete localStore[k];
  }),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useSequentialNaming', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.clear();
    // default to logged-in unless test overrides
    mockAuthState.session = { user: { id: 'u1' } } as unknown as {
      user: { id: string };
    };
  });

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(SequentialNamingProvider, null, children);
    };
    Wrapper.displayName = 'TestWrapper';
    return Wrapper;
  };

  it('should handle numbers beyond 20', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    for (let i = 1; i <= 20; i++) {
      act(() => {
        jest.advanceTimersByTime(200);
        result.current.generateAnalysisName();
      });
    }

    expect(result.current.currentCounter).toBe(21);

    act(() => {
      jest.advanceTimersByTime(200);
      result.current.generateAnalysisName();
    });

    expect(result.current.currentCounter).toBe(22);

    jest.useRealTimers();
  });

  it('should throw error when used outside of provider', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSequentialNaming());
    }).toThrow(
      'useSequentialNaming must be used within a SequentialNamingProvider'
    );

    consoleSpy.mockRestore();
  });

  it('should start with counter 1 when storage is empty', () => {
    // INIT_KEY not set -> provider resets to 1

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
  });

  it('should start with counter 1 when storage returns invalid number', () => {
    // Set invalid stored value for user
    localStorageMock.setItem(
      'sequentialNamingCounter:user:u1',
      'invalid' as unknown as string
    );

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
  });

  it('should start with counter from storage when valid', () => {
    localStorageMock.setItem('sequentialNamingCounter:user:u1', '5');

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(5);
  });

  it('does not initialize when not logged in', () => {
    mockAuthState.session = null as unknown as { user: { id: string } };

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it('initializes on first login when not previously initialized', async () => {
    // Start logged out
    mockAuthState.session = null as unknown as { user: { id: string } };
    const { rerender } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    // Log in
    mockAuthState.session = { user: { id: 'u1' } } as unknown as {
      user: { id: string };
    };
    rerender();

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sequentialNamingCounter:user:u1',
        '1'
      );
    });
  });

  it('hydrates from storage when already initialized on login', () => {
    localStorageMock.setItem('sequentialNamingCounter:user:u1', '7');

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(7);
  });

  it('clears storage and resets on logout', async () => {
    // Mount while logged in
    mockAuthState.session = { user: { id: 'u1' } } as unknown as {
      user: { id: string };
    };
    const { result, rerender } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    // Then log out
    mockAuthState.session = null as unknown as { user: { id: string } };
    rerender();

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'sequentialNamingCounter:user:u1'
      );
      // state resets to 1 locally; storage write after logout is not required
      expect(result.current.currentCounter).toBe(1);
    });
  });

  it('rehydrates on subsequent logged-in renders after first initialization', async () => {
    // First login initializes
    const { result, rerender } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);

    // Update stored counter and trigger another logged-in render
    localStorageMock.setItem('sequentialNamingCounter:user:u1', '9');
    mockAuthState.session = { user: { id: 'u1', v: '2' } } as unknown as {
      user: { id: string; v: string };
    };
    rerender();

    await waitFor(() => {
      expect(result.current.currentCounter).toBe(9);
    });
  });
});
