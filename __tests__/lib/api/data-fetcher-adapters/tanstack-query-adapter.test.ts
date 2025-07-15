import { TanStackQueryAdapter } from "../../../../src/lib/api/data-fetcher-adapters/tanstack-query-adapter";

describe("TanStackQueryAdapter", () => {
  it("should throw error when @tanstack/react-query is not installed", () => {
    expect(() => {
      const adapter = new TanStackQueryAdapter();
      return adapter;
    }).toThrow(
      "TanStackQueryAdapter requires @tanstack/react-query to be installed. Run: yarn add @tanstack/react-query"
    );
  });

  it("should be exportable for conditional usage", () => {
    expect(TanStackQueryAdapter).toBeDefined();
    expect(typeof TanStackQueryAdapter).toBe("function");
  });

  describe("export", () => {
    it("should export TanStackQueryAdapter as default", async () => {
      const tanstackAdapterModule = await import(
        "../../../../src/lib/api/data-fetcher-adapters/tanstack-query-adapter"
      );
      expect(tanstackAdapterModule.default).toBe(TanStackQueryAdapter);
    });
  });
});
