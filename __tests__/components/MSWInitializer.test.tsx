import React from 'react';
import { render } from '@testing-library/react';
import MSWInitializer from '@/components/MSWInitializer';

// Mock the browser worker
const mockStart = jest.fn();
const mockWorker = { start: mockStart };

jest.mock('@/mocks/browser', () => ({
  worker: mockWorker,
}));

describe('MSWInitializer', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).__MSW_STARTED__;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('renders null without errors', () => {
    process.env.NODE_ENV = 'development';

    const { container } = render(<MSWInitializer />);

    expect(container.firstChild).toBeNull();
  });

  it('starts MSW worker in development environment', async () => {
    process.env.NODE_ENV = 'development';

    render(<MSWInitializer />);

    // Wait for the dynamic import to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStart).toHaveBeenCalledWith(
      expect.objectContaining({ onUnhandledRequest: 'bypass' })
    );
  });

  it('still starts MSW worker in test environment (current behavior)', async () => {
    process.env.NODE_ENV = 'test';

    render(<MSWInitializer />);

    // Wait for the dynamic import to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockStart).toHaveBeenCalledWith(
      expect.objectContaining({ onUnhandledRequest: 'bypass' })
    );
  });

  it('handles dynamic import gracefully', async () => {
    process.env.NODE_ENV = 'development';

    // Mock console to check for errors
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<MSWInitializer />);

    // Wait for any async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Should not log any errors
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
