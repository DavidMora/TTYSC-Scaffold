import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useSequentialNaming,
  SequentialNamingProvider,
} from '@/contexts/SequentialNamingContext';

// Mock auth context used inside provider (mutable session)
const mockAuthState = { session: { user: { id: 'u1' } } as any };
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => mockAuthState),
}));

// Mock sessionStorage used by provider
const sessionStore: Record<string, string> = {};
const sessionStorageMock = {
  getItem: jest.fn((key: string) =>
    key in sessionStore ? sessionStore[key] : null
  ),
  setItem: jest.fn((key: string, value: string) => {
    sessionStore[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete sessionStore[key];
  }),
  clear: jest.fn(() => {
    for (const k of Object.keys(sessionStore)) delete sessionStore[k];
  }),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('useSequentialNaming', () => {
  beforeEach(() => {
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
    sessionStorageMock.clear();
    // default to logged-in unless test overrides
    mockAuthState.session = { user: { id: 'u1' } } as any;
  });

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(SequentialNamingProvider, null, children);
    };
    Wrapper.displayName = 'TestWrapper';
    return Wrapper;
  };

  it('should handle numbers beyond 20', () => {
    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    for (let i = 1; i <= 20; i++) {
      act(() => {
        result.current.generateAnalysisName();
      });
    }

    expect(result.current.currentCounter).toBe(21);

    act(() => {
      result.current.generateAnalysisName();
    });

    expect(result.current.currentCounter).toBe(22);
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

  it('should start with counter 1 when sessionStorage is empty', () => {
    // INIT_KEY not set -> provider resets to 1

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
  });

  it('should start with counter 1 when sessionStorage returns invalid number', () => {
    // Mark as initialized but with invalid stored value
    sessionStorageMock.setItem(
      'sequentialNamingCounter:session:initialized',
      'true'
    );
    sessionStorageMock.setItem(
      'sequentialNamingCounter:session',
      'invalid' as unknown as string
    );

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
  });

  it('should start with counter from sessionStorage when valid', () => {
    sessionStorageMock.setItem(
      'sequentialNamingCounter:session:initialized',
      'true'
    );
    sessionStorageMock.setItem('sequentialNamingCounter:session', '5');

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(5);
  });

  it('does not initialize when not logged in', () => {
    mockAuthState.session = null as any;

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
    expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    expect(sessionStorageMock.removeItem).not.toHaveBeenCalled();
  });

  it('initializes on first login when not previously initialized', () => {
    // Start logged out
    mockAuthState.session = null as any;
    const { rerender } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    // Log in
    mockAuthState.session = { user: { id: 'u1' } } as any;
    rerender();

    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'sequentialNamingCounter:session:initialized',
      'true'
    );
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'sequentialNamingCounter:session',
      '1'
    );
  });

  it('hydrates from storage when already initialized on login', () => {
    sessionStorageMock.setItem(
      'sequentialNamingCounter:session:initialized',
      'true'
    );
    sessionStorageMock.setItem('sequentialNamingCounter:session', '7');

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(7);
  });

  it('clears storage and resets on logout', () => {
    // Mount while logged in
    mockAuthState.session = { user: { id: 'u1' } } as any;
    const { rerender } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    // Then log out
    mockAuthState.session = null as any;
    rerender();

    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
      'sequentialNamingCounter:session:initialized'
    );
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
      'sequentialNamingCounter:session'
    );
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'sequentialNamingCounter:session',
      '1'
    );
  });

  it('rehydrates on subsequent logged-in renders after first initialization', () => {
    // First login initializes
    const { result, rerender } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);

    // Update stored counter and trigger another logged-in render
    sessionStorageMock.setItem('sequentialNamingCounter:session', '9');
    mockAuthState.session = { user: { id: 'u1', v: '2' } } as any; // change ref
    rerender();

    expect(result.current.currentCounter).toBe(9);
  });
});
