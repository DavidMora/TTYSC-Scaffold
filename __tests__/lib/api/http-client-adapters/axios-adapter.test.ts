import { AxiosAdapter } from "../../../../src/lib/api/http-client-adapters/axios-adapter";

describe("AxiosAdapter", () => {
  it("should throw error when axios is not installed", () => {
    expect(() => {
      const adapter = new AxiosAdapter();
      return adapter;
    }).toThrow(
      "AxiosAdapter requires axios to be installed. Run: yarn add axios @types/axios"
    );
  });

  it("should be exportable for conditional usage", () => {
    expect(AxiosAdapter).toBeDefined();
    expect(typeof AxiosAdapter).toBe("function");
  });
});
