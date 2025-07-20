import { httpClient } from "@/lib/api";
import { BASE_URL } from "@/lib/constants/config";
import {
  GET_CASES_ANALYSIS,
  GET_CASES_BY_ANALYSIS,
} from "@/lib/constants/api/cases";
import {
  getCasesAnalysis,
  getCasesByAnalysis,
} from "@/lib/services/casesService";
import {
  CasesAnalysisResponse,
  CasesResponse,
} from "@/lib/types/analysisFilters";

jest.mock("@/lib/api", () => ({
  httpClient: { get: jest.fn() },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;
const mockResponse = (data: unknown, status = 200) => ({
  data,
  status,
  statusText: "OK",
  headers: {},
});

const mockCasesAnalysisData: CasesAnalysisResponse = {
  data: {
    analysis: [
      { key: "analysis1", name: "Analysis 1" },
      { key: "analysis2", name: "Analysis 2" },
    ],
  },
};

const mockCasesData: CasesResponse = {
  data: {
    analysis: [
      {
        key: "analysis1",
        name: "Analysis Cases",
      },
    ],
    CM: [{ key: "cm1", name: "CM 1" }],
    SKU: [{ key: "sku2", name: "SKU 2" }],
    NVPN: [{ key: "nvpn1", name: "NVPN 1" }],
    organizations: [{ key: "org1", name: "Organization 1" }],
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

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${BASE_URL}${GET_CASES_ANALYSIS}`
      );
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });
  });

  describe("getCasesByAnalysis", () => {
    it("should fetch cases by analysis successfully", async () => {
      const response = mockResponse(mockCasesData);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await getCasesByAnalysis("test-analysis");

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${BASE_URL}${GET_CASES_BY_ANALYSIS("test-analysis")}`
      );
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });
  });
});
