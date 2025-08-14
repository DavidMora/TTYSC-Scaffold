import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatLayout from '@/app/(main)/[id]/layout';
import '@testing-library/jest-dom';

// Mock the AutosaveUIProvider
jest.mock('@/contexts/AutosaveUIProvider', () => ({
  AutosaveUIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="autosave-ui-provider">{children}</div>
  ),
}));

describe('ChatLayout', () => {
  it('renders children wrapped in AutosaveUIProvider', () => {
    render(
      <ChatLayout>
        <div data-testid="test-child">Test Child Content</div>
      </ChatLayout>
    );

    expect(screen.getByTestId('autosave-ui-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });
});
