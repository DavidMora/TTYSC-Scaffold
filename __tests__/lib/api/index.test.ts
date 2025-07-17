import {
  httpClient,
  HttpClient,
  dataFetcher,
  DataFetcher,
  FetchAdapter,
  AxiosAdapter,
  MockAdapter,
  SWRAdapter,
  TanStackQueryAdapter,
} from "../../../src/lib/api";

describe("API index exports", () => {
  describe("Main exports", () => {
    it("should export httpClient as default instance", () => {
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it("should export HttpClient class", () => {
      expect(HttpClient).toBeDefined();
      expect(typeof HttpClient).toBe("function");
    });

    it("should export dataFetcher as default instance", () => {
      expect(dataFetcher).toBeInstanceOf(DataFetcher);
    });

    it("should export DataFetcher class", () => {
      expect(DataFetcher).toBeDefined();
      expect(typeof DataFetcher).toBe("function");
    });
  });

  describe("HTTP Client Adapters", () => {
    it("should export FetchAdapter", () => {
      expect(FetchAdapter).toBeDefined();
      expect(typeof FetchAdapter).toBe("function");
    });

    it("should export AxiosAdapter", () => {
      expect(AxiosAdapter).toBeDefined();
      expect(typeof AxiosAdapter).toBe("function");
    });

    it("should be able to create HttpClient with FetchAdapter", () => {
      const customHttpClient = new HttpClient(new FetchAdapter());
      expect(customHttpClient).toBeInstanceOf(HttpClient);
    });
  });

  describe("Data Fetcher Adapters", () => {
    it("should export MockAdapter", () => {
      expect(MockAdapter).toBeDefined();
      expect(typeof MockAdapter).toBe("function");
    });

    it("should export SWRAdapter", () => {
      expect(SWRAdapter).toBeDefined();
      expect(typeof SWRAdapter).toBe("function");
    });

    it("should export TanStackQueryAdapter", () => {
      expect(TanStackQueryAdapter).toBeDefined();
      expect(typeof TanStackQueryAdapter).toBe("function");
    });

    it("should be able to create DataFetcher with MockAdapter", () => {
      const customDataFetcher = new DataFetcher(new MockAdapter());
      expect(customDataFetcher).toBeInstanceOf(DataFetcher);
    });
  });

  describe("Integration", () => {
    it("should allow creating custom configurations", () => {
      const fetchAdapter = new FetchAdapter({
        baseURL: "https://api.example.com",
        timeout: 5000,
      });

      const customHttpClient = new HttpClient(fetchAdapter);
      const mockAdapter = new MockAdapter();
      const customDataFetcher = new DataFetcher(mockAdapter);

      expect(customHttpClient).toBeInstanceOf(HttpClient);
      expect(customDataFetcher).toBeInstanceOf(DataFetcher);
    });

    it("should maintain independent instances", () => {
      const httpClient1 = new HttpClient();
      const httpClient2 = new HttpClient();
      const dataFetcher1 = new DataFetcher();
      const dataFetcher2 = new DataFetcher();

      expect(httpClient1).not.toBe(httpClient2);
      expect(dataFetcher1).not.toBe(dataFetcher2);
      expect(httpClient1).not.toBe(httpClient);
      expect(dataFetcher1).not.toBe(dataFetcher);
    });
  });
});
