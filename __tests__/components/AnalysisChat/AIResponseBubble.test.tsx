import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIResponseBubble } from '@/components/AnalysisChat/AIResponseBubble';
import { ChatMessage } from '@/lib/types/chats';
import { AutosaveUIProvider } from '@/contexts/AutosaveUIProvider';
import type { ChatStreamStepInfo } from '@/hooks/chats/stream';

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
jest.mock('@/components/AnalysisChat/AIResponseRenderer', () => ({
  __esModule: true,
  AIResponseRenderer: ({ content }: { content: string }) => (
    <div style={{ width: '100%' }}>
      <div className="markdown">{content}</div>
      {/\[show_table\]/i.test(content) ? (
        <div data-testid="base-data-table" />
      ) : null}
    </div>
  ),
}));

// Mock MarkdownRenderer to render raw markdown text synchronously
jest.mock('@/components/Markdown/MarkdownRenderer', () => {
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
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {markdown}
    </div>
  );
  MockMarkdownRenderer.displayName = 'MockMarkdownRenderer';
  return { default: MockMarkdownRenderer };
});

// Mock heavy subcomponents used by AIResponseRenderer
jest.mock('@/components/Tables/BaseDataTable', () => {
  const MockBaseDataTable = ({
    tableClassName,
  }: {
    tableClassName?: string;
  }) => (
    <div data-testid="base-data-table" data-class={tableClassName}>
      Mock Table
    </div>
  );
  MockBaseDataTable.displayName = 'MockBaseDataTable';
  return MockBaseDataTable;
});

jest.mock('@/components/AICharts/AIChartContainer', () => {
  const MockAIChartContainer = ({ chartId }: { chartId: string }) => (
    <div data-testid="ai-chart-container" data-chart-id={chartId}>
      Mock Chart
    </div>
  );
  MockAIChartContainer.displayName = 'MockAIChartContainer';
  return { AIChartContainer: MockAIChartContainer };
});

// Mock date formatting
jest.mock('@/lib/utils/dateUtils', () => ({
  parseDate: (iso: string) => `Formatted(${iso})`,
}));

// Mock AIResponseRenderer
jest.mock('@/components/AnalysisChat/AIResponseRenderer', () => ({
  AIResponseRenderer: ({ content }: { content: string }) => (
    <div data-testid="ai-response-renderer">{content}</div>
  ),
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
    expect(screen.getByTestId('ai-response-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('ai-response-renderer')).toHaveTextContent(
      'This is an AI response message.'
    );
  });

  it('renders feedback vote component', () => {
    render(
      <TestWrapper>
        <AIResponseBubble message={baseMessage} />
      </TestWrapper>
    );

    expect(screen.getByTestId('feedback-vote')).toBeInTheDocument();
  });

  it('applies correct styling for AI response', () => {
    const { container } = render(
      <TestWrapper>
        <AIResponseBubble message={baseMessage} />
      </TestWrapper>
    );

    // Find the main container div with the styling
    const bubble = container.querySelector(
      'div[style*="background-color: rgb(234, 245, 207)"]'
    );
    expect(bubble).toBeTruthy();
    expect(bubble).toHaveStyle({
      backgroundColor: 'rgb(234, 245, 207)',
      borderRadius: '16px',
      border: '1px solid rgb(213, 215, 218)',
    });
  });

  it('shows default title when title is not provided', () => {
    render(
      <TestWrapper>
        <AIResponseBubble message={{ ...baseMessage, title: undefined }} />
      </TestWrapper>
    );
    expect(screen.getByText('AI Response')).toBeInTheDocument();
  });

  it('does not render content when not streaming and content is null', () => {
    render(
      <TestWrapper>
        <AIResponseBubble
          message={{ ...baseMessage, content: null as unknown as string }}
          isStreaming={false}
        />
      </TestWrapper>
    );
    expect(
      screen.queryByTestId('ai-response-renderer')
    ).not.toBeInTheDocument();
  });

  describe('streaming functionality', () => {
    it('shows busy indicator when streaming without steps', () => {
      render(
        <TestWrapper>
          <AIResponseBubble message={baseMessage} isStreaming={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
      expect(
        screen.queryByTestId('ai-response-renderer')
      ).not.toBeInTheDocument();
    });

    it('shows busy indicator when streaming with steps', () => {
      const steps: ChatStreamStepInfo[] = [
        {
          ts: '2025-07-23T10:00:00.000Z',
          step: 'Analyzing data',
          workflow_status: 'in_progress',
        },
      ];

      render(
        <TestWrapper>
          <AIResponseBubble
            message={baseMessage}
            isStreaming={true}
            steps={steps}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
      expect(
        screen.queryByTestId('ai-response-renderer')
      ).not.toBeInTheDocument();
    });

    it('shows busy indicator when streaming with step but no status', () => {
      const steps: ChatStreamStepInfo[] = [
        {
          ts: '2025-07-23T10:00:00.000Z',
          workflow_status: 'in_progress',
        },
      ];

      render(
        <TestWrapper>
          <AIResponseBubble
            message={baseMessage}
            isStreaming={true}
            steps={steps}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
    });

    it('shows busy indicator when streaming with completed steps', () => {
      const steps: ChatStreamStepInfo[] = [
        {
          ts: '2025-07-23T10:00:00.000Z',
          step: 'Completed step',
          workflow_status: 'completed',
        },
      ];

      render(
        <TestWrapper>
          <AIResponseBubble
            message={baseMessage}
            isStreaming={true}
            steps={steps}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
    });

    it('shows busy indicator when streaming with multiple steps', () => {
      const steps: ChatStreamStepInfo[] = [
        {
          ts: '2025-07-23T10:00:00.000Z',
          step: 'First step',
          workflow_status: 'completed',
        },
        {
          ts: '2025-07-23T10:01:00.000Z',
          step: 'Second step',
          workflow_status: 'in_progress',
        },
        {
          ts: '2025-07-23T10:02:00.000Z',
          step: 'Third step',
          workflow_status: null,
        },
      ];

      render(
        <TestWrapper>
          <AIResponseBubble
            message={baseMessage}
            isStreaming={true}
            steps={steps}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
    });

    it('shows busy indicator when streaming with steps but none have workflow_status', () => {
      const steps: ChatStreamStepInfo[] = [
        {
          ts: '2025-07-23T10:00:00.000Z',
          step: 'Step without status',
        },
      ];

      render(
        <TestWrapper>
          <AIResponseBubble
            message={baseMessage}
            isStreaming={true}
            steps={steps}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('ui5-busy-indicator')).toBeInTheDocument();
    });
  });
});
