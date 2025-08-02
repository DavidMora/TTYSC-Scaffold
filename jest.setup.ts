// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
  useParams: jest.fn(),
}));

// Mock NextAuth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "1",
        name: "Test User",
        email: "test@example.com",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Ensure UI5 WebComponents React mock is used
jest.mock("@ui5/webcomponents-react");

// Mock UI5 WebComponents base
jest.mock("@ui5/webcomponents-react-base", () => ({}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for Node.js environment
global.fetch = jest.fn((url) => {
  // Mock auth config API
  if (url.toString().includes("/api/auth/config")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          authProcess: "test",
          isAuthDisabled: false,
          autoLogin: false,
        }),
    });
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as jest.Mock;

// Mock adoptedStyleSheets for UI5 WebComponents
Object.defineProperty(document, "adoptedStyleSheets", {
  value: [],
  writable: true,
});

// Mock CSSStyleSheet for UI5 WebComponents
global.CSSStyleSheet = class {
  cssRules: string[] = [];
  rules: string[] = [];

  insertRule(rule: string, index?: number) {
    this.cssRules.splice(index ?? 0, 0, rule);
    this.rules = this.cssRules;
    return index ?? 0;
  }

  deleteRule(index: number) {
    this.cssRules.splice(index, 1);
    this.rules = this.cssRules;
  }

  replaceSync(text: string) {
    this.cssRules = text.split("\n").filter(Boolean);
    this.rules = this.cssRules;
  }

  get cssText() {
    return this.cssRules.join("\n");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
