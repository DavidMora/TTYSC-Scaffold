import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RawDataModalProvider } from '@/contexts/RawDataModalContext';
import RawDataNavigationItem from '@/components/AppLayout/SidebarItems/RawDataNavigationItem';

// Mock the useFeatureFlag hook
jest.mock('@/hooks/useFeatureFlags', () => ({
  useFeatureFlag: (flag: string) => ({
    flag: true,
    loading: false,
    error: null,
  }),
}));

// Mock UI5 components with simple implementations
jest.mock('@ui5/webcomponents-react', () => ({
  SideNavigationItem: ({ children, text, icon, unselectable }: any) => (
    <div
      data-testid="side-navigation-item"
      data-text={text}
      data-icon={icon}
      data-unselectable={unselectable}
    >
      {children}
    </div>
  ),
  FlexBox: ({ children, direction, className }: any) => (
    <div data-testid="flex-box" className={className}>
      {children}
    </div>
  ),
  FlexBoxDirection: {
    Column: 'Column',
  },
  Text: ({ children }: any) => <span data-testid="text">{children}</span>,
  Select: ({ children, className, value, onChange }: any) => (
    <select
      data-testid="select"
      className={className}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  ),
  Option: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  Label: ({ children }: any) => <label data-testid="label">{children}</label>,
  Icon: ({ name, className, onClick }: any) => {
    if (onClick) {
      return (
        <button
          data-testid="icon"
          data-name={name}
          className={className}
          onClick={onClick}
        />
      );
    }
    return <span data-testid="icon" data-name={name} className={className} />;
  },
  Card: ({ children, header, ...props }: any) => (
    <div data-testid="card" {...props}>
      {header}
      {children}
    </div>
  ),
  CardHeader: ({
    titleText,
    subtitleText,
    additionalText,
    action,
    ...props
  }: any) => (
    <div data-testid="card-header" {...props}>
      <span data-testid="card-header-title">{titleText}</span>
      <span data-testid="card-header-subtitle">{subtitleText}</span>
      <span data-testid="card-header-additional">{additionalText}</span>
      {action && <div data-testid="card-header-action">{action}</div>}
    </div>
  ),
  Button: ({ children, className, onClick, 'aria-label': ariaLabel }: any) => (
    <button
      data-testid="button"
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  ),
}));

describe('RawDataNavigationItem', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<RawDataModalProvider>{component}</RawDataModalProvider>);
  };

  it('renders with default props', () => {
    const { container } = renderWithProvider(<RawDataNavigationItem />);
    expect(container).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProvider(<RawDataNavigationItem />);
    expect(container).toBeInTheDocument();
  });

  it('handles empty rawDataItems', () => {
    const { container } = renderWithProvider(
      <RawDataNavigationItem rawDataItems={[]} />
    );
    expect(container).toBeInTheDocument();
  });
});
