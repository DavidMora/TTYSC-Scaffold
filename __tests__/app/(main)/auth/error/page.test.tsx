import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import AuthError from '@/app/(main)/auth/error/page';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('AuthError Page', () => {
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(mockSearchParams as any);
    mockSearchParams.get.mockReturnValue(null);
  });

  it('renders default error message when no specific error', () => {
    mockSearchParams.get.mockReturnValue(null);

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('An authentication error occurred. Please try again.')
    ).toBeInTheDocument();
  });

  it('displays configuration error message', () => {
    mockSearchParams.get.mockReturnValue('Configuration');

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText(
        'There is a configuration error with the authentication provider.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Error code:\s*,?\s*Configuration/)
    ).toBeInTheDocument();
  });

  it('displays access denied error message', () => {
    mockSearchParams.get.mockReturnValue('AccessDenied');

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Access was denied. You may not have permission to sign in.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Error code:\s*,?\s*AccessDenied/)
    ).toBeInTheDocument();
  });

  it('displays verification error message', () => {
    mockSearchParams.get.mockReturnValue('Verification');

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('The verification token has expired or is invalid.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Error code:\s*,?\s*Verification/)
    ).toBeInTheDocument();
  });

  it('displays default error for session expired', () => {
    mockSearchParams.get.mockReturnValue('SessionExpired');

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('An authentication error occurred. Please try again.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Error code:\s*,?\s*SessionExpired/)
    ).toBeInTheDocument();
  });

  it('displays default error for unrecognized error types', () => {
    mockSearchParams.get.mockReturnValue('UnknownError');

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('An authentication error occurred. Please try again.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Error code:\s*,?\s*UnknownError/)
    ).toBeInTheDocument();
  });

  it('handles case-sensitive error types', () => {
    mockSearchParams.get.mockReturnValue('accessdenied');

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('An authentication error occurred. Please try again.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Error code:\s*,?\s*accessdenied/)
    ).toBeInTheDocument();
  });

  it('renders retry button for all errors', () => {
    mockSearchParams.get.mockReturnValue('Configuration');

    render(<AuthError />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls signIn when retry button is clicked', () => {
    mockSearchParams.get.mockReturnValue('AccessDenied');

    render(<AuthError />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockSignIn).toHaveBeenCalledWith('nvlogin', { callbackUrl: '/' });
  });

  it('handles retry button click for different error types', () => {
    mockSearchParams.get.mockReturnValue('Verification');

    render(<AuthError />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockSignIn).toHaveBeenCalledWith('nvlogin', { callbackUrl: '/' });
  });

  it('renders correct UI structure', () => {
    render(<AuthError />);

    // Check for error title
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();

    // Check for retry button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Try Again');
  });

  it('displays error code when error exists', () => {
    mockSearchParams.get.mockReturnValue('Configuration');

    render(<AuthError />);

    expect(screen.getByText(/Error code:/)).toBeInTheDocument();
    expect(
      screen.getByText(/Error code:\s*,?\s*Configuration/)
    ).toBeInTheDocument();
  });

  it('does not display error code when no error', () => {
    mockSearchParams.get.mockReturnValue(null);

    render(<AuthError />);

    expect(screen.queryByText(/Error code:/)).not.toBeInTheDocument();
  });

  it('handles Default error type explicitly', () => {
    mockSearchParams.get.mockReturnValue('Default');

    render(<AuthError />);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('An authentication error occurred. Please try again.')
    ).toBeInTheDocument();
    expect(screen.getByText(/Error code:\s*,?\s*Default/)).toBeInTheDocument();
  });

  it('maintains consistent error display structure', () => {
    const errorTypes = [
      'Configuration',
      'AccessDenied',
      'Verification',
      'Unknown',
    ];

    errorTypes.forEach((errorType) => {
      mockSearchParams.get.mockReturnValue(errorType);
      const { unmount } = render(<AuthError />);

      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Try Again' })
      ).toBeInTheDocument();

      unmount();
    });
  });
});
