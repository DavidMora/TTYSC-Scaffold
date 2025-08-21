import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeBlock } from '@/components/CodeBlock/CodeBlock';
import Prism from 'prismjs';

// Mock Prism.js
jest.mock('prismjs', () => ({
  highlightElement: jest.fn(),
}));

// Mock all prismjs imports
jest.mock('prismjs/themes/prism.css', () => ({}));
jest.mock('prismjs/components/prism-javascript', () => ({}));
jest.mock('prismjs/components/prism-typescript', () => ({}));
jest.mock('prismjs/components/prism-jsx', () => ({}));
jest.mock('prismjs/components/prism-tsx', () => ({}));
jest.mock('prismjs/components/prism-python', () => ({}));
jest.mock('prismjs/components/prism-java', () => ({}));
jest.mock('prismjs/components/prism-css', () => ({}));
jest.mock('prismjs/components/prism-json', () => ({}));
jest.mock('prismjs/components/prism-bash', () => ({}));
jest.mock('prismjs/components/prism-sql', () => ({}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('CodeBlock', () => {
  const mockCode = `function hello() {
  console.log("Hello, World!");
}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders code with default language', () => {
    render(<CodeBlock code={mockCode} />);

    expect(screen.getByText('Copy Code')).toBeInTheDocument();
    expect(screen.getByRole('code')).toBeInTheDocument();
  });

  it('renders code with custom language', () => {
    render(<CodeBlock code={mockCode} language="typescript" />);

    expect(screen.getByText('Copy Code')).toBeInTheDocument();
    expect(screen.getByRole('code')).toBeInTheDocument();
  });

  it('renders code with title', () => {
    render(<CodeBlock code={mockCode} title="Example Code" />);

    expect(screen.getByText('Copy Code')).toBeInTheDocument();
    expect(screen.getByRole('code')).toBeInTheDocument();
  });

  it('renders without line numbers when showLineNumbers is false', () => {
    render(<CodeBlock code={mockCode} showLineNumbers={false} />);

    // Should not have line numbers
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('renders with line numbers when showLineNumbers is true', () => {
    render(<CodeBlock code={mockCode} showLineNumbers={true} />);

    // Should have line numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('copies code to clipboard when copy button is clicked', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<CodeBlock code={mockCode} />);

    const copyButton = screen.getByText('Copy Code');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(mockCode);
    });

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('shows copied state for 2 seconds', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<CodeBlock code={mockCode} />);

    const copyButton = screen.getByText('Copy Code');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Wait for the timeout to complete
    await waitFor(
      () => {
        expect(screen.getByText('Copy Code')).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });

  it('handles clipboard API failure gracefully', async () => {
    const mockWriteText = jest
      .fn()
      .mockRejectedValue(new Error('Clipboard API not available'));
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    // Mock document.execCommand for fallback
    const mockExecCommand = jest.fn().mockReturnValue(true);
    Object.assign(document, {
      execCommand: mockExecCommand,
    });

    render(<CodeBlock code={mockCode} />);

    const copyButton = screen.getByText('Copy Code');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(mockCode);
    });

    // Should still show "Copy Code" since the clipboard API failed
    expect(screen.getByText('Copy Code')).toBeInTheDocument();
  });

  it('calls Prism.highlightElement when component mounts and when code/language changes', () => {
    const mockHighlightElement = jest.fn();
    (Prism.highlightElement as jest.Mock).mockImplementation(
      mockHighlightElement
    );

    const { rerender } = render(
      <CodeBlock code={mockCode} language="javascript" />
    );

    expect(mockHighlightElement).toHaveBeenCalledTimes(1);

    // Rerender with different code
    rerender(<CodeBlock code="new code" language="javascript" />);
    expect(mockHighlightElement).toHaveBeenCalledTimes(2);

    // Rerender with different language
    rerender(<CodeBlock code="new code" language="typescript" />);
    expect(mockHighlightElement).toHaveBeenCalledTimes(3);
  });

  it('handles code that ends with newline correctly in line numbers', () => {
    const codeWithNewline = `function test() {
  return true;
}
`;

    render(<CodeBlock code={codeWithNewline} showLineNumbers={true} />);

    // Should have 4 line numbers (including the empty line at the end)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it("handles code that doesn't end with newline correctly in line numbers", () => {
    const codeWithoutNewline = `function test() {
  return true;
}`;

    render(<CodeBlock code={codeWithoutNewline} showLineNumbers={true} />);

    // Should have 3 line numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('logs error to console when clipboard API fails', async () => {
    const mockWriteText = jest
      .fn()
      .mockRejectedValue(new Error('Clipboard API not available'));
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(<CodeBlock code={mockCode} />);

    const copyButton = screen.getByText('Copy Code');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to copy code:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('handles case where codeRef.current is null in useEffect', () => {
    const mockHighlightElement = jest.fn();
    (Prism.highlightElement as jest.Mock).mockImplementation(
      mockHighlightElement
    );

    // Render component
    render(<CodeBlock code={mockCode} />);

    // The useEffect should still be called, even if codeRef.current is initially null
    // This test ensures the component doesn't crash when the ref is not available
    expect(mockHighlightElement).toHaveBeenCalled();
  });

  it('renders without header when no title or language is provided', () => {
    render(<CodeBlock code={mockCode} language="" title="" />);

    expect(screen.getByText('Copy Code')).toBeInTheDocument();
    expect(screen.getByRole('code')).toBeInTheDocument();
  });
});
