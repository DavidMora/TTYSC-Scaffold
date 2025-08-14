import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import AuthWrapper from '@/components/AuthWrapper';
import { useAuth } from '@/hooks/useAuth';
import '@testing-library/jest-dom';

// Mock the hooks
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock the components
jest.mock('@/components/AppLayout/AppLayout', () => {
  const MockAppLayout = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  );
  MockAppLayout.displayName = 'MockAppLayout';
  return { default: MockAppLayout };
});

jest.mock('@/providers/ThemeProvider', () => {
  const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  );
  MockThemeProvider.displayName = 'MockThemeProvider';
  return { default: MockThemeProvider };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('AuthWrapper', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it('renders null when loading', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      isLoading: true,
      authProcess: 'test',
      autoLogin: false,
      isAuthDisabled: false,
      authError: null,
      retryCount: 0,
    });
    mockUsePathname.mockReturnValue('/dashboard');

    const { container } = render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('redirects when no session and not on auth route', async () => {
    mockUseAuth.mockReturnValue({
      session: null,
      isLoading: false,
      authProcess: 'test',
      autoLogin: false,
      isAuthDisabled: false,
      authError: null,
      retryCount: 0,
    });
    mockUsePathname.mockReturnValue('/dashboard');

    const { container } = render(
      <AuthWrapper>
        <div>Test Content</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signin?callbackUrl=')
      );
    });

    // Should render null while redirecting
    expect(container.firstChild).toBeNull();
  });

  it('renders children directly when on auth route', async () => {
    mockUseAuth.mockReturnValue({
      session: null,
      isLoading: false,
      authProcess: 'test',
      autoLogin: false,
      isAuthDisabled: false,
      authError: null,
      retryCount: 0,
    });
    mockUsePathname.mockReturnValue('/auth/signin');

    render(
      <AuthWrapper>
        <div>Auth Content</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Auth Content')).toBeInTheDocument();
    });
  });

  it('renders children directly when authenticated', async () => {
    const mockSession = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockUseAuth.mockReturnValue({
      session: mockSession,
      isLoading: false,
      authProcess: 'test',
      autoLogin: false,
      isAuthDisabled: false,
      authError: null,
      retryCount: 0,
    });
    mockUsePathname.mockReturnValue('/dashboard');

    render(
      <AuthWrapper>
        <div>Dashboard Content</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });
  });

  it('handles transition from loading to authenticated', async () => {
    const mockSession = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Start with loading state
    mockUseAuth.mockReturnValue({
      session: null,
      isLoading: true,
      authProcess: 'test',
      autoLogin: false,
      isAuthDisabled: false,
      authError: null,
      retryCount: 0,
    });
    mockUsePathname.mockReturnValue('/dashboard');

    const { rerender } = render(
      <AuthWrapper>
        <div>Content</div>
      </AuthWrapper>
    );

    // Should render null initially
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    // Simulate auth completing with session
    mockUseAuth.mockReturnValue({
      session: mockSession,
      isLoading: false,
      authProcess: 'test',
      autoLogin: false,
      isAuthDisabled: false,
      authError: null,
      retryCount: 0,
    });

    rerender(
      <AuthWrapper>
        <div>Content</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('returns null as fallback when no session and checked auth', async () => {
    mockUseAuth.mockReturnValue({
      session: null,
      isLoading: false,
      authProcess: 'test',
      autoLogin: false,
      isAuthDisabled: false,
      authError: null,
      retryCount: 0,
    });
    mockUsePathname.mockReturnValue('/some-other-route');

    // Mock replace to not actually redirect for this test
    mockReplace.mockImplementation(() => {});

    const { container } = render(
      <AuthWrapper>
        <div>Content</div>
      </AuthWrapper>
    );

    // Should still return null while redirect is in progress
    expect(container.firstChild).toBeNull();
  });
});
