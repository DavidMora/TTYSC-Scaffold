import { renderHook } from "@testing-library/react";
import { useCasesAnalysis, useCasesByAnalysis, CASES_ANALYSIS_KEY, CASES_KEY } from "@/hooks/useCases";
import * as casesService from "@/lib/services/casesService";
import { dataFetcher } from "@/lib/api";

jest.mock("@/lib/services/casesService");
jest.mock("@/lib/api", () => ({
  dataFetcher: {
    fetchData: jest.fn(),
  },
}));

const mockCasesService = casesService as jest.Mocked<typeof casesService>;
const mockDataFetcher = dataFetcher as jest.Mocked<typeof dataFetcher>;

describe("useCases hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useCasesAnalysis", () => {
    it("should fetch cases analysis data", () => {
      mockDataFetcher.fetchData.mockReturnValue({ data: undefined, error: undefined, isLoading: false });
      renderHook(() => useCasesAnalysis());
      
      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(CASES_ANALYSIS_KEY, expect.any(Function));
      mockDataFetcher.fetchData.mock.calls[0][1]();
      expect(mockCasesService.getCasesAnalysis).toHaveBeenCalled();
    });

    it("should return loading state", () => {
      mockDataFetcher.fetchData.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
      const { result } = renderHook(() => useCasesAnalysis());
      
      expect(result.current.isLoading).toBe(true);
    });

    it("should return data when available", () => {
      const mockData = {
        analysisTypes: [
          { name: "Supply Gap Analysis", key: "supply_gap" },
          { name: "Demand Forecast Analysis", key: "demand_forecast" },
        ],
      };
      mockDataFetcher.fetchData.mockReturnValue({ data: mockData, error: undefined, isLoading: false });
      const { result } = renderHook(() => useCasesAnalysis());
      
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("useCasesByAnalysis", () => {
    it("should fetch cases by analysis with correct cache key", () => {
      const analysisNameType = "supply_gap";
      mockDataFetcher.fetchData.mockReturnValue({ data: undefined, error: undefined, isLoading: false });
      renderHook(() => useCasesByAnalysis(analysisNameType));
      
      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        `${CASES_KEY}_${analysisNameType}`,
        expect.any(Function)
      );
      mockDataFetcher.fetchData.mock.calls[0][1]();
      expect(mockCasesService.getCasesByAnalysis).toHaveBeenCalledWith(analysisNameType);
    });

    it("should return loading state", () => {
      mockDataFetcher.fetchData.mockReturnValue({ data: undefined, error: undefined, isLoading: true });
      const { result } = renderHook(() => useCasesByAnalysis("supply_gap"));
      
      expect(result.current.isLoading).toBe(true);
    });

    it("should return data when available", () => {
      const mockData = {
        analysisNameType: "supply_gap",
        filters: {
          organizations: ["North America", "Europe"],
          CM: ["Site 001 - New York", "Site 002 - Chicago"],
          SKU: ["SKU-12345", "SKU-23456"],
          NVPN: ["NVPN-001", "NVPN-002"],
        },
      };
      mockDataFetcher.fetchData.mockReturnValue({ data: mockData, error: undefined, isLoading: false });
      const { result } = renderHook(() => useCasesByAnalysis("supply_gap"));
      
      expect(result.current.data).toEqual(mockData);
    });

    it("should handle empty analysis name type", () => {
      mockDataFetcher.fetchData.mockReturnValue({ data: undefined, error: undefined, isLoading: false });
      renderHook(() => useCasesByAnalysis(""));
      
      expect(mockDataFetcher.fetchData).toHaveBeenCalledWith(
        `${CASES_KEY}_`,
        expect.any(Function)
      );
    });
  });
});