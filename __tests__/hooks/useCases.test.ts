import { renderHook } from '@testing-library/react';
import { useCasesAnalysis, useCasesByAnalysis } from '@/hooks/useCases';
import { dataFetcher } from '@/lib/api';
import * as casesService from '@/lib/services/cases.service';

jest.mock('@/lib/api');
jest.mock('@/lib/services/cases.service');

const mockDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;
const mockCasesService = casesService as jest.Mocked<typeof casesService>;

describe('useCases hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataFetcher.fetchData.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });
  });

  describe('useCasesAnalysis', () => {
    it('should fetch cases analysis data', () => {
      renderHook(() => useCasesAnalysis());

      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        'cases_analysis',
        expect.any(Function)
      );

      const fetcherFunction = mockDataFetcher.fetchData.mock.calls[0][1];
      fetcherFunction();
      expect(mockCasesService.getCasesAnalysis).toHaveBeenCalled();
    });
  });

  describe('useCasesByAnalysis', () => {
    const analysisNameType = 'test-analysis';

    it('should fetch cases by analysis with correct key and parameters', () => {
      renderHook(() => useCasesByAnalysis(analysisNameType));

      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        `cases_${analysisNameType}`,
        expect.any(Function)
      );

      const fetcherFunction = mockDataFetcher.fetchData.mock.calls[0][1];
      fetcherFunction();
      expect(mockCasesService.getCasesByAnalysis).toHaveBeenCalledWith(
        analysisNameType
      );
    });
  });
});
