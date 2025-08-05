import { render, screen } from '@testing-library/react';
import LoggedOutLayout from '@/app/auth/logged-out/layout';

// Mock the LogoutPageWrapper component
jest.mock('@/components/auth/LogoutPageWrapper', () => {
  return {
    LogoutPageWrapper: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="logout-page-wrapper">{children}</div>
    ),
  };
});

describe('LoggedOutLayout', () => {
  it('should render children within LogoutPageWrapper', () => {
    const testContent = 'Test content for logged out layout';
    
    render(
      <LoggedOutLayout>
        <div data-testid="test-child">{testContent}</div>
      </LoggedOutLayout>
    );

    expect(screen.getByTestId('logout-page-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should render multiple children correctly', () => {
    render(
      <LoggedOutLayout>
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </LoggedOutLayout>
    );

    expect(screen.getByTestId('logout-page-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
  });

  it('should render empty children without errors', () => {
    render(<LoggedOutLayout>{null}</LoggedOutLayout>);

    expect(screen.getByTestId('logout-page-wrapper')).toBeInTheDocument();
  });

  it('should handle text content as children', () => {
    const textContent = 'Just some text content';
    
    render(<LoggedOutLayout>{textContent}</LoggedOutLayout>);

    expect(screen.getByTestId('logout-page-wrapper')).toBeInTheDocument();
    expect(screen.getByText(textContent)).toBeInTheDocument();
  });

  it('should render complex nested children structure', () => {
    render(
      <LoggedOutLayout>
        <main data-testid="main-content">
          <header data-testid="header">Header Content</header>
          <section data-testid="section">
            <p>Section paragraph</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </section>
        </main>
      </LoggedOutLayout>
    );

    expect(screen.getByTestId('logout-page-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('section')).toBeInTheDocument();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Section paragraph')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('List item 2')).toBeInTheDocument();
  });
});