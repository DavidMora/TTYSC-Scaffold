import React from 'react';
import { render } from '@testing-library/react';
import { SuspenseAuthProvider } from '../../src/hooks/useAuth';

// Custom render function that includes auth provider
export function renderWithAuth(ui: React.ReactElement, options = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SuspenseAuthProvider>{children}</SuspenseAuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithAuth as render };
