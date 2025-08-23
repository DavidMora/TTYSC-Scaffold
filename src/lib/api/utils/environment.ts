/**
 * Environment utility functions for API routes
 */

/**
 * Determines the current environment based on NODE_ENV and BACKEND_BASE_URL
 * @returns Environment type: 'dev' | 'stg' | 'prd'
 */
export function getEnvironment(): 'dev' | 'stg' | 'prd' {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    // Check for specific environment indicators
    if (process.env.BACKEND_BASE_URL?.includes('stg')) return 'stg';
    if (process.env.BACKEND_BASE_URL?.includes('prd')) return 'prd';
    return 'prd'; // Default for production
  }
  return 'dev';
}

/**
 * Gets the current environment configuration
 */
export function getEnvironmentConfig() {
  return {
    type: getEnvironment(),
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV !== 'production',
    backendBaseUrl: process.env.BACKEND_BASE_URL || '',
    feedbackWorkflowName: process.env.FEEDBACK_WORKFLOW_NAME || 'ttysc',
  };
}
