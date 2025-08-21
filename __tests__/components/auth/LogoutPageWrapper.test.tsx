import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LogoutPageWrapper } from '@/components/auth/LogoutPageWrapper';
import { logoutState } from '@/lib/utils/logout-state';

// Mock the logout state utility
jest.mock('@/lib/utils/logout-state', () => ({
  logoutState: {
    setManuallyLoggedOut: jest.fn(),
  },
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe('LogoutPageWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls setManuallyLoggedOut on mount', () => {
    render(
      <LogoutPageWrapper>
        <div>Test Content</div>
      </LogoutPageWrapper>
    );

    expect(logoutState.setManuallyLoggedOut).toHaveBeenCalledTimes(1);
  });

  it('renders children after initialization', async () => {
    render(
      <LogoutPageWrapper>
        <div data-testid="test-content">Test Content</div>
      </LogoutPageWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  it('wraps children in SessionProvider with correct props', async () => {
    render(
      <LogoutPageWrapper>
        <div data-testid="test-content">Test Content</div>
      </LogoutPageWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-provider')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  it('clears session cookies when window is available', async () => {
    // Store original document.cookie
    const originalCookie = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'cookie'
    );

    const mockCookies =
      'next-auth.session-token=test; other-cookie=value; next-auth.csrf-token=csrf';
    const setCookieCalls: string[] = [];

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      get: () => mockCookies,
      set: (value: string) => {
        setCookieCalls.push(value);
      },
      configurable: true,
    });

    render(
      <LogoutPageWrapper>
        <div>Test Content</div>
      </LogoutPageWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    // Should have cleared next-auth cookies
    expect(
      setCookieCalls.some((call) =>
        call.includes(
          'next-auth.session-token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
        )
      )
    ).toBe(true);
    expect(
      setCookieCalls.some((call) =>
        call.includes(
          'next-auth.csrf-token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
        )
      )
    ).toBe(true);

    // Restore original descriptor
    if (originalCookie) {
      Object.defineProperty(Document.prototype, 'cookie', originalCookie);
    }
  });

  it('handles the useEffect hook properly', async () => {
    const { rerender } = render(
      <LogoutPageWrapper>
        <div data-testid="test-content">Test Content</div>
      </LogoutPageWrapper>
    );

    // Verify the component initializes correctly
    await waitFor(() => {
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    // Test rerender doesn't cause issues
    rerender(
      <LogoutPageWrapper>
        <div data-testid="updated-content">Updated Content</div>
      </LogoutPageWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('updated-content')).toBeInTheDocument();
    });
  });

  it('handles window availability check', async () => {
    // Mock the typeof window check
    const originalWindow = global.window;

    // Test with window undefined
    delete (global as any).window;

    render(
      <LogoutPageWrapper>
        <div data-testid="no-window">No Window</div>
      </LogoutPageWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-window')).toBeInTheDocument();
    });

    // Restore window
    global.window = originalWindow;
  });
});
