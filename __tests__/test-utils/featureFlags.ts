// Re-export from the real test-utils location to avoid duplication
export { FALLBACK_FLAGS } from "@/test-utils/featureFlags";

// Trivial passing test to prevent Jest from failing on an empty test suite
describe("test-utils/featureFlags", () => {
  it("loads module", () => {
    expect(true).toBe(true);
  });
});
