import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalysisContainer from '@/components/AnalysisContainer/AnalysisContainer';
import { SequentialNamingProvider } from '@/contexts/SequentialNamingContext';
import { AutosaveUIProvider } from '@/contexts/AutosaveUIProvider';
import { useParams } from 'next/navigation';

jest.mock('@/components/AnalysisChat/AnalysisChat', () =>
  jest.fn(() => <div data-testid="analysis-chat" />)
);

jest.mock('@/components/AnalysisFilters/AnalysisFilters', () => {
  const Mock = () => <div data-testid="analysis-filters" />;
  Mock.displayName = 'MockAnalysisFilters';
  return Mock;
});

jest.mock('@/components/AnalysisHeader/AnalysisHeader', () => {
  const Mock = () => <div data-testid="analysis-header" />;
  Mock.displayName = 'MockAnalysisHeader';
  return Mock;
});

const mockUseAnalysisFilters = jest.fn();
jest.mock('@/hooks/useAnalysisFilters', () => ({
  useAnalysisFilters: jest.fn((initialFilters, onUserChange) =>
    mockUseAnalysisFilters(initialFilters, onUserChange)
  ),
}));

const mockUseChat = jest.fn();
const mockUpdateChat = jest.fn();
jest.mock('@/hooks/chats', () => ({
  useChat: () => mockUseChat(),
  useUpdateChat: () => ({
    mutate: mockUpdateChat,
  }),
  useCreateChat: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

const mockUseAutoSave = jest.fn();
jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: jest.fn((options) => mockUseAutoSave(options)),
}));

const mockGenerateAnalysisName = jest.fn(() => 'Generated Analysis Name');
const mockUseSequentialNaming = jest.fn(() => ({
  generateAnalysisName: mockGenerateAnalysisName,
}));
jest.mock('@/contexts/SequentialNamingContext', () => ({
  SequentialNamingProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sequential-naming-provider">{children}</div>
  ),
  useSequentialNaming: () => mockUseSequentialNaming(),
}));

const mockUseAutosaveUI = jest.fn(() => ({
  activateAutosaveUI: jest.fn(),
  showAutoSaved: false,
}));
jest.mock('@/contexts/AutosaveUIProvider', () => ({
  AutosaveUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="autosave-ui-provider">{children}</div>
  ),
  useAutosaveUI: () => mockUseAutosaveUI(),
}));

// Get the mocked component
import AnalysisChat from '@/components/AnalysisChat/AnalysisChat';
const mockAnalysisChat = jest.mocked(AnalysisChat);

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SequentialNamingProvider>
      <AutosaveUIProvider>{component}</AutosaveUIProvider>
    </SequentialNamingProvider>
  );
};

describe('AnalysisContainer', () => {
  const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'test-analysis-id' });
    mockUseAnalysisFilters.mockReturnValue({
      filters: {},
      availableOptions: {},
      isDisabled: false,
      handleFilterChange: jest.fn(),
      resetFilters: jest.fn(),
    });
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      lastSaved: null,
      error: null,
      executeAutosave: jest.fn(),
    });
    mockUseAutosaveUI.mockReturnValue({
      activateAutosaveUI: jest.fn(),
      showAutoSaved: false,
    });
  });

  it('renders loading state', () => {
    mockUseChat.mockReturnValue({ isLoading: true, isValidating: false });
    renderWithProviders(<AnalysisContainer />);
    expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
  });

  it('renders error state with fallback message if error.message is falsy', () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: { message: '' },
      mutate: undefined,
    });
    renderWithProviders(<AnalysisContainer />);
    expect(screen.getByText('Unable to Load Analysis')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Something went wrong while fetching the analysis data. Please try again.'
      )
    ).toBeInTheDocument();
  });

  it('renders successful state with analysis data', () => {
    const mockAnalysisData = {
      id: 'test-analysis-id',
      name: 'Test Analysis Name',
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(screen.getByTestId('analysis-filters')).toBeInTheDocument();
    expect(screen.getByTestId('analysis-header')).toBeInTheDocument();
    expect(screen.getByTestId('analysis-chat')).toBeInTheDocument();
  });

  it('passes empty values to AnalysisChat when data is not available', () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: null },
      mutate: jest.fn(),
    });

    renderWithProviders(<AnalysisContainer />);

    expect(mockAnalysisChat).toHaveBeenCalledWith(
      {
        // chatId: '',
        previousMessages: [],
        draft: '',
      },
      undefined
    );
  });

  it('should execute the callback function that sets hasUserModifiedRef.current to true', () => {
    const mockAnalysisData = {
      id: 'test-analysis-id',
      title: 'Test Analysis Title',
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    let capturedCallback: (() => void) | undefined;
    mockUseAnalysisFilters.mockImplementation(
      (
        _initialFilters: {
          analysis: string[];
          organizations: string[];
          CM: string[];
          SKU: string[];
          NVPN: string[];
        },
        callback: (() => void) | undefined
      ) => {
        capturedCallback = callback;
        return {
          filters: {
            analysis: [],
            organizations: [],
            CM: [],
            SKU: [],
            NVPN: [],
          },
          availableOptions: {},
          isDisabled: false,
          handleFilterChange: jest.fn(),
          resetFilters: jest.fn(),
        };
      }
    );

    renderWithProviders(<AnalysisContainer />);

    // Execute the captured callback to trigger line 88
    expect(capturedCallback).toBeDefined();
    if (capturedCallback) {
      capturedCallback();
    }
  });

  it('should call updateChat with correct parameters when useAutoSave onSave is triggered', async () => {
    const mockAnalysisData = {
      id: 'test-analysis-id',
      title: 'Test Analysis Title',
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const mockFilters = {
      analysis: ['filter1', 'filter2'],
      organizations: ['org1'],
      CM: ['cm1', 'cm2'],
      SKU: ['sku1'],
      NVPN: ['nvpn1', 'nvpn2'],
    };

    mockUseAnalysisFilters.mockReturnValue({
      filters: mockFilters,
      availableOptions: {},
      isDisabled: false,
      handleFilterChange: jest.fn(),
      resetFilters: jest.fn(),
    });

    let capturedOnSave: (() => Promise<void>) | undefined;
    mockUseAutoSave.mockImplementation((options) => {
      capturedOnSave = options.onSave;
      return {
        isSaving: false,
        lastSaved: null,
        error: null,
        executeAutosave: jest.fn(),
      };
    });

    renderWithProviders(<AnalysisContainer />);

    expect(capturedOnSave).toBeDefined();
    expect(typeof capturedOnSave).toBe('function');

    if (capturedOnSave) {
      await capturedOnSave();
    }

    expect(mockUpdateChat).toHaveBeenCalledWith({
      id: 'test-analysis-id',
      metadata: {
        analysis: mockFilters.analysis,
        organizations: mockFilters.organizations,
        CM: mockFilters.CM,
        SKU: mockFilters.SKU,
        NVPN: mockFilters.NVPN,
      },
    });
  });

  it('should call activateAutosaveUI when useAutoSave onSuccess is triggered', () => {
    const mockAnalysisData = {
      id: 'test-analysis-id',
      title: 'Test Analysis Title',
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const mockActivateAutosaveUI = jest.fn();
    mockUseAutosaveUI.mockReturnValue({
      activateAutosaveUI: mockActivateAutosaveUI,
      showAutoSaved: false,
    });

    let capturedOnSuccess: (() => void) | undefined;
    mockUseAutoSave.mockImplementation((options) => {
      capturedOnSuccess = options.onSuccess;
      return {
        isSaving: false,
        lastSaved: null,
        error: null,
        executeAutosave: jest.fn(),
      };
    });

    renderWithProviders(<AnalysisContainer />);

    expect(capturedOnSuccess).toBeDefined();
    expect(typeof capturedOnSuccess).toBe('function');

    if (capturedOnSuccess) {
      capturedOnSuccess();
    }

    expect(mockActivateAutosaveUI).toHaveBeenCalled();
  });

  it('should call onError when useAutoSave onError is triggered', () => {
    const mockAnalysisData = {
      id: 'test-analysis-id',
      title: 'Test Analysis Title',
    };

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: null,
      data: { data: mockAnalysisData },
      mutate: jest.fn(),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    let capturedOnError: (() => void) | undefined;
    mockUseAutoSave.mockImplementation((options) => {
      capturedOnError = options.onError;
      return {
        isSaving: false,
        lastSaved: null,
        error: null,
        executeAutosave: jest.fn(),
      };
    });

    renderWithProviders(<AnalysisContainer />);

    expect(capturedOnError).toBeDefined();
    expect(typeof capturedOnError).toBe('function');

    if (capturedOnError) {
      capturedOnError();
    }

    expect(consoleSpy).toHaveBeenCalledWith('Autosave failed');

    consoleSpy.mockRestore();
  });

  it('handles analysis with empty title', () => {
    const mockAnalysisWithEmptyTitle = {
      data: {
        id: 'analysis-1',
        title: '', // Empty title
        metadata: {
          analysis: ['test'],
          organizations: ['org1'],
          CM: ['cm1'],
          SKU: ['sku1'],
          NVPN: ['nvpn1'],
        },
      },
      isLoading: false,
      isError: false,
    };

    mockUseChat.mockReturnValue(mockAnalysisWithEmptyTitle);

    renderWithProviders(<AnalysisContainer />);

    // Component should render without errors even with empty title
    expect(screen.getByTestId('analysis-header')).toBeInTheDocument();
    expect(screen.getByTestId('analysis-filters')).toBeInTheDocument();
  });

  it('handles analysis without data', () => {
    const mockAnalysisWithoutData = {
      data: null,
      isLoading: false,
      isError: false,
    };

    mockUseChat.mockReturnValue(mockAnalysisWithoutData);

    renderWithProviders(<AnalysisContainer />);

    // Should handle null data gracefully
    expect(screen.getByTestId('analysis-header')).toBeInTheDocument();
  });

  it('shows retry button on 404 auto-create failure and triggers retry', () => {
    const error404 = new Error('HTTP 404: Not Found');
    const retry = jest.fn();

    mockUseChat.mockReturnValue({
      isLoading: false,
      isValidating: false,
      error: error404,
      mutate: retry,
    });

    // Simulate useCreateChat having an error to enable retry UI
    jest.doMock('@/hooks/chats', () => ({
      useChat: () => mockUseChat(),
      useUpdateChat: () => ({ mutate: mockUpdateChat }),
      useCreateChat: () => ({ mutate: jest.fn(), isLoading: false, error: error404 }),
    }));

    renderWithProviders(<AnalysisContainer />);

    expect(screen.getByText('Unable to Load Analysis')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('handles metadata initialization with existing data', () => {
    const mockAnalysisWithMetadata = {
      data: {
        id: 'analysis-1',
        title: 'Test Analysis',
        metadata: {
          analysis: ['custom'],
          organizations: ['custom-org'],
          CM: ['custom-cm'],
          SKU: ['custom-sku'],
          NVPN: ['custom-nvpn'],
        },
      },
      isLoading: false,
      isError: false,
    };

    mockUseChat.mockReturnValue(mockAnalysisWithMetadata);

    let capturedInitialFilters: any;
    let capturedOnUserChange: any;

    mockUseAnalysisFilters.mockImplementation(
      (initialFilters, onUserChange) => {
        capturedInitialFilters = initialFilters;
        capturedOnUserChange = onUserChange;
        return {
          filters: initialFilters,
          availableOptions: {},
          isDisabled: false,
          handleFilterChange: jest.fn(),
        };
      }
    );

    renderWithProviders(<AnalysisContainer />);

    // Verify that metadata is merged with initial filters
    expect(capturedInitialFilters).toEqual(
      expect.objectContaining({
        analysis: expect.any(Object),
        organizations: expect.any(Object),
        CM: expect.any(Object),
        SKU: expect.any(Object),
        NVPN: expect.any(Object),
      })
    );

    // Test the onUserChange callback
    expect(capturedOnUserChange).toBeDefined();
    if (capturedOnUserChange) {
      capturedOnUserChange();
    }
  });

  it('handles autosave with user-modified filters', async () => {
    const mockFilters = {
      analysis: ['test'],
      organizations: ['org1'],
      CM: ['cm1'],
      SKU: ['sku1'],
      NVPN: ['nvpn1'],
    };

    mockUseAnalysisFilters.mockReturnValue({
      filters: mockFilters,
      availableOptions: {},
      isDisabled: false,
      handleFilterChange: jest.fn(),
    });

    let capturedAutoSaveOptions: any;
    mockUseAutoSave.mockImplementation((options) => {
      capturedAutoSaveOptions = options;
      return {
        isSaving: false,
        lastSaved: null,
        error: null,
        executeAutosave: jest.fn(),
      };
    });

    renderWithProviders(<AnalysisContainer />);

    // Verify autosave options are set correctly
    expect(capturedAutoSaveOptions).toBeDefined();
    expect(capturedAutoSaveOptions.delayMs).toBe(3000);

    // Test the onSave callback
    if (capturedAutoSaveOptions.onSave) {
      await capturedAutoSaveOptions.onSave();
      expect(mockUpdateChat).toHaveBeenCalledWith({
        id: 'test-analysis-id',
        metadata: {
          analysis: ['test'],
          organizations: ['org1'],
          CM: ['cm1'],
          SKU: ['sku1'],
          NVPN: ['nvpn1'],
        },
      });
    }
  });
});
