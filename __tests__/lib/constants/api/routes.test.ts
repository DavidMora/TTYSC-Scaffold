import {
  BASE,
  SETTINGS,
  DEFINITIONS,
  DEFINITION,
  DEFINITION_DETAILS,
  FEEDBACKS,
  FEEDBACK,
  CHATS,
  CHAT,
  CHAT_MESSAGES,
  CHAT_MESSAGE,
  CASES,
  CASE_ANALYSIS,
  CASES_BY_ANALYSIS,
} from "@/lib/constants/api/routes";

describe("API Routes", () => {
  beforeEach(() => {
    // Reset environment variable
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  describe("BASE route", () => {
    it("uses default localhost when NEXT_PUBLIC_API_BASE_URL is not set", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      const routes = require("@/lib/constants/api/routes");
      expect(routes.BASE).toBe("http://localhost:5000");
    });

    it("uses NEXT_PUBLIC_API_BASE_URL when set", () => {
      const customUrl = "https://api.example.com";
      process.env.NEXT_PUBLIC_API_BASE_URL = customUrl;
      
      // Re-import the module to get updated BASE value
      jest.resetModules();
      const routes = require("@/lib/constants/api/routes");
      expect(routes.BASE).toBe(customUrl);
    });
  });

  describe("Static routes", () => {
    it("exports correct static API routes", () => {
      expect(SETTINGS).toContain("/settings");
      expect(DEFINITIONS).toContain("/definitions");
      expect(FEEDBACKS).toContain("/feedback");
      expect(CHATS).toContain("/chats");
      expect(CHAT_MESSAGE).toContain("/chat");
      expect(CASES).toContain("/cases");
      expect(CASE_ANALYSIS).toContain("/cases/analysis");
    });

    it("all static routes include base URL", () => {
      expect(SETTINGS.includes(BASE)).toBe(true);
      expect(DEFINITIONS.includes(BASE)).toBe(true);
      expect(FEEDBACKS.includes(BASE)).toBe(true);
      expect(CHATS.includes(BASE)).toBe(true);
      expect(CHAT_MESSAGE.includes(BASE)).toBe(true);
      expect(CASES.includes(BASE)).toBe(true);
      expect(CASE_ANALYSIS.includes(BASE)).toBe(true);
    });
  });

  describe("Dynamic routes with parameters", () => {
    it("DEFINITION function creates correct route with ID", () => {
      const testId = "test-definition-123";
      const route = DEFINITION(testId);
      expect(route).toBe(`${BASE}/definitions/${encodeURIComponent(testId)}`);
    });

    it("DEFINITION_DETAILS function creates correct route with ID", () => {
      const testId = "test-definition-456";
      const route = DEFINITION_DETAILS(testId);
      expect(route).toBe(`${BASE}/definitions/${encodeURIComponent(testId)}/details`);
    });

    it("FEEDBACK function creates correct route with ID", () => {
      const testId = "feedback-789";
      const route = FEEDBACK(testId);
      expect(route).toBe(`${BASE}/feedback/${encodeURIComponent(testId)}`);
    });

    it("CHAT function creates correct route with ID", () => {
      const testId = "chat-abc";
      const route = CHAT(testId);
      expect(route).toBe(`${BASE}/chats/${encodeURIComponent(testId)}`);
    });

    it("CHAT_MESSAGES function creates correct route with ID", () => {
      const testId = "chat-def";
      const route = CHAT_MESSAGES(testId);
      expect(route).toBe(`${BASE}/chats/${encodeURIComponent(testId)}/messages`);
    });

    it("CASES_BY_ANALYSIS function creates correct route with analysis type", () => {
      const analysisType = "financial-analysis";
      const route = CASES_BY_ANALYSIS(analysisType);
      expect(route).toBe(`${BASE}/cases?analysisNameType=${analysisType}`);
    });
  });

  describe("URL encoding", () => {
    it("properly encodes special characters in IDs", () => {
      const specialId = "test with spaces & special/chars";
      const definitionRoute = DEFINITION(specialId);
      const chatRoute = CHAT(specialId);
      const feedbackRoute = FEEDBACK(specialId);

      expect(definitionRoute).toBe(`${BASE}/definitions/${encodeURIComponent(specialId)}`);
      expect(chatRoute).toBe(`${BASE}/chats/${encodeURIComponent(specialId)}`);
      expect(feedbackRoute).toBe(`${BASE}/feedback/${encodeURIComponent(specialId)}`);
    });

    it("handles empty IDs gracefully", () => {
      const emptyId = "";
      expect(() => DEFINITION(emptyId)).not.toThrow();
      expect(() => CHAT(emptyId)).not.toThrow();
      expect(() => FEEDBACK(emptyId)).not.toThrow();
      expect(() => CASES_BY_ANALYSIS(emptyId)).not.toThrow();
    });
  });

  describe("Route consistency", () => {
    it("all routes are strings", () => {
      expect(typeof BASE).toBe("string");
      expect(typeof SETTINGS).toBe("string");
      expect(typeof DEFINITIONS).toBe("string");
      expect(typeof FEEDBACKS).toBe("string");
      expect(typeof CHATS).toBe("string");
      expect(typeof CHAT_MESSAGE).toBe("string");
      expect(typeof CASES).toBe("string");
      expect(typeof CASE_ANALYSIS).toBe("string");
    });

    it("all parametric routes return strings", () => {
      expect(typeof DEFINITION("test")).toBe("string");
      expect(typeof DEFINITION_DETAILS("test")).toBe("string");
      expect(typeof FEEDBACK("test")).toBe("string");
      expect(typeof CHAT("test")).toBe("string");
      expect(typeof CHAT_MESSAGES("test")).toBe("string");
      expect(typeof CASES_BY_ANALYSIS("test")).toBe("string");
    });
  });
});
