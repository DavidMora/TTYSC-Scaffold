// Mock for SWR module
const defaultSWRResponse = {
  data: { test: 'data' },
  error: undefined,
  isLoading: false,
  isValidating: false,
  mutate: jest.fn(),
};

const mockUseSWR = jest.fn().mockReturnValue(defaultSWRResponse);

// Function to control mock behavior for tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const __setMockSWRAvailable = (_available: boolean) => {
  // This is kept for backward compatibility but no longer needed
  // since SWR is actually installed
};

// Helper function to configure the mock response
export const __setMockSWRResponse = (response: unknown) => {
  mockUseSWR.mockReturnValue(response);
};

// Helper function to reset to default response
export const __resetMockSWRResponse = () => {
  mockUseSWR.mockReturnValue(defaultSWRResponse);
};

export default mockUseSWR;
