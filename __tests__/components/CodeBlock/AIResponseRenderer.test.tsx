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

    const textElement = screen.getByTestId('ui5-text');
    expect(textElement).toHaveStyle({ whiteSpace: 'pre-wrap' });
    expect(textElement.textContent).toBe(content);
  });

  it('renders container with full width', () => {
    const content = 'Test content';
    render(<AIResponseRenderer content={content} />);

    const container = screen.getByText(content).closest('div');
    expect(container).toHaveStyle({ width: '100%' });
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
});
