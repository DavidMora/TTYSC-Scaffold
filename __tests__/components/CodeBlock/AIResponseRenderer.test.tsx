import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIResponseRenderer } from '@/components/AnalysisChat/AIResponseRenderer';
import '@testing-library/jest-dom';

// Mock the components
jest.mock('@/components/CodeBlock/CodeBlock', () => {
  const MockCodeBlock = ({
    code,
    language,
    showLineNumbers,
  }: {
    code: string;
    language: string;
    showLineNumbers: boolean;
  }) => (
    <div
      data-testid="code-block"
      data-language={language}
      data-show-lines={showLineNumbers}
    >
      {code}
    </div>
  );
  MockCodeBlock.displayName = 'MockCodeBlock';
  return { CodeBlock: MockCodeBlock };
});

jest.mock('@/components/Tables/BaseDataTable', () => {
  const MockBaseDataTable = ({
    data,
    tableClassName,
  }: {
    data: { rows?: Array<{ id: string }> };
    tableClassName: string;
  }) => (
    <div data-testid="base-data-table" data-class={tableClassName}>
      Mock Table with {data?.rows?.length || 0} rows
    </div>
  );
  MockBaseDataTable.displayName = 'MockBaseDataTable';
  return MockBaseDataTable;
});

jest.mock('@/components/AICharts/AIChartContainer', () => {
  const MockAIChartContainer = ({ chartId }: { chartId: string }) => (
    <div data-testid="ai-chart-container" data-chart-id={chartId}>
      AI Chart Container with ID: {chartId}
    </div>
  );
  MockAIChartContainer.displayName = 'MockAIChartContainer';
  return { AIChartContainer: MockAIChartContainer };
});

// Mock MarkdownRenderer to render raw markdown text content
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
  return { __esModule: true, default: MockMarkdownRenderer };
});

// Mock the table data
jest.mock('@/lib/constants/mocks/dataTable', () => ({
  tableData: {
    rowIdentifier: 'id',
    headers: [{ text: 'Test Header', accessorKey: 'test' }],
    rows: [{ id: '1', test: 'Test Data' }],
  },
}));

describe('AIResponseRenderer', () => {
  it('renders plain text content', () => {
    const content = 'This is a simple text message.';
    render(<AIResponseRenderer content={content} />);

    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it('renders empty content as empty div', () => {
    const { container } = render(<AIResponseRenderer content="" />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ width: '100%' });
  });

  it('renders null content as empty div', () => {
    const { container } = render(
      <AIResponseRenderer content={null as unknown as string} />
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ width: '100%' });
  });

  it('renders code block with language', () => {
    const content = `Here is some code:
\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`
And some more text.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByText('Here is some code:')).toBeInTheDocument();
    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByTestId('code-block')).toHaveAttribute(
      'data-language',
      'javascript'
    );
    expect(screen.getByTestId('code-block')).toHaveAttribute(
      'data-show-lines',
      'true'
    );
    expect(screen.getByTestId('code-block')).toHaveTextContent(
      'function hello() {'
    );
    expect(screen.getByText('And some more text.')).toBeInTheDocument();
  });

  it('renders code block without language (defaults to text)', () => {
    const content = `\`\`\`
function hello() {
  console.log("Hello World");
}
\`\`\``;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByTestId('code-block')).toHaveAttribute(
      'data-language',
      'text'
    );
  });

  it('renders table when [SHOW_TABLE] is present', () => {
    const content = `Here is some analysis:
[SHOW_TABLE]
And the conclusion.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByText('Here is some analysis:')).toBeInTheDocument();
    expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
    expect(screen.getByTestId('base-data-table')).toHaveAttribute(
      'data-class',
      'h-96'
    );
    expect(screen.getByText('And the conclusion.')).toBeInTheDocument();
  });

  it('renders table with case insensitive [SHOW_TABLE]', () => {
    const content = `Analysis with table:
[show_table]
End of analysis.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
  });

  it('renders multiple code blocks and tables', () => {
    const content = `Start of content.
\`\`\`python
print("Hello")
\`\`\`
[SHOW_TABLE]
\`\`\`javascript
console.log("World");
\`\`\`
End of content.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByText('Start of content.')).toBeInTheDocument();
    expect(screen.getAllByTestId('code-block')).toHaveLength(2);
    expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
    expect(screen.getByText('End of content.')).toBeInTheDocument();
  });

  it('renders code blocks with different languages', () => {
    const content = `\`\`\`python
print("Python code")
\`\`\`
\`\`\`javascript
console.log("JavaScript code");
\`\`\`
\`\`\`typescript
const message: string = "TypeScript code";
\`\`\``;

    render(<AIResponseRenderer content={content} />);

    const codeBlocks = screen.getAllByTestId('code-block');
    expect(codeBlocks).toHaveLength(3);
    expect(codeBlocks[0]).toHaveAttribute('data-language', 'python');
    expect(codeBlocks[1]).toHaveAttribute('data-language', 'javascript');
    expect(codeBlocks[2]).toHaveAttribute('data-language', 'typescript');
  });

  it('handles mixed content with text, code, and tables', () => {
    const content = `Introduction text.
\`\`\`bash
npm install package
\`\`\`
[SHOW_TABLE]
\`\`\`json
{
  "key": "value"
}
\`\`\`
Conclusion text.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByText('Introduction text.')).toBeInTheDocument();
    expect(screen.getAllByTestId('code-block')).toHaveLength(2);
    expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
    expect(screen.getByText('Conclusion text.')).toBeInTheDocument();
  });

  it('preserves whitespace in text content', () => {
    const content = `Line 1
Line 2
  Indented line
Line 4`;

    render(<AIResponseRenderer content={content} />);
    // Since plain text without code/table/chart is rendered via marked + sanitized HTML
    // and our marked mock returns the content directly, we can assert on the text nodes.
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
    expect(screen.getByText(/Indented line/)).toBeInTheDocument();
    expect(screen.getByText(/Line 4/)).toBeInTheDocument();
  });

  it('renders container with full width', () => {
    const content = 'Test content';
    const { container } = render(<AIResponseRenderer content={content} />);
    // The component returns a wrapping div; firstChild holds content
    const outer = container.firstChild as HTMLElement | null;
    expect(outer).toBeInTheDocument();
    if (outer) {
      expect(outer).toHaveStyle({ width: '100%' });
    }
  });

  it('handles content with only code blocks', () => {
    const content = `\`\`\`python
def hello():
    return "Hello World"
\`\`\``;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByTestId('code-block')).toHaveTextContent('def hello():');
  });

  it('handles content with only tables', () => {
    const content = '[SHOW_TABLE]';

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
  });

  it('handles malformed code blocks gracefully', () => {
    const content = `\`\`\`
Incomplete code block
\`\`\`
\`\`\`javascript
Complete code block
\`\`\``;

    render(<AIResponseRenderer content={content} />);

    const codeBlocks = screen.getAllByTestId('code-block');
    expect(codeBlocks).toHaveLength(2);
    expect(codeBlocks[0]).toHaveAttribute('data-language', 'text');
    expect(codeBlocks[1]).toHaveAttribute('data-language', 'javascript');
  });

  it('renders chart when [SHOW_CHART] is present', () => {
    const content = `Here is some analysis:
[SHOW_CHART]
And the conclusion.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByText('Here is some analysis:')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chart-container')).toHaveAttribute(
      'data-chart-id',
      ''
    );
    expect(screen.getByText('And the conclusion.')).toBeInTheDocument();
  });

  it('renders chart with UUID when [SHOW_CHART:uuid] is present', () => {
    const chartId = '12345678-1234-1234-1234-123456789abc';
    const content = `Analysis with chart:
[SHOW_CHART:${chartId}]
End of analysis.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByTestId('ai-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chart-container')).toHaveAttribute(
      'data-chart-id',
      chartId
    );
  });

  it('renders chart with case insensitive [SHOW_CHART]', () => {
    const content = `Analysis with chart:
[show_chart]
End of analysis.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByTestId('ai-chart-container')).toBeInTheDocument();
  });

  it('renders mixed content with text, code, tables, and charts', () => {
    const chartId = '12345678-1234-1234-1234-123456789abc';
    const content = `Introduction text.
\`\`\`bash
npm install package
\`\`\`
[SHOW_TABLE]
[SHOW_CHART:${chartId}]
\`\`\`json
{
  "key": "value"
}
\`\`\`
Conclusion text.`;

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByText('Introduction text.')).toBeInTheDocument();
    expect(screen.getAllByTestId('code-block')).toHaveLength(2);
    expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('ai-chart-container')).toHaveAttribute(
      'data-chart-id',
      chartId
    );
    expect(screen.getByText('Conclusion text.')).toBeInTheDocument();
  });

  it('handles content with only charts', () => {
    const content = '[SHOW_CHART]';

    render(<AIResponseRenderer content={content} />);

    expect(screen.getByTestId('ai-chart-container')).toBeInTheDocument();
  });

  it('handles chart with empty content and fallback to empty string', () => {
    const content = `[SHOW_CHART]
Some text after chart.`;

    render(<AIResponseRenderer content={content} />);

    const chartContainer = screen.getByTestId('ai-chart-container');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveAttribute('data-chart-id', '');
  });
});
