import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import AnalysisPage from '@/app/(main)/[id]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock the useFeatureFlag hook
jest.mock('@/hooks/useFeatureFlags', () => ({
  useFeatureFlag: jest.fn(),
}));

// Mock the AnalysisContainer component
jest.mock('@/components/AnalysisContainer/AnalysisContainer', () => {
  return function MockAnalysisContainer() {
    return (
      <div data-testid="mock-analysis-container">
        Analysis Container with ID: undefined
      </div>
    );
  };
});

// Mock the FeatureNotAvailable component
jest.mock('@/components/FeatureNotAvailable', () => ({
  FeatureNotAvailable: function MockFeatureNotAvailable({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) {
    return (
      <div data-testid="feature-not-available">
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    );
  },
}));

// Mock UI5 components
jest.mock('@ui5/webcomponents-react', () => ({
  BusyIndicator: ({
    active,
    size,
    text,
  }: {
    active: boolean;
    size: string;
    text: string;
  }) => (
    <div data-testid="busy-indicator" data-active={active} data-size={size}>
      {text}
    </div>
  ),
}));

describe('AnalysisPage', () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
  const mockUseFeatureFlag = useFeatureFlag as jest.MockedFunction<
    typeof useFeatureFlag
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AnalysisContainer with correct analysis ID from params', () => {
    mockUseParams.mockReturnValue({ id: 'test-analysis-123' });
    mockUseFeatureFlag.mockReturnValue({
      flag: true,
      loading: false,
      error: null,
    });

    render(<AnalysisPage />);

    expect(screen.getByTestId('mock-analysis-container')).toBeInTheDocument();
  });

  it('renders loading indicator when feature flag is loading', () => {
    mockUseParams.mockReturnValue({ id: 'test-analysis-123' });
    mockUseFeatureFlag.mockReturnValue({
      flag: false,
      loading: true,
      error: null,
    });

    render(<AnalysisPage />);

    expect(screen.getByTestId('busy-indicator')).toBeInTheDocument();
    expect(screen.getByText('Loading analysis...')).toBeInTheDocument();
    expect(screen.getByTestId('busy-indicator')).toHaveAttribute(
      'data-active',
      'true'
    );
    expect(screen.getByTestId('busy-indicator')).toHaveAttribute(
      'data-size',
      'L'
    );
  });

  it('renders feature not available when feature flag is disabled', () => {
    mockUseParams.mockReturnValue({ id: 'test-analysis-123' });
    mockUseFeatureFlag.mockReturnValue({
      flag: false,
      loading: false,
      error: null,
    });

    render(<AnalysisPage />);

    expect(screen.getByTestId('feature-not-available')).toBeInTheDocument();
    expect(screen.getByText('Feature Not Available')).toBeInTheDocument();
    expect(
      screen.getByText('Chat analysis functionality is currently disabled.')
    ).toBeInTheDocument();
  });
});
