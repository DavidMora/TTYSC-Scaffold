import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/(main)/page';
import '@testing-library/jest-dom';
import React from 'react';
import { useCreateChat } from '@/hooks/chats';
import {
  useSequentialNaming,
  SequentialNamingProvider,
} from '@/contexts/SequentialNamingContext';

const mockPush = jest.fn();
const mockMutate = jest.fn();
const mockGenerateAnalysisName = jest.fn();
const mockUseFeatureFlag = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

jest.mock('@/hooks/chats', () => ({
  useCreateChat: jest.fn(),
}));

jest.mock('@/contexts/SequentialNamingContext', () => ({
  useSequentialNaming: jest.fn(),
  SequentialNamingProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('@/hooks/useFeatureFlags', () => ({
  useFeatureFlag: () => mockUseFeatureFlag(),
}));

const mockUseCreateChat = useCreateChat as jest.MockedFunction<
  typeof useCreateChat
>;

const mockUseSequentialNaming = useSequentialNaming as jest.MockedFunction<
  typeof useSequentialNaming
>;

// Helper function to render component with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <SequentialNamingProvider>{component}</SequentialNamingProvider>
  );
};

describe('Home page', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockMutate.mockClear();
    mockGenerateAnalysisName.mockClear();
    mockUseFeatureFlag.mockClear();
    jest.clearAllMocks();

    // Default mock for useFeatureFlag
    mockUseFeatureFlag.mockReturnValue({
      flag: true,
      loading: false,
    });

    // Default mock for useSequentialNaming
    mockUseSequentialNaming.mockReturnValue({
      generateAnalysisName: mockGenerateAnalysisName,
      currentCounter: 1,
    });

    // Default mock for useCreateChat
    mockUseCreateChat.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutate,
      isSuccess: false,
      isError: false,
      isIdle: true,
      reset: jest.fn(),
      data: undefined,
      error: undefined,
      isLoading: true,
    });
  });

  it('renders loading display by default', () => {
    mockGenerateAnalysisName.mockReturnValue('Analysis One');

    renderWithProvider(<Home />);

    expect(screen.getByText('Creating Your Analysis...')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Setting up your analysis dashboard. You'll be redirected automatically."
      )
    ).toBeInTheDocument();
  });

  it('calls createAnalysis on mount with generated name', async () => {
    mockGenerateAnalysisName.mockReturnValue('Analysis One');

    renderWithProvider(<Home />);

    await waitFor(() => {
      expect(mockGenerateAnalysisName).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Analysis One',
      });
    });
  });

  it('navigates to analysis page on successful creation', async () => {
    const mockAnalysis = {
      success: true,
      message: 'Analysis created successfully',
      data: {
        id: 'test-analysis-id',
        date: '2021-01-01',
        participants: [],
        title: 'Test Analysis',
        messages: [],
      },
    };

    mockGenerateAnalysisName.mockReturnValue('Analysis One');

    // Mock the hook to simulate success
    mockUseCreateChat.mockImplementation(({ onSuccess }) => {
      // Simulate the success callback being called
      React.useEffect(() => {
        if (onSuccess) {
          onSuccess(mockAnalysis);
        }
      }, [onSuccess]);

      return {
        mutate: mockMutate,
        mutateAsync: mockMutate,
        isSuccess: true,
        isError: false,
        isIdle: false,
        data: mockAnalysis,
        error: undefined,
        isLoading: false,
        reset: jest.fn(),
      };
    });

    renderWithProvider(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/test-analysis-id');
    });
  });

  it('handles retry functionality correctly', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const testError = new Error('Failed to create analysis');

    mockGenerateAnalysisName.mockReturnValue('Analysis One');

    // Mock the hook to simulate error
    mockUseCreateChat.mockImplementation(({ onError }) => {
      React.useEffect(() => {
        if (onError) {
          onError(testError);
        }
      }, [onError]);

      return {
        mutate: mockMutate,
        mutateAsync: mockMutate,
        isSuccess: false,
        isError: true,
        isIdle: false,
        data: undefined,
        error: testError,
        isLoading: false,
        reset: jest.fn(),
      };
    });

    renderWithProvider(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    mockMutate.mockClear();
    mockGenerateAnalysisName.mockReturnValue('Analysis Two');

    const retryButton = screen.getByText('Try again');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockGenerateAnalysisName).toHaveBeenCalledTimes(2);
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Analysis Two',
      });
    });

    consoleSpy.mockRestore();
  });

  it('renders loading display when feature flag is loading', () => {
    mockUseFeatureFlag.mockReturnValue({
      flag: false,
      loading: true,
    });

    renderWithProvider(<Home />);

    expect(screen.getByText('Creating Your Analysis...')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Setting up your analysis dashboard. You'll be redirected automatically."
      )
    ).toBeInTheDocument();
  });

  it('renders feature not available when feature flag is disabled', () => {
    mockUseFeatureFlag.mockReturnValue({
      flag: false,
      loading: false,
    });

    renderWithProvider(<Home />);

    expect(screen.getByText('Feature Not Available')).toBeInTheDocument();
    expect(
      screen.getByText('Chat analysis functionality is currently disabled.')
    ).toBeInTheDocument();
  });
});
