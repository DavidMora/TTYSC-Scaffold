import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureNotAvailable } from '@/components/FeatureNotAvailable';
import '@testing-library/jest-dom';

describe('FeatureNotAvailable', () => {
  it('renders with default props', () => {
    render(<FeatureNotAvailable />);

    // Check that the FlexBox container is rendered
    const flexBox = screen.getByTestId('ui5-flexbox');
    expect(flexBox).toBeInTheDocument();
    expect(flexBox).toHaveAttribute('data-direction', 'column');

    // Check that the default title is rendered
    const title = screen.getByTestId('ui5-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Feature Not Available');

    // Check that the default message is rendered
    const message = screen.getByTestId('ui5-text');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(
      'This functionality is currently disabled.'
    );

    // Check that the icon is rendered
    const icon = screen.getByTestId('ui5-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('message-information');
  });

  it('renders with custom title and message', () => {
    const customTitle = 'Custom Feature Title';
    const customMessage = 'This is a custom message for the feature.';

    render(<FeatureNotAvailable title={customTitle} message={customMessage} />);

    // Check that the custom title is rendered
    const title = screen.getByTestId('ui5-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(customTitle);

    // Check that the custom message is rendered
    const message = screen.getByTestId('ui5-text');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(customMessage);

    // Check that the icon is still rendered
    const icon = screen.getByTestId('ui5-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('message-information');
  });

  it('renders with only custom title', () => {
    const customTitle = 'Only Title Changed';

    render(<FeatureNotAvailable title={customTitle} />);

    // Check that the custom title is rendered
    const title = screen.getByTestId('ui5-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(customTitle);

    // Check that the default message is still rendered
    const message = screen.getByTestId('ui5-text');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(
      'This functionality is currently disabled.'
    );
  });

  it('renders with only custom message', () => {
    const customMessage = 'Only message changed';

    render(<FeatureNotAvailable message={customMessage} />);

    // Check that the default title is rendered
    const title = screen.getByTestId('ui5-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Feature Not Available');

    // Check that the custom message is rendered
    const message = screen.getByTestId('ui5-text');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(customMessage);
  });

  it('renders icon with correct properties', () => {
    render(<FeatureNotAvailable />);

    const icon = screen.getByTestId('ui5-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('message-information');
  });

  it('renders title with correct level', () => {
    render(<FeatureNotAvailable />);

    const title = screen.getByTestId('ui5-title');
    expect(title).toBeInTheDocument();

    // The component uses level="H2", so it should render as an h2 element
    expect(title.tagName).toBe('H2');
  });

  it('renders text with correct styling', () => {
    render(<FeatureNotAvailable />);

    const text = screen.getByTestId('ui5-text');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent('This functionality is currently disabled.');
  });

  it('handles empty strings for title and message', () => {
    render(<FeatureNotAvailable title="" message="" />);

    // Check that empty title is rendered
    const title = screen.getByTestId('ui5-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('');

    // Check that empty message is rendered
    const message = screen.getByTestId('ui5-text');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('');
  });

  it('handles special characters in title and message', () => {
    const specialTitle = 'Feature & Special Characters: < > " \'';
    const specialMessage = 'Message with special chars: & < > " \'';

    render(
      <FeatureNotAvailable title={specialTitle} message={specialMessage} />
    );

    // Check that special characters in title are rendered correctly
    const title = screen.getByTestId('ui5-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(specialTitle);

    // Check that special characters in message are rendered correctly
    const message = screen.getByTestId('ui5-text');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(specialMessage);
  });

  it('maintains component structure with different props', () => {
    const { rerender } = render(<FeatureNotAvailable />);

    // Check initial structure
    expect(screen.getByTestId('ui5-flexbox')).toBeInTheDocument();
    expect(screen.getByTestId('ui5-icon')).toBeInTheDocument();
    expect(screen.getByTestId('ui5-title')).toBeInTheDocument();
    expect(screen.getByTestId('ui5-text')).toBeInTheDocument();

    // Rerender with different props
    rerender(<FeatureNotAvailable title="New Title" message="New Message" />);

    // Check that structure is maintained
    expect(screen.getByTestId('ui5-flexbox')).toBeInTheDocument();
    expect(screen.getByTestId('ui5-icon')).toBeInTheDocument();
    expect(screen.getByTestId('ui5-title')).toBeInTheDocument();
    expect(screen.getByTestId('ui5-text')).toBeInTheDocument();

    // Check that content has changed
    expect(screen.getByTestId('ui5-title')).toHaveTextContent('New Title');
    expect(screen.getByTestId('ui5-text')).toHaveTextContent('New Message');
  });
});
