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
  it("should export BASE URL", () => {
    expect(BASE).toBeDefined();
    expect(typeof BASE).toBe("string");
  });

  it("should have correct settings route", () => {
    expect(SETTINGS).toBe(`${BASE}/settings`);
  });

  it("should have correct definitions routes", () => {
    expect(DEFINITIONS).toBe(`${BASE}/definitions`);
    expect(DEFINITION("test-id")).toBe(`${BASE}/definitions/test-id`);
    expect(DEFINITION_DETAILS("test-id")).toBe(
      `${BASE}/definitions/test-id/details`
    );
  });

  it("should have correct feedback routes", () => {
    expect(FEEDBACKS).toBe(`${BASE}/feedback`);
    expect(FEEDBACK("test-id")).toBe(`${BASE}/feedback/test-id`);
  });

  it("should have correct chat routes", () => {
    expect(CHATS).toBe(`${BASE}/chats`);
    expect(CHAT("test-id")).toBe(`${BASE}/chats/test-id`);
    expect(CHAT_MESSAGES("test-id")).toBe(`${BASE}/chats/test-id/messages`);
    expect(CHAT_MESSAGE).toBe(`${BASE}/chat`);
  });

  it("should have correct cases routes", () => {
    expect(CASES).toBe(`${BASE}/cases`);
    expect(CASE_ANALYSIS).toBe(`${BASE}/cases/analysis`);
    expect(CASES_BY_ANALYSIS("test-type")).toBe(
      `${BASE}/cases?analysisNameType=test-type`
    );
  });

  it("should encode URI components in routes", () => {
    expect(DEFINITION("test id with spaces")).toBe(
      `${BASE}/definitions/test%20id%20with%20spaces`
    );
    expect(FEEDBACK("test/id")).toBe(`${BASE}/feedback/test%2Fid`);
  });
});
