/**
 * Tests for environment utilities
 */

import {
  getEnvironment,
  getEnvironmentConfig,
} from '@/lib/api/utils/environment';

describe('Environment Utilities', () => {
  describe('getEnvironment', () => {
    it('should return "dev" for non-production NODE_ENV', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'development',
      });

      const result = getEnvironment();
      expect(result).toBe('dev');
    });

    it('should return "stg" for production with staging backend URL', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'production',
        BACKEND_BASE_URL: 'https://api-stg.example.com',
      });

      const result = getEnvironment();
      expect(result).toBe('stg');
    });

    it('should return "prd" for production with production backend URL', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'production',
        BACKEND_BASE_URL: 'https://api-prd.example.com',
      });

      const result = getEnvironment();
      expect(result).toBe('prd');
    });

    it('should return "prd" for production without BACKEND_BASE_URL', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'production',
      });

      const result = getEnvironment();
      expect(result).toBe('prd');
    });

    it('should return "prd" for production with non-staging/prd backend URL', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'production',
        BACKEND_BASE_URL: 'https://api.example.com',
      });

      const result = getEnvironment();
      expect(result).toBe('prd');
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return complete environment config for development', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'development',
        BACKEND_BASE_URL: 'http://localhost:3001',
        FEEDBACK_WORKFLOW_NAME: 'test-workflow',
      });

      const result = getEnvironmentConfig();
      expect(result).toEqual({
        type: 'dev',
        isProduction: false,
        isDevelopment: true,
        backendBaseUrl: 'http://localhost:3001',
        feedbackWorkflowName: 'test-workflow',
      });
    });

    it('should return complete environment config for staging', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'production',
        BACKEND_BASE_URL: 'https://api-stg.example.com',
        FEEDBACK_WORKFLOW_NAME: 'staging-workflow',
      });

      const result = getEnvironmentConfig();
      expect(result).toEqual({
        type: 'stg',
        isProduction: true,
        isDevelopment: false,
        backendBaseUrl: 'https://api-stg.example.com',
        feedbackWorkflowName: 'staging-workflow',
      });
    });

    it('should return default values when environment variables are missing', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'test',
      });

      const result = getEnvironmentConfig();
      expect(result).toEqual({
        type: 'dev',
        isProduction: false,
        isDevelopment: true,
        backendBaseUrl: '',
        feedbackWorkflowName: 'ttysc',
      });
    });

    it('should return production config for production NODE_ENV', () => {
      jest.replaceProperty(process, 'env', {
        NODE_ENV: 'production',
        BACKEND_BASE_URL: 'https://api.example.com',
        FEEDBACK_WORKFLOW_NAME: 'prod-workflow',
      });

      const result = getEnvironmentConfig();
      expect(result).toEqual({
        type: 'prd',
        isProduction: true,
        isDevelopment: false,
        backendBaseUrl: 'https://api.example.com',
        feedbackWorkflowName: 'prod-workflow',
      });
    });
  });
});
