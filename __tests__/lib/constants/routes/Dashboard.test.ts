import {
  HOME,
  ABOUT,
  PROFILE,
  SETTINGS,
  MORE,
  MORE_SUB_ITEM_1,
  MORE_SUB_ITEM_2,
} from "@/lib/constants/routes/Dashboard";

describe("Dashboard Routes Constants", () => {
  describe("Route values", () => {
    it("should have correct route values", () => {
      expect(HOME).toBe("/");
      expect(ABOUT).toBe("/about");
      expect(PROFILE).toBe("/profile");
      expect(SETTINGS).toBe("/settings");
      expect(MORE).toBe("/more");
      expect(MORE_SUB_ITEM_1).toBe("/more/sub-item-1");
      expect(MORE_SUB_ITEM_2).toBe("/more/sub-item-2");
    });

    it("should have string type values", () => {
      expect(typeof HOME).toBe("string");
      expect(typeof ABOUT).toBe("string");
      expect(typeof PROFILE).toBe("string");
      expect(typeof SETTINGS).toBe("string");
      expect(typeof MORE).toBe("string");
      expect(typeof MORE_SUB_ITEM_1).toBe("string");
      expect(typeof MORE_SUB_ITEM_2).toBe("string");
    });
  });

  describe("Route patterns", () => {
    it("should start with forward slash", () => {
      const routes = [
        HOME,
        ABOUT,
        PROFILE,
        SETTINGS,
        MORE,
        MORE_SUB_ITEM_1,
        MORE_SUB_ITEM_2,
      ];

      routes.forEach((route) => {
        expect(route).toMatch(/^\//);
      });
    });

    it("should not have trailing slashes (except root)", () => {
      const routes = [
        ABOUT,
        PROFILE,
        SETTINGS,
        MORE,
        MORE_SUB_ITEM_1,
        MORE_SUB_ITEM_2,
      ];

      routes.forEach((route) => {
        expect(route).not.toMatch(/\/$/);
      });
    });

    it("sub-item routes should contain parent route", () => {
      expect(MORE_SUB_ITEM_1).toContain(MORE);
      expect(MORE_SUB_ITEM_2).toContain(MORE);
    });
  });

  describe("Route uniqueness", () => {
    it("should have unique route values", () => {
      const routes = [
        HOME,
        ABOUT,
        PROFILE,
        SETTINGS,
        MORE,
        MORE_SUB_ITEM_1,
        MORE_SUB_ITEM_2,
      ];
      const uniqueRoutes = new Set(routes);

      expect(uniqueRoutes.size).toBe(routes.length);
    });
  });

  describe("Exports availability", () => {
    it("should export all expected constants", () => {
      expect(HOME).toBeDefined();
      expect(ABOUT).toBeDefined();
      expect(PROFILE).toBeDefined();
      expect(SETTINGS).toBeDefined();
      expect(MORE).toBeDefined();
      expect(MORE_SUB_ITEM_1).toBeDefined();
      expect(MORE_SUB_ITEM_2).toBeDefined();
    });

    it("should not be empty strings", () => {
      const routes = [
        HOME,
        ABOUT,
        PROFILE,
        SETTINGS,
        MORE,
        MORE_SUB_ITEM_1,
        MORE_SUB_ITEM_2,
      ];

      routes.forEach((route) => {
        expect(route).not.toBe("");
        expect(route.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Route structure validation", () => {
    it("should follow REST conventions", () => {
      // Root route should be just "/"
      expect(HOME).toBe("/");

      // Single word routes should be lowercase
      expect(ABOUT).toMatch(/^\/[a-z]+$/);
      expect(PROFILE).toMatch(/^\/[a-z]+$/);
      expect(SETTINGS).toMatch(/^\/[a-z]+$/);
      expect(MORE).toMatch(/^\/[a-z]+$/);
    });

    it("should use kebab-case for multi-word routes", () => {
      // Pattern for routes with multiple segments: /segment/sub-segment
      expect(MORE_SUB_ITEM_1).toMatch(
        /^\/[a-z]+(-[a-z0-9]+)*(\/[a-z]+(-[a-z0-9]+)*)*$/
      );
      expect(MORE_SUB_ITEM_2).toMatch(
        /^\/[a-z]+(-[a-z0-9]+)*(\/[a-z]+(-[a-z0-9]+)*)*$/
      );
    });
  });
});
