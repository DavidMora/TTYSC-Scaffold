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

// Mock AIResponseRenderer to avoid async markdown fetch and heavy children
jest.mock("@/components/AnalysisChat/AIResponseRenderer", () => ({
  __esModule: true,
  AIResponseRenderer: ({ content }: { content: string }) => (
    <div style={{ width: "100%" }}>
      <div className="markdown">{content}</div>
      {/\[show_table\]/i.test(content) ? (
        <div data-testid="base-data-table" />
      ) : null}
    </div>
  ),
}));

// Mock MarkdownRenderer to render raw markdown text synchronously
jest.mock("@/components/Markdown/MarkdownRenderer", () => {
  const MockMarkdownRenderer = ({
    markdown,
    className,
  }: {
    markdown: string;
    className?: string;
  }) => (
    <div
      className={className}
      data-testid="ui5-text"
      style={{ whiteSpace: "pre-wrap" }}
    >
      {markdown}
    </div>
  );
  MockMarkdownRenderer.displayName = "MockMarkdownRenderer";
  return { default: MockMarkdownRenderer };
});

// Mock heavy subcomponents used by AIResponseRenderer
jest.mock("@/components/Tables/BaseDataTable", () => {
  const MockBaseDataTable = ({
    tableClassName,
  }: {
    tableClassName?: string;
  }) => (
    <div data-testid="base-data-table" data-class={tableClassName}>
      Mock Table
    </div>
  );
  MockBaseDataTable.displayName = "MockBaseDataTable";
  return MockBaseDataTable;
});

jest.mock("@/components/AICharts/AIChartContainer", () => {
  const MockAIChartContainer = ({ chartId }: { chartId: string }) => (
    <div data-testid="ai-chart-container" data-chart-id={chartId}>
      Mock Chart
    </div>
  );
  MockAIChartContainer.displayName = "MockAIChartContainer";
  return { AIChartContainer: MockAIChartContainer };
});

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
    const contentEl = await screen.findByText(
      'This is an AI response message.'
    );
    expect(contentEl).toBeInTheDocument();
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
    const titleEl = screen.getByText('Assistant Title');
    const bubble = titleEl.closest('div')?.parentElement as HTMLElement;
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
