import { httpClient } from "@/lib/api";
import { GET_CASES_ANALYSIS, GET_CASES_BY_ANALYSIS } from "@/lib/constants/api/cases";
import { BASE_URL } from "@/lib/constants/config";
import { getCasesAnalysis, getCasesByAnalysis } from "@/lib/services/casesService";

jest.mock("@/lib/api", () => ({
  httpClient: { get: jest.fn() },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;
const mockResponse = (data: any, status = 200) => ({ data, status, statusText: "OK", headers: {} });

const mockCasesAnalysisData = {
  analysisTypes: [
    { name: "Supply Gap Analysis", key: "supply_gap" },
    { name: "Demand Forecast Analysis", key: "demand_forecast" },
  ],
};

const mockCasesData = {
  analysisNameType: "supply_gap",
  filters: {
    organizations: ["North America", "Europe"],
    CM: ["Site 001 - New York", "Site 002 - Chicago"],
    SKU: ["SKU-12345", "SKU-23456"],
    NVPN: ["NVPN-001", "NVPN-002"],
  },
};

describe("casesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCasesAnalysis", () => {
    it("should fetch cases analysis successfully", async () => {
      const response = mockResponse(mockCasesAnalysisData);
      
      mockHttpClient.get.mockResolvedValue(response);
      const result = await getCasesAnalysis();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${BASE_URL}${GET_CASES_ANALYSIS}`);
      expect(result).toEqual(response);
    });

    it("should handle error when fetching cases analysis", async () => {
      const error = new Error("Network error");
      mockHttpClient.get.mockRejectedValue(error);

      await expect(getCasesAnalysis()).rejects.toThrow("Network error");
    });
  });

  describe("getCasesByAnalysis", () => {
    it("should fetch cases by analysis successfully", async () => {
      const response = mockResponse(mockCasesData);
      
      mockHttpClient.get.mockResolvedValue(response);
      const result = await getCasesByAnalysis("supply_gap");

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${BASE_URL}${GET_CASES_BY_ANALYSIS("supply_gap")}`);
      expect(result).toEqual(response);
    });

    it("should handle error when fetching cases by analysis", async () => {
      const error = new Error("Network error");
      mockHttpClient.get.mockRejectedValue(error);

      await expect(getCasesByAnalysis("supply_gap")).rejects.toThrow("Network error");
    });
  });
});