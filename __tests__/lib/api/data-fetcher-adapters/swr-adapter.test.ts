import { SWRAdapter } from "../../../../src/lib/api/data-fetcher-adapters/swr-adapter";

describe("SWRAdapter", () => {
  let adapter: SWRAdapter;

  beforeEach(() => {
    adapter = new SWRAdapter();
  });

  describe("constructor", () => {
    it("should create adapter instance", () => {
      expect(adapter).toBeInstanceOf(SWRAdapter);
    });
  });

  describe("fetchData", () => {
    it("should throw error when SWR is not installed", () => {
      const mockFetcher = jest.fn();

      expect(() => {
        adapter.fetchData("test-key", mockFetcher);
      }).toThrow("SWRAdapter requires SWR to be installed. Run: yarn add swr");
    });

    it("should accept all required parameters", () => {
      const mockFetcher = jest.fn();
      const options = {
        enabled: true,
        retry: 3,
        refreshInterval: 1000,
      };

      expect(() => {
        adapter.fetchData("test-key", mockFetcher, options);
      }).toThrow(); // Should throw the SWR not installed error
    });
  });

  describe("export", () => {
    it("should export SWRAdapter as default", async () => {
      const swrAdapterModule = await import(
        "../../../../src/lib/api/data-fetcher-adapters/swr-adapter"
      );
      expect(swrAdapterModule.default).toBe(SWRAdapter);
    });

    it("should be exportable for conditional usage", () => {
      expect(SWRAdapter).toBeDefined();
      expect(typeof SWRAdapter).toBe("function");
    });
  });
});
