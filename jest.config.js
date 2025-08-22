import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/mocks/',
    '<rootDir>/public/mockServiceWorker.js',
  ],
  moduleNameMapper: {
    '^@ui5/webcomponents-react$':
      '<rootDir>/__mocks__/@ui5/webcomponents-react.js',
    '^@ui5/webcomponents-react-base':
      '<rootDir>/__mocks__/@ui5/webcomponents-react-base.js',
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/app/api/auth/\\[...nextauth\\]/route.ts',
    '!src/lib/constants/**',
    '!src/mocks/**',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async

const jestConfig = async () => {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = [
    'node_modules/(?!(@ui5|lit|lit-html|@zxing/library|marked|dompurify|jose|openid-client|@panva/hkdf|preact-render-to-string|preact)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ];
  return config;
};

export default jestConfig;
