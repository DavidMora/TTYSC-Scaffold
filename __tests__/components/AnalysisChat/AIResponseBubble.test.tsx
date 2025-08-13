import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIResponseBubble } from '@/components/AnalysisChat/AIResponseBubble';
import { ChatMessage } from '@/lib/types/chats';
import { AutosaveUIProvider } from '@/contexts/AutosaveUIProvider';

// Mock the hooks
jest.mock('@/hooks/chats', () => ({
  useUpdateMessageFeedback: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    data: undefined,
    error: null,
    reset: jest.fn(),
  })),
}));

// Mock date formatting
jest.mock('@/lib/utils/dateUtils', () => ({
  parseDate: (iso: string) => `Formatted(${iso})`,
}));

const baseMessage: ChatMessage = {
  id: '1',
  role: 'assistant',
  content: 'This is an AI response message.',
  created: '2025-07-23T10:00:00.000Z',
  title: 'Assistant Title',
};

// Wrapper component to provide context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AutosaveUIProvider>{children}</AutosaveUIProvider>
);

describe('AIResponseBubble', () => {
  it('renders AI response with title and timestamp', () => {
    render(
      <TestWrapper>
        <AIResponseBubble message={baseMessage} />
      </TestWrapper>
    );

    expect(screen.getByText('Assistant Title')).toBeInTheDocument();
    expect(
      screen.getByText('Formatted(2025-07-23T10:00:00.000Z)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is an AI response message.')
    ).toBeInTheDocument();
  });

  it('renders feedback vote component', () => {
    render(
      <TestWrapper>
        <AIResponseBubble message={baseMessage} />
      </TestWrapper>
    );

    expect(screen.getByTestId('feedback-vote')).toBeInTheDocument();
  });

  it('renders data table when [SHOW_TABLE] is in message content', () => {
    const messageWithTable = {
      ...baseMessage,
      content: 'This is a message with a table.\n[SHOW_TABLE]',
    };
    render(
      <TestWrapper>
        <AIResponseBubble message={messageWithTable} />
      </TestWrapper>
    );
    expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
  });

  it('does not render data table when [SHOW_TABLE] is not in message content', () => {
    const messageWithoutTable = {
      ...baseMessage,
      content: 'This is a message without a table.',
    };
    render(
      <TestWrapper>
        <AIResponseBubble message={messageWithoutTable} />
      </TestWrapper>
    );
    expect(screen.queryByTestId('base-data-table')).not.toBeInTheDocument();
  });

  it('applies correct styling for AI response', () => {
    render(
      <TestWrapper>
        <AIResponseBubble message={baseMessage} />
      </TestWrapper>
    );

    // Find the outer container div that has the styling
    const bubble = screen
      .getByText('This is an AI response message.')
      .closest('div')?.parentElement;
    expect(bubble).toHaveStyle({
      backgroundColor: 'rgb(234, 245, 207)',
      borderRadius: '16px',
      border: '1px solid rgb(213, 215, 218)',
    });
  });

  it('show default title when title is not provided', () => {
    render(
      <TestWrapper>
        <AIResponseBubble message={{ ...baseMessage, title: undefined }} />
      </TestWrapper>
    );
    expect(screen.getByText('AI Response')).toBeInTheDocument();
  });
});
