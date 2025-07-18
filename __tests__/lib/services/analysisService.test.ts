import { httpClient } from "@/lib/api";
import { getAnalysisById, createAnalysis, renameAnalysis } from "@/lib/services/analysisService";

jest.mock("@/lib/api", () => ({
  httpClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;
const mockResponse = (data: any, status = 200) => ({ data, status, statusText: "OK", headers: {} });
const BASE_URL = "http://localhost:5000/analysis";

const mockAnalysisData = {
  existing: { id: "test-id", name: "Test Analysis" },
  created: { id: "1640995200000", name: "" },
  updated: { id: "test-id", name: "Updated Analysis Name" },
};

describe("analysisService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1640995200000);
    jest.spyOn(Date.prototype, "toISOString").mockReturnValue("2022-01-01T00:00:00.000Z");
  });

  afterEach(() => jest.restoreAllMocks());

  describe("getAnalysisById", () => {
    it("should fetch analysis by id successfully", async () => {
      const response = mockResponse(mockAnalysisData.existing);
      
      mockHttpClient.get.mockResolvedValue(response);
      const result = await getAnalysisById("test-id");

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${BASE_URL}/test-id`);
      expect(result).toEqual(response);
    });
  });

  describe("createAnalysis", () => {
    it("should create analysis successfully", async () => {
      const response = mockResponse(mockAnalysisData.created, 201);
      
      mockHttpClient.post.mockResolvedValue(response);
      const result = await createAnalysis();

      expect(mockHttpClient.post).toHaveBeenCalledWith(BASE_URL, mockAnalysisData.created);
      expect(result).toEqual({ ...response, data: { analysis: mockAnalysisData.created } });
    });
  });

  describe("renameAnalysis", () => {
    it("should rename analysis successfully", async () => {
      const response = mockResponse(mockAnalysisData.updated);
      
      mockHttpClient.patch.mockResolvedValue(response);
      const result = await renameAnalysis("test-id", { name: "Updated Analysis Name" });

      expect(mockHttpClient.patch).toHaveBeenCalledWith(`${BASE_URL}/test-id`, {
        name: "Updated Analysis Name",
        updatedAt: "2022-01-01T00:00:00.000Z",
      });
      expect(result).toEqual({ ...response, data: { analysis: mockAnalysisData.updated } });
    });
  });
});
