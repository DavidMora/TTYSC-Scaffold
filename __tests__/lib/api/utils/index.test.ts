/**
 * Tests for index.ts re-exports
 */
import * as apiUtils from '@/lib/api/utils/index';

describe('API Utils Index', () => {
  it('should re-export all environment utilities', () => {
    expect(typeof apiUtils.getEnvironment).toBe('function');
    expect(typeof apiUtils.getEnvironmentConfig).toBe('function');
  });

  it('should re-export all response utilities', () => {
    expect(typeof apiUtils.createErrorResponse).toBe('function');
    expect(typeof apiUtils.createJsonResponse).toBe('function');
    expect(typeof apiUtils.createUpstreamResponse).toBe('function');
    expect(typeof apiUtils.apiResponse).toBe('object');
  });

  it('should re-export all auth utilities', () => {
    expect(typeof apiUtils.validateSession).toBe('function');
    expect(typeof apiUtils.getAuthenticatedUserEmail).toBe('function');
    expect(typeof apiUtils.createAuthErrorResponse).toBe('function');
    expect(typeof apiUtils.requireAuthentication).toBe('function');
  });

  it('should have all expected exports', () => {
    const expectedExports = [
      'getEnvironment',
      'getEnvironmentConfig',
      'createErrorResponse',
      'createJsonResponse',
      'createUpstreamResponse',
      'apiResponse',
      'validateSession',
      'getAuthenticatedUserEmail',
      'createAuthErrorResponse',
      'requireAuthentication',
    ];

    expectedExports.forEach((exportName) => {
      expect(apiUtils).toHaveProperty(exportName);
    });
  });
});
