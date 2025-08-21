import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import ConditionalAuthLayout from '../../src/components/ConditionalAuthLayout';
import { useFeatureFlags } from '../../src/hooks/useFeatureFlags';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('../../src/hooks/useFeatureFlags', () => ({
  useFeatureFlags: jest.fn(),
}));

jest.mock('../../src/components/SessionProviderWrapper', () => ({
  SessionProviderWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

jest.mock('../../src/hooks/useAuth', () => ({
  SuspenseAuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock('../../src/components/AuthWrapper', () => {
  return function AuthWrapper({ children }: { children: React.ReactNode }) {
    return <div data-testid="auth-wrapper">{children}</div>;
  };
});

jest.mock('../../src/providers/ThemeProvider', () => {
  return function ThemeProvider({ children }: { children: React.ReactNode }) {
    return <div data-testid="theme-provider">{children}</div>;
  };
});

jest.mock('../../src/components/AppLayout/AppLayout', () => {
  return function AppLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="app-layout">{children}</div>;
  };
});

jest.mock('../../src/contexts/SequentialNamingContext', () => ({
  SequentialNamingProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sequential-naming">{children}</div>
  ),
}));

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<
  typeof useFeatureFlags
>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('ConditionalAuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render loading component when feature flags are loading', () => {
      mockUseFeatureFlags.mockReturnValue({
        flags: null,
        loading: true,
        error: null,
      });

      render(
        <ConditionalAuthLayout>
          <div>Test Content</div>
        </ConditionalAuthLayout>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('session-provider')).toBeInTheDocument();
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
      expect(screen.getByTestId('sequential-naming')).toBeInTheDocument();

      // Should not include auth provider when loading
      expect(screen.queryByTestId('auth-provider')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render without authentication when feature flags have error', () => {
      mockUseFeatureFlags.mockReturnValue({
        flags: null,
        loading: false,
        error: 'Failed to load feature flags',
      });

      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      render(
        <ConditionalAuthLayout>
          <div>Test Content</div>
        </ConditionalAuthLayout>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Feature flags failed to load, defaulting to no authentication:',
        'Failed to load feature flags'
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByTestId('session-provider')).toBeInTheDocument();
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
      expect(screen.getByTestId('sequential-naming')).toBeInTheDocument();
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();

      // Should not include auth provider or auth wrapper when error
      expect(screen.queryByTestId('auth-provider')).not.toBeInTheDocument();
      expect(screen.queryByTestId('auth-wrapper')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should render without authentication when flags is null', () => {
      mockUseFeatureFlags.mockReturnValue({
        flags: null,
        loading: false,
        error: null,
      });

      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      render(
        <ConditionalAuthLayout>
          <div>Test Content</div>
        </ConditionalAuthLayout>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Feature flags failed to load, defaulting to no authentication:',
        null
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Authentication Disabled', () => {
    it('should render without AuthWrapper when authentication is disabled', () => {
      mockUseFeatureFlags.mockReturnValue({
        flags: { enableAuthentication: false },
        loading: false,
        error: null,
      });

      render(
        <ConditionalAuthLayout>
          <div>Test Content</div>
        </ConditionalAuthLayout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByTestId('session-provider')).toBeInTheDocument();
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
      expect(screen.getByTestId('sequential-naming')).toBeInTheDocument();
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();

      // Should include auth provider but not auth wrapper
      expect(screen.queryByTestId('auth-wrapper')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Enabled', () => {
    it('should render with AuthWrapper when authentication is enabled', () => {
      mockUseFeatureFlags.mockReturnValue({
        flags: { enableAuthentication: true },
        loading: false,
        error: null,
      });

      render(
        <ConditionalAuthLayout>
          <div>Test Content</div>
        </ConditionalAuthLayout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByTestId('session-provider')).toBeInTheDocument();
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('auth-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
      expect(screen.getByTestId('sequential-naming')).toBeInTheDocument();
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });
  });

  describe('Auth Route Handling', () => {
    it('should not wrap children with AppLayout when on auth route', () => {
      mockUsePathname.mockReturnValue('/auth/signin');
      mockUseFeatureFlags.mockReturnValue({
        flags: { enableAuthentication: true },
        loading: false,
        error: null,
      });

      render(
        <ConditionalAuthLayout>
          <div>Auth Page Content</div>
        </ConditionalAuthLayout>
      );

      expect(screen.getByText('Auth Page Content')).toBeInTheDocument();
      expect(screen.getByTestId('sequential-naming')).toBeInTheDocument();

      // Should not include AppLayout on auth routes
      expect(screen.queryByTestId('app-layout')).not.toBeInTheDocument();
    });

    it('should wrap children with AppLayout when not on auth route', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      mockUseFeatureFlags.mockReturnValue({
        flags: { enableAuthentication: true },
        loading: false,
        error: null,
      });

      render(
        <ConditionalAuthLayout>
          <div>Dashboard Content</div>
        </ConditionalAuthLayout>
      );

      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
      expect(screen.getByTestId('sequential-naming')).toBeInTheDocument();
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });
  });

  describe('Provider Nesting', () => {
    it('should properly nest providers in correct order', () => {
      mockUseFeatureFlags.mockReturnValue({
        flags: { enableAuthentication: true },
        loading: false,
        error: null,
      });

      const { container } = render(
        <ConditionalAuthLayout>
          <div>Test Content</div>
        </ConditionalAuthLayout>
      );

      // Verify proper nesting: SessionProvider > AuthProvider > ThemeProvider > AuthWrapper > SequentialNaming > AppLayout > children
      const sessionProvider = container.querySelector(
        '[data-testid="session-provider"]'
      );
      const authProvider = sessionProvider?.querySelector(
        '[data-testid="auth-provider"]'
      );
      const themeProvider = authProvider?.querySelector(
        '[data-testid="theme-provider"]'
      );
      const authWrapper = themeProvider?.querySelector(
        '[data-testid="auth-wrapper"]'
      );
      const sequentialNaming = authWrapper?.querySelector(
        '[data-testid="sequential-naming"]'
      );
      const appLayout = sequentialNaming?.querySelector(
        '[data-testid="app-layout"]'
      );

      expect(sessionProvider).toBeInTheDocument();
      expect(authProvider).toBeInTheDocument();
      expect(themeProvider).toBeInTheDocument();
      expect(authWrapper).toBeInTheDocument();
      expect(sequentialNaming).toBeInTheDocument();
      expect(appLayout).toBeInTheDocument();
    });
  });
});
