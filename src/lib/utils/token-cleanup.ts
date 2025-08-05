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
  const cookiePrefix = process.env.NEXTAUTH_URL?.startsWith('https://') ? '__Secure-' : '';
  const hostPrefix = process.env.NEXTAUTH_URL?.startsWith('https://') ? '__Host-' : '';
  
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
 * Create token cleanup utilities with dependency injection
 */
export function createTokenCleanup(options: TokenCleanupOptions = {}) {
  const {
    window: windowObj = typeof window !== 'undefined' ? window : null,
    document: doc = typeof document !== 'undefined' ? document : null,
    localStorage: storage = typeof window !== 'undefined' ? window.localStorage : null,
    sessionStorage: sessionStore = typeof window !== 'undefined' ? window.sessionStorage : null,
    console: logger = console,
    location = typeof window !== 'undefined' ? window.location : null
  } = options;

  return {
    /**
     * Clear all NextAuth cookies from all possible domains and paths
     */
    clearAllAuthCookies(): void {
      if (!windowObj || !doc || !location) return;
      
      const cookieNames = getNextAuthCookieNames();
      const hostname = location.hostname;
      const domainParts = hostname.split('.');
      
      // Generate all possible domain variations
      const domains = [
        hostname, // exact domain
        `.${hostname}`, // with leading dot
      ];
      
      // Add parent domains for subdomains
      if (domainParts.length > 2) {
        const parentDomain = domainParts.slice(-2).join('.');
        domains.push(parentDomain, `.${parentDomain}`);
      }
      
      // Common paths where cookies might be set
      const paths = ['/', '/api', '/auth'];
      
      logger.log('[Token Cleanup] Clearing cookies:', { cookieNames, domains, paths });
      
      // Clear cookies for each combination of name, domain, and path
      cookieNames.forEach(cookieName => {
        domains.forEach(domain => {
          paths.forEach(path => {
            // Clear with domain and path
            doc.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=Lax`;
            doc.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=Strict`;
            doc.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; Secure`;
            doc.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; Secure; SameSite=None`;
          });
          
          // Clear without path
          doc.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`;
        });
        
        // Clear without domain
        paths.forEach(path => {
          doc.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        });
        
        // Clear with minimal attributes
        doc.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
      
      // Additional cleanup: iterate through actual cookies and clear anything suspicious
      doc.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        const trimmedName = name?.trim();
        if (trimmedName && (
          trimmedName.includes('auth') ||
          trimmedName.includes('session') ||
          trimmedName.includes('token') ||
          trimmedName.includes('next-auth') ||
          trimmedName.includes('jwt')
        )) {
          domains.forEach(domain => {
            paths.forEach(path => {
              doc.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
            });
          });
          doc.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      });
    },

    /**
     * Clear all browser storage that might contain auth data
     */
    clearAllAuthStorage(): void {
      if (!windowObj || !storage || !sessionStore) return;
      
      logger.log('[Token Cleanup] Clearing browser storage (preserving logout state)');
      
      // CRITICAL: Preserve logout state flags during cleanup
      const logoutFlag = storage.getItem('user_manually_logged_out');
      const logoutTimestamp = storage.getItem('logout_timestamp');
      
      // Clear localStorage (but preserve logout state)
      const keysToPreserve = ['user_manually_logged_out', 'logout_timestamp'];
      const localStorageKeys = Object.keys(storage);
      
      localStorageKeys.forEach(key => {
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
        timestamp: storage.getItem('logout_timestamp')
      });
      
      // Clear sessionStorage completely
      sessionStore.clear();
      
      // Clear any IndexedDB databases (if they exist)
      try {
        if (windowObj && 'indexedDB' in windowObj) {
          // Common database names that might contain auth data
          const dbNames = ['next-auth', 'auth', 'session', 'tokens'];
          dbNames.forEach(dbName => {
            windowObj.indexedDB.deleteDatabase(dbName);
          });
        }
      } catch (error) {
        logger.warn('[Token Cleanup] Failed to clear IndexedDB:', error);
      }
    },

    /**
     * Force a server-side session invalidation
     */
    async invalidateServerSession(): Promise<void> {
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
        
        // Also call NextAuth's built-in signout
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ callbackUrl: '/auth/logged-out' }),
        });
        
        // Call restart session endpoint as backup
        await fetch('/api/auth/restart-session', {
          method: 'POST',
          credentials: 'same-origin',
        });
        
      } catch (error) {
        logger.warn('[Token Cleanup] Server session invalidation failed:', error);
      }
    },

    /**
     * Comprehensive cleanup of all authentication data
     */
    async performCompleteLogoutCleanup(): Promise<void> {
      logger.log('[Token Cleanup] Starting comprehensive logout cleanup');
      
      // Clear all cookies
      this.clearAllAuthCookies();
      
      // Clear all storage
      this.clearAllAuthStorage();
      
      // Invalidate server session
      await this.invalidateServerSession();
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify cleanup by checking remaining cookies
      const remainingCookies = doc?.cookie || '';
      logger.log('[Token Cleanup] Remaining cookies after cleanup:', remainingCookies);
      
      logger.log('[Token Cleanup] Comprehensive cleanup completed');
    }
  };
}

// Create default instance for backward compatibility
const tokenCleanup = createTokenCleanup();

// Export individual functions for backward compatibility
export const clearAllAuthCookies = tokenCleanup.clearAllAuthCookies;
export const clearAllAuthStorage = tokenCleanup.clearAllAuthStorage;
export const invalidateServerSession = tokenCleanup.invalidateServerSession;
export const performCompleteLogoutCleanup = tokenCleanup.performCompleteLogoutCleanup;