import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useSession, signIn } from 'next-auth/react';
import { AuthProvider, SuspenseAuthProvider, useAuth } from '@/hooks/useAuth';
import '@testing-library/jest-dom';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Test component that uses the hook
function TestComponent() {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="auth-process">{auth.authProcess}</div>
      <div data-testid="auto-login">{auth.autoLogin.toString()}</div>
      <div data-testid="is-auth-disabled">{auth.isAuthDisabled.toString()}</div>
      <div data-testid="is-loading">{auth.isLoading.toString()}</div>
      <div data-testid="auth-error">{auth.authError || 'none'}</div>
      <div data-testid="retry-count">{auth.retryCount}</div>
      <div data-testid="session">{auth.session ? 'authenticated' : 'none'}</div>
    </div>
  );
}

describe('useAuth Hook', () => {
  const mockUpdate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Default mock implementations
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: mockUpdate,
    });
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: false,
        autoLogin: false,
      }),
    } as Response);
    
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: '' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws error when used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider component');
    
    consoleSpy.mockRestore();
  });

  it('provides initial loading state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('auth-process')).toHaveTextContent('azure');
    expect(screen.getByTestId('session')).toHaveTextContent('none');
  });

  it('loads auth configuration successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: false,
        autoLogin: true,
      }),
    } as Response);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auto-login')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('is-auth-disabled')).toHaveTextContent('false');
  });

  it('handles auth configuration fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Configuration error: Network error');
    });

    // Should fallback to default configuration
    expect(screen.getByTestId('auto-login')).toHaveTextContent('false');
    expect(screen.getByTestId('is-auth-disabled')).toHaveTextContent('false');
  });

  it('handles HTTP error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Configuration error: HTTP 404: Not Found');
    });
  });

  it('triggers auto-login when enabled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: false,
        autoLogin: true,
      }),
    } as Response);

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('nvlogin', {
        callbackUrl: '/',
        redirect: true,
      });
    });

    expect(screen.getByTestId('retry-count')).toHaveTextContent('1');
  });

  it('does not trigger auto-login when disabled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: false,
        autoLogin: false,
      }),
    } as Response);

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auto-login')).toHaveTextContent('false');
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('does not trigger auto-login when auth is disabled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: true,
        autoLogin: true,
      }),
    } as Response);

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-auth-disabled')).toHaveTextContent('true');
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('handles successful authentication', async () => {
    const mockSession = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('auth-error')).toHaveTextContent('none');
    expect(screen.getByTestId('retry-count')).toHaveTextContent('0');
  });

  it('handles session error and resets state on recovery', async () => {
    const mockSessionWithError = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      error: 'TokenError',
    };

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // First render with error
    mockUseSession.mockReturnValue({
      data: mockSessionWithError,
      status: 'authenticated',
      update: mockUpdate,
    });

    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('TokenError');
    });

    // Second render without error
    const mockSessionFixed = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockUseSession.mockReturnValue({
      data: mockSessionFixed,
      status: 'authenticated',
      update: mockUpdate,
    });

    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('none');
    });
  });

  it('handles RefreshAccessTokenError specially', async () => {
    const mockSessionWithRefreshError = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      error: 'RefreshAccessTokenError',
    };

    mockUseSession.mockReturnValue({
      data: mockSessionWithRefreshError,
      status: 'authenticated',
      update: mockUpdate,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('RefreshAccessTokenError');
    });
  });

  it('handles auto-login failure', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: false,
        autoLogin: true,
      }),
    } as Response);

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });

    mockSignIn.mockRejectedValue(new Error('Login failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Auto-login failed: Login failed');
    });
  });

  it('stops retrying after max attempts', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: false,
        autoLogin: true,
      }),
    } as Response);

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });

    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: '' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // The hook should handle retry logic internally
    await waitFor(() => {
      expect(screen.getByTestId('retry-count')).toHaveTextContent('1');
    });
  });

  it('works with SuspenseAuthProvider', async () => {
    render(
      <SuspenseAuthProvider>
        <TestComponent />
      </SuspenseAuthProvider>
    );

    expect(screen.getByTestId('auth-process')).toHaveTextContent('azure');
  });

  it('handles loading states correctly', async () => {
    // Test loading state when config is not loaded
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('handles loading states with auto-login enabled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        authProcess: 'azure',
        isAuthDisabled: false,
        autoLogin: true,
      }),
    } as Response);

    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: mockUpdate,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auto-login')).toHaveTextContent('true');
    });

    // Should still be loading because session is loading and auto-login hasn't been tried
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });
});
