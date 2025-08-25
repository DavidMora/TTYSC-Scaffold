/**
 * Internal function to detect browser from navigator object
 */
function detectBrowserFromNavigator(navigator: {
  userAgent?: string;
  platform?: string;
}): string {
  const userAgent = navigator.userAgent || '';

  // Get platform information - navigator.platform is deprecated
  // but we need it for backward compatibility in tests
  // In a real browser environment, we could use navigator.userAgentData.platform
  // but for testing and broader compatibility, we'll suppress the deprecation warning
  const platform = navigator.platform || 'undefined';

  let browser = 'Unknown';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
    browser = 'Opera';
  }

  return `${browser} on ${platform}`;
}

/**
 * Get navigator object from various sources (testable version)
 */
function getNavigatorObject(): {
  userAgent?: string;
  platform?: string;
} | null {
  // Check global first (for test environments and Node.js environments)
  if (typeof global !== 'undefined') {
    const globalNav = (
      global as { navigator?: { userAgent?: string; platform?: string } }
    ).navigator;
    if (globalNav?.userAgent !== undefined) {
      return globalNav;
    }
  }

  // Check browser environment
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator;
  }

  return null;
}

/**
 * Utility to detect user browser information
 */
export function getUserBrowser(): string {
  const navigator = getNavigatorObject();

  if (navigator) {
    return detectBrowserFromNavigator(navigator);
  }

  // Default for server-side or when navigator is not available
  return 'Unknown on undefined';
}

/**
 * Get environment from process.env
 */
export function getEnvironment(): 'dev' | 'stg' | 'prd' {
  // Prioritize USER_METRICS_ENVIRONMENT if it's explicitly set
  if (process.env.USER_METRICS_ENVIRONMENT) {
    const explicitEnv = process.env.USER_METRICS_ENVIRONMENT;
    if (
      explicitEnv === 'stg' ||
      explicitEnv === 'prd' ||
      explicitEnv === 'dev'
    ) {
      return explicitEnv;
    }
  }

  const env = process.env.NODE_ENV;

  if (env === 'production') {
    // Check for specific environment indicators
    if (process.env.BACKEND_BASE_URL?.includes('stg')) return 'stg';
    if (process.env.BACKEND_BASE_URL?.includes('prd')) return 'prd';
    return 'prd'; // Default for production
  }

  return 'dev';
}
