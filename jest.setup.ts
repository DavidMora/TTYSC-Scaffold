import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
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
    return '/';
  },
  useParams: jest.fn(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Ensure UI5 WebComponents React mock is used
jest.mock('@ui5/webcomponents-react');

// Mock UI5 WebComponents base
jest.mock('@ui5/webcomponents-react-base', () => ({}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for Node.js environment
global.fetch = jest.fn((url, init?: RequestInit) => {
  // Mock auth config API
  if (url.toString().includes('/api/auth/config')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          authProcess: 'test',
          isAuthDisabled: false,
          autoLogin: false,
        }),
    });
  }

  // Mock feature flags API with defaults used in tests
  if (url.toString().includes('/api/feature-flags')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          enableAuthentication: true,
          FF_Chat_Analysis_Screen: true,
          FF_Full_Page_Navigation: true,
          FF_Modals: true,
        }),
    });
  }

  // Mock markdown rendering API to echo back provided markdown as HTML
  if (url.toString().includes('/api/renderMarkdown')) {
    let html = '';
    try {
      const body = init?.body;
      if (typeof body === 'string') {
        const parsed = JSON.parse(body);
        html = parsed?.markdown ?? '';
      } else if (body instanceof URLSearchParams || body instanceof FormData) {
        const entries = Object.fromEntries(body.entries());
        html = (entries.markdown as string) ?? '';
      } else if (body && typeof body === 'object') {
        // e.g., tests passing a plain object
        // @ts-expect-error body may not be typed as object
        html = body.markdown ?? '';
      }
    } catch {
      html = '';
    }
    return Promise.resolve({
      ok: true,
      headers: { 'content-type': 'application/json' } as unknown as Headers,
      json: () => Promise.resolve({ html }),
    });
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as jest.Mock;

// Mock adoptedStyleSheets for UI5 WebComponents (only in jsdom environment)
if (typeof document !== 'undefined') {
  Object.defineProperty(document, 'adoptedStyleSheets', {
    value: [],
    writable: true,
  });
}

// Mock CSSStyleSheet for UI5 WebComponents
global.CSSStyleSheet = class {
  cssRules: string[] = [];
  rules: string[] = [];

  insertRule(rule: string, index?: number) {
    const insertIndex = index ?? this.cssRules.length;
    const safeIndex = Math.max(0, Math.min(insertIndex, this.cssRules.length));
    this.cssRules.splice(safeIndex, 0, rule);
    this.rules = this.cssRules;
    return safeIndex;
  }

  deleteRule(index: number) {
    this.cssRules.splice(index, 1);
    this.rules = this.cssRules;
  }

  replaceSync(text: string) {
    this.cssRules = text.split('\n').filter(Boolean);
    this.rules = this.cssRules;
  }

  get cssText() {
    return this.cssRules.join('\n');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock 'marked' ESM module (avoid transforming node_modules ESM in Jest)
jest.mock('marked', () => ({
  marked: {
    parse: (content: string) => content, // return raw content (sufficient for tests)
  },
}));
