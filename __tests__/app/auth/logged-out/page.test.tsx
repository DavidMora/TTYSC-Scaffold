import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import LoggedOutPage from '@/app/auth/logged-out/page';
import { logoutState } from '@/lib/utils/logout-state';
import { performCompleteLogoutCleanup } from '@/lib/utils/token-cleanup';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock logout state
jest.mock('@/lib/utils/logout-state', () => ({
  logoutState: {
    setManuallyLoggedOut: jest.fn(),
    clearLogoutState: jest.fn(),
  },
}));

// Mock token cleanup
jest.mock('@/lib/utils/token-cleanup', () => ({
  performCompleteLogoutCleanup: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
Object.assign(console, mockConsole);

// Mock timers properly
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

beforeAll(() => {
  global.setInterval = jest.fn(originalSetInterval);
  global.clearInterval = jest.fn(originalClearInterval);
});

afterAll(() => {
  global.setInterval = originalSetInterval;
  global.clearInterval = originalClearInterval;
});

describe('LoggedOutPage', () => {
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
  const mockPerformCompleteLogoutCleanup =
    performCompleteLogoutCleanup as jest.MockedFunction<
      typeof performCompleteLogoutCleanup
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Reset localStorage mocks
    mockLocalStorage.getItem.mockReturnValue('true');
    mockPerformCompleteLogoutCleanup.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial loading and setup', () => {
    it('should show loading state initially', () => {
      render(<LoggedOutPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should perform cleanup and setup on mount', async () => {
      render(<LoggedOutPage />);

      expect(logoutState.setManuallyLoggedOut).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user_manually_logged_out',
        'true'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'logout_timestamp',
        expect.any(String)
      );
      expect(mockPerformCompleteLogoutCleanup).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[LoggedOut] Enforcing logout state on page load'
      );
    });

    it('should complete cleanup process successfully', async () => {
      render(<LoggedOutPage />);

      // Wait for the performCleanup to complete
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Verify that cleanup process was completed
      expect(logoutState.setManuallyLoggedOut).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user_manually_logged_out',
        'true'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'logout_timestamp',
        expect.any(String)
      );
      expect(mockPerformCompleteLogoutCleanup).toHaveBeenCalled();
    });
  });

  describe('Rendered content when ready', () => {
    beforeEach(async () => {
      render(<LoggedOutPage />);

      // Wait for component to be ready
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should render logout success message', () => {
      expect(screen.getByText('You have been logged out')).toBeInTheDocument();
      expect(screen.getByText('✓ Logout Successful')).toBeInTheDocument();
      expect(
        screen.getByText(/You have been successfully logged out/)
      ).toBeInTheDocument();
    });

    it('should render security information', () => {
      expect(screen.getByText(/To maintain security/)).toBeInTheDocument();
      expect(
        screen.getByText(/For security reasons, please close your browser/)
      ).toBeInTheDocument();
    });

    it('should render sign in button', () => {
      const signInButton = screen.getByTestId('ui5-button');
      expect(signInButton).toBeInTheDocument();
      expect(signInButton).toHaveTextContent('Sign In Again');
      expect(signInButton).not.toBeDisabled();
    });
  });

  describe('Sign in functionality', () => {
    beforeEach(async () => {
      render(<LoggedOutPage />);

      // Wait for component to be ready
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should handle sign in button click', async () => {
      const signInButton = screen.getByTestId('ui5-button');

      fireEvent.click(signInButton);

      expect(logoutState.clearLogoutState).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith('nvlogin', {
        callbackUrl: '/',
        redirect: true,
        prompt: 'select_account',
      });
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[LoggedOut] Manual login initiated'
      );
    });

    it('should show loading state during sign in', async () => {
      const signInButton = screen.getByTestId('ui5-button');

      // Mock signIn to be a pending promise
      mockSignIn.mockImplementation(() => new Promise(() => {}));

      fireEvent.click(signInButton);

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(signInButton).toBeDisabled();
    });

    it('should handle sign in errors', async () => {
      const signInButton = screen.getByTestId('ui5-button');
      const error = new Error('Sign in failed');

      mockSignIn.mockRejectedValueOnce(error);

      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockConsole.error).toHaveBeenCalledWith('Login failed:', error);
        expect(screen.getByText('Sign In Again')).toBeInTheDocument(); // Button text should reset
        expect(signInButton).not.toBeDisabled(); // Button should be enabled again
      });
    });
  });

  describe('Logout state monitoring', () => {
    it('should monitor and restore logout state when verified', async () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('true') // Initial setup
        .mockReturnValueOnce('true') // After cleanup verification
        .mockReturnValueOnce(null) // During monitoring (state lost)
        .mockReturnValue('true'); // Subsequent checks

      render(<LoggedOutPage />);

      // Fast-forward through initial setup
      jest.runAllTimers();

      // Advance time to trigger monitoring interval
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(mockConsole.warn).toHaveBeenCalledWith(
          '[LoggedOut] Logout state was lost, restoring...'
        );
        expect(logoutState.setManuallyLoggedOut).toHaveBeenCalled();
      });
    });

    it('should not monitor logout state before verification', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(<LoggedOutPage />);

      // Advance time but shouldn't trigger monitoring yet
      jest.advanceTimersByTime(1000);

      expect(mockConsole.warn).not.toHaveBeenCalledWith(
        '[LoggedOut] Logout state was lost, restoring...'
      );
    });

    it('should clear monitoring interval on unmount', async () => {
      const { unmount } = render(<LoggedOutPage />);

      // Wait for component to be ready and monitoring to start
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Advance timers to start monitoring
      jest.advanceTimersByTime(100);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Component styling and layout', () => {
    beforeEach(async () => {
      render(<LoggedOutPage />);

      // Wait for component to be ready
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should apply correct styling to main container', () => {
      const flexBoxContainer = screen.getAllByTestId('ui5-flexbox')[0]; // Get the main container FlexBox
      expect(flexBoxContainer).toHaveStyle({
        minHeight: '100vh',
        padding: '2rem',
      });
    });

    it('should render card with proper structure', () => {
      expect(screen.getByText('You have been logged out')).toBeInTheDocument();
      expect(screen.getByText('✓ Logout Successful')).toBeInTheDocument();
    });

    it('should render button with full width styling', () => {
      const button = screen.getByTestId('ui5-button');
      expect(button).toHaveStyle({ width: '100%' });
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      render(<LoggedOutPage />);

      // Wait for component to be ready
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should have proper button accessibility', () => {
      const button = screen.getByTestId('ui5-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sign In Again');
    });

    it('should have proper heading structure', () => {
      const heading = screen.getByText('✓ Logout Successful');
      expect(heading).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const button = screen.getByTestId('ui5-button');

      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Console logging', () => {
    beforeEach(async () => {
      render(<LoggedOutPage />);

      // Wait for component to be ready
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should log cleanup and state information', () => {
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[LoggedOut] Enforcing logout state on page load'
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[LoggedOut] Starting token cleanup while preserving logout state'
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        '[LoggedOut] Final logout state:',
        'true'
      );
    });
  });
});
