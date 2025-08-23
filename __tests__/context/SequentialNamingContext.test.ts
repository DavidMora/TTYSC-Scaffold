import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  useSequentialNaming,
  SequentialNamingProvider,
} from '@/contexts/SequentialNamingContext';

// Mock auth context used inside provider
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } } }),
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
});
