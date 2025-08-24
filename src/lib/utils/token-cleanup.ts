/**
 * Comprehensive token and session cleanup utilities
 * Ensures all NextAuth tokens, cookies, and session data are completely removed
 */

// Interface for dependency injection
interface TokenCleanupOptions {
  window?: Window;
  document?: Document;
  localStorage?: Storage;
  sessionStorage?: Storage;
  console?: Console;
  location?: Location;
}

/**
 * Get all possible NextAuth cookie names based on environment and configuration
 */
function getNextAuthCookieNames(): string[] {
  const cookiePrefix = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Secure-'
    : '';
  const hostPrefix = process.env.NEXTAUTH_URL?.startsWith('https://')
    ? '__Host-'
    : '';

  return [
    // Standard NextAuth cookies
    'next-auth.session-token',
    'next-auth.csrf-token',
    'next-auth.callback-url',
    'next-auth.pkce.code_verifier',
    'next-auth.state',

    // Secure cookies (HTTPS)
    `${cookiePrefix}next-auth.session-token`,
    `${cookiePrefix}next-auth.csrf-token`,
    `${hostPrefix}next-auth.csrf-token`,

    // Legacy and alternative formats
    'nextauth.session-token',
    'nextauth.csrf-token',
    'authjs.session-token',
    'authjs.csrf-token',

    // Custom session cookies that might exist
    'session',
    'token',
    'auth-token',
    'authentication',
  ];
}

/**
 * Generate all possible domain variations for cookie clearing
 */
function getDomainVariations(hostname: string): string[] {
  const domainParts = hostname.split('.');
  const domains = [
    hostname, // exact domain
    `.${hostname}`, // with leading dot
  ];

  // Add parent domains for subdomains
  if (domainParts.length > 2) {
    const parentDomain = domainParts.slice(-2).join('.');
    domains.push(parentDomain, `.${parentDomain}`);
  }

  return domains;
}

/**
 * Check if a cookie name is auth-related
 */
function isAuthRelatedCookie(name: string): boolean {
  return (
    name.includes('auth') ||
    name.includes('session') ||
    name.includes('token') ||
    name.includes('next-auth') ||
    name.includes('jwt')
  );
}

/**
 * Clear standard auth cookies with all variations
 */
function clearStandardAuthCookies(
  cookieNames: string[],
  domains: string[],
  paths: string[],
  clearCookie: (
    name: string,
    path?: string,
    domain?: string,
    sameSite?: string,
    secure?: boolean
  ) => void
): void {
  for (const cookieName of cookieNames) {
    // Clear with all domain/path combinations
    for (const domain of domains) {
      for (const path of paths) {
        // Clear with different SameSite and Secure combinations
        clearCookie(cookieName, path, domain, 'Lax');
        clearCookie(cookieName, path, domain, 'Strict');
        clearCookie(cookieName, path, domain, undefined, true);
        clearCookie(cookieName, path, domain, 'None', true);
      }
      // Clear without path
      clearCookie(cookieName, undefined, domain);
    }

    // Clear without domain
    for (const path of paths) {
      clearCookie(cookieName, path);
    }

    // Clear with minimal attributes
    clearCookie(cookieName);
  }
}

/**
 * Clear any remaining auth-related cookies found in document.cookie
 */
function clearRemainingAuthCookies(
  cookieString: string,
  domains: string[],
  paths: string[],
  clearCookie: (
    name: string,
    path?: string,
    domain?: string,
    sameSite?: string,
    secure?: boolean
  ) => void
): void {
  const existingCookies = cookieString.split(';');

  for (const cookie of existingCookies) {
    const [name] = cookie.split('=');
    const trimmedName = name?.trim();

    if (!trimmedName || !isAuthRelatedCookie(trimmedName)) {
      continue;
    }

    // Clear the auth-related cookie with all domain/path combinations
    for (const domain of domains) {
      for (const path of paths) {
        clearCookie(trimmedName, path, domain);
      }
    }
    clearCookie(trimmedName);
  }
}

/**
 * Create token cleanup utilities with dependency injection
 */
export function createTokenCleanup(options: TokenCleanupOptions = {}) {
  const {
    window: windowObj = typeof window !== 'undefined' ? window : null,
    document: doc = typeof document !== 'undefined' ? document : null,
    localStorage: storage = typeof window !== 'undefined'
      ? window.localStorage
      : null,
    sessionStorage: sessionStore = typeof window !== 'undefined'
      ? window.sessionStorage
      : null,
    console: logger = console,
    location = typeof window !== 'undefined' ? window.location : null,
  } = options;

  // Local, closure-bound implementations (no reliance on `this`)
  const clearAllAuthCookies = (): void => {
    if (!windowObj || !doc || !location) return;

    const cookieNames = getNextAuthCookieNames();
    const domains = getDomainVariations(location.hostname);
    const paths = ['/', '/api', '/auth'];

    logger.log('[Token Cleanup] Clearing cookies:', {
      cookieNames,
      domains,
      paths,
    });

    // Helper function to clear a single cookie
    const clearCookie = (
      name: string,
      path?: string,
      domain?: string,
      sameSite?: string,
      secure?: boolean
    ) => {
      let cookieStr = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      if (path) cookieStr += `; path=${path}`;
      if (domain) cookieStr += `; domain=${domain}`;
      if (sameSite) cookieStr += `; SameSite=${sameSite}`;
      if (secure) cookieStr += `; Secure`;
      doc.cookie = cookieStr;
    };

    // Clear standard auth cookies
    clearStandardAuthCookies(cookieNames, domains, paths, clearCookie);

    // Clear any remaining auth-related cookies
    clearRemainingAuthCookies(doc.cookie, domains, paths, clearCookie);
  };

  const clearAllAuthStorage = (): void => {
    if (!windowObj || !storage || !sessionStore) return;

    logger.log(
      '[Token Cleanup] Clearing browser storage (preserving logout state)'
    );

    // CRITICAL: Preserve logout state flags during cleanup
    const logoutFlag = storage.getItem('user_manually_logged_out');
    const logoutTimestamp = storage.getItem('logout_timestamp');

    // Clear localStorage (but preserve logout state)
    const keysToPreserve = ['user_manually_logged_out', 'logout_timestamp'];
    const localStorageKeys = Object.keys(storage);

    localStorageKeys.forEach((key) => {
      if (!keysToPreserve.includes(key)) {
        storage.removeItem(key);
      }
    });

    // Restore logout state if it was cleared accidentally
    if (logoutFlag === 'true') {
      storage.setItem('user_manually_logged_out', 'true');
    }
    if (logoutTimestamp) {
      storage.setItem('logout_timestamp', logoutTimestamp);
    }

    logger.log('[Token Cleanup] Logout state preserved:', {
      logoutFlag: storage.getItem('user_manually_logged_out'),
      timestamp: storage.getItem('logout_timestamp'),
    });

    // Clear sessionStorage completely
    sessionStore.clear();

    // Clear any IndexedDB databases (if they exist)
    try {
      if (windowObj && 'indexedDB' in windowObj) {
        // Common database names that might contain auth data
        const dbNames = ['next-auth', 'auth', 'session', 'tokens'];
        dbNames.forEach((dbName) => {
          windowObj.indexedDB.deleteDatabase(dbName);
        });
      }
    } catch (error) {
      logger.warn('[Token Cleanup] Failed to clear IndexedDB:', error);
    }
  };

  const invalidateServerSession = async (): Promise<void> => {
    try {
      logger.log('[Token Cleanup] Invalidating server session');

      // Call our force logout endpoint for comprehensive server-side clearing
      const forceLogoutResponse = await fetch('/api/auth/force-logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (forceLogoutResponse.ok) {
        const result = await forceLogoutResponse.json();
        logger.log('[Token Cleanup] Force logout result:', result);
      }

      // Avoid duplicate signout/restart calls here; the caller coordinates redirects/cleanup
    } catch (error) {
      logger.warn('[Token Cleanup] Server session invalidation failed:', error);
    }
  };

  const performCompleteLogoutCleanup = async (): Promise<void> => {
    logger.log('[Token Cleanup] Starting comprehensive logout cleanup');

    // Clear all cookies
    clearAllAuthCookies();

    // Clear all storage
    clearAllAuthStorage();

    // Invalidate server session
    await invalidateServerSession();

    // Wait a moment for cleanup to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify cleanup by checking remaining cookies
    const remainingCookies = doc?.cookie || '';
    logger.log(
      '[Token Cleanup] Remaining cookies after cleanup:',
      remainingCookies
    );

    logger.log('[Token Cleanup] Comprehensive cleanup completed');
  };

  return {
    clearAllAuthCookies,
    clearAllAuthStorage,
    invalidateServerSession,
    performCompleteLogoutCleanup,
  };
}

// Create default instance for backward compatibility
const tokenCleanup = createTokenCleanup();

// Export individual functions for backward compatibility
export const clearAllAuthCookies = tokenCleanup.clearAllAuthCookies;
export const clearAllAuthStorage = tokenCleanup.clearAllAuthStorage;
export const invalidateServerSession = tokenCleanup.invalidateServerSession;
export const performCompleteLogoutCleanup =
  tokenCleanup.performCompleteLogoutCleanup;
