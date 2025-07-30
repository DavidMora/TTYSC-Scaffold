import {
  HOME,
  ABOUT,
  PROFILE,
  SETTINGS,
  MORE,
  MORE_SUB_ITEM_1,
  MORE_SUB_ITEM_2,
} from "@/lib/constants/routes/Dashboard";

describe("Dashboard Routes", () => {
  it("should export all dashboard routes", () => {
    expect(HOME).toBeDefined();
    expect(ABOUT).toBeDefined();
    expect(PROFILE).toBeDefined();
    expect(SETTINGS).toBeDefined();
    expect(MORE).toBeDefined();
    expect(MORE_SUB_ITEM_1).toBeDefined();
    expect(MORE_SUB_ITEM_2).toBeDefined();
  });

  it("should have correct route values", () => {
    expect(HOME).toBe("/");
    expect(ABOUT).toBe("/about");
    expect(PROFILE).toBe("/profile");
    expect(SETTINGS).toBe("/settings");
    expect(MORE).toBe("/more");
    expect(MORE_SUB_ITEM_1).toBe("/more/sub-item-1");
    expect(MORE_SUB_ITEM_2).toBe("/more/sub-item-2");
  });
});
