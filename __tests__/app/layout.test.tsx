import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';
import '@testing-library/jest-dom';
import React from 'react';

// Mock Google Fonts
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    variable: '--font-geist-sans',
  })),
  Geist_Mono: jest.fn(() => ({
    variable: '--font-geist-mono',
  })),
}));

describe('RootLayout', () => {
  it('renders children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Child Content</div>
      </RootLayout>
    );

    // Check that the children are rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('exports correct metadata', () => {
    expect(metadata).toEqual({
      title: 'SAPUI5 Next.js App',
      description: 'A Next.js application with SAPUI5 React components',
    });
  });

  it('component structure is valid', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // Just check that the component renders without crashing
    expect(container).toBeDefined();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
