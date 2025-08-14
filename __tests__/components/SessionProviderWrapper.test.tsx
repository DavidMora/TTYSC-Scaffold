import React from 'react';
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import '@testing-library/jest-dom';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: jest.fn(({ children }) => (
    <div data-testid="session-provider">{children}</div>
  )),
}));

const mockSessionProvider = SessionProvider as jest.MockedFunction<
  typeof SessionProvider
>;

describe('SessionProviderWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children within SessionProvider', () => {
    render(
      <SessionProviderWrapper>
        <div>Test Content</div>
      </SessionProviderWrapper>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('passes correct props to SessionProvider', () => {
    render(
      <SessionProviderWrapper>
        <div>Test Content</div>
      </SessionProviderWrapper>
    );

    // Verificar que el componente fue llamado al menos una vez
    expect(mockSessionProvider).toHaveBeenCalled();

    // Obtener la primera llamada
    const firstCall = mockSessionProvider.mock.calls[0];
    const props = firstCall[0];

    // Verificar las propiedades específicas
    expect(props.refetchInterval).toBe(60);
    expect(props.refetchOnWindowFocus).toBe(true);
    expect(props.refetchWhenOffline).toBe(false);
    expect(props.children).toBeDefined();
  });

  it('renders with multiple children', () => {
    render(
      <SessionProviderWrapper>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </SessionProviderWrapper>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    const { container } = render(
      <SessionProviderWrapper>{null}</SessionProviderWrapper>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="session-provider"]')
    ).toBeInTheDocument();
  });

  it('renders with complex nested children', () => {
    render(
      <SessionProviderWrapper>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </SessionProviderWrapper>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
