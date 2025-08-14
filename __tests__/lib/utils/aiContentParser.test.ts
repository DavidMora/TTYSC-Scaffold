import { parseContent } from '@/lib/utils/aiContentParser';

describe('parseContent', () => {
  test('should parse code blocks with language', () => {
    const input =
      "Here is some text\n```javascript\nconsole.log('hello');\n```\nMore text";
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'code',
      language: 'javascript',
      content: "console.log('hello');\n",
      index: 18,
      matchLength: 39,
    });
  });

  test('should parse table markers', () => {
    const input = 'Here is some text [SHOW_TABLE] and more text';
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'table',
      index: 18,
      matchLength: 12,
    });
  });

  test('should handle very long content and truncate it', () => {
    const longText = 'a'.repeat(1000001);
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = parseContent(longText);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Content too long, truncating to prevent performance issues'
    );
    expect(result).toHaveLength(0);

    consoleSpy.mockRestore();
  });

  test('should parse code blocks without language specifiers', () => {
    const input =
      "Here is some text\n```\nconsole.log('hello');\n```\nMore text";
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'code',
      language: '',
      content: "\nconsole.log('hello');\n",
      index: 18,
      matchLength: 29,
    });
  });

  test('should parse multiple code blocks in a single input', () => {
    const input =
      "Text\n```js\nconst x = 1;\n```\nMore text\n```python\nprint('hello')\n```\nEnd";
    const result = parseContent(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'code',
      language: 'js',
      content: 'const x = 1;\n',
      index: 5,
      matchLength: 22,
    });
    expect(result[1]).toEqual({
      type: 'code',
      language: 'python',
      content: "print('hello')\n",
      index: 38,
      matchLength: 28,
    });
  });

  test('should parse mixed content with both code blocks and table markers', () => {
    const input = 'Start\n```js\nconst x = 1;\n```\n[SHOW_TABLE]\nMore text';
    const result = parseContent(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: 'code',
      language: 'js',
      content: 'const x = 1;\n',
      index: 6,
      matchLength: 22,
    });
    expect(result[1]).toEqual({
      type: 'table',
      index: 29,
      matchLength: 12,
    });
  });

  test('should handle malformed code blocks (unclosed)', () => {
    const input =
      'Text\n```js\nconst x = 1;\nMore text without closing backticks';
    const result = parseContent(input);

    expect(result).toHaveLength(0);
  });

  test('should handle case-insensitive table marker matching', () => {
    const input = 'Text [show_table] and [SHOW_TABLE] and [Show_Table]';
    const result = parseContent(input);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: 'table',
      index: 5,
      matchLength: 12,
    });
    expect(result[1]).toEqual({
      type: 'table',
      index: 22,
      matchLength: 12,
    });
    expect(result[2]).toEqual({
      type: 'table',
      index: 39,
      matchLength: 12,
    });
  });

  // New test cases to cover missing lines
  test('should handle consecutive code block markers without content', () => {
    const input = 'Text\n```\n```\nMore text';
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'code',
      language: '',
      content: '\n',
      index: 5,
      matchLength: 7,
    });
  });

  test('should parse chart markers with UUID', () => {
    const input =
      'Here is some text [SHOW_CHART:12345678-1234-1234-1234-123456789abc] and more text';
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'chart',
      index: 18,
      matchLength: 49,
      chartId: '12345678-1234-1234-1234-123456789abc',
    });
  });

  test('should parse chart markers without UUID', () => {
    const input = 'Here is some text [SHOW_CHART] and more text';
    const result = parseContent(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'chart',
      index: 18,
      matchLength: 12,
      chartId: undefined,
    });
  });

  test('should handle regex infinite loop prevention for table markers', () => {
    const input = '[SHOW_TABLE][SHOW_TABLE][SHOW_TABLE]';
    const result = parseContent(input);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: 'table',
      index: 0,
      matchLength: 12,
    });
    expect(result[1]).toEqual({
      type: 'table',
      index: 12,
      matchLength: 12,
    });
    expect(result[2]).toEqual({
      type: 'table',
      index: 24,
      matchLength: 12,
    });
  });

  test('should handle regex infinite loop prevention for chart markers', () => {
    const input =
      '[SHOW_CHART][SHOW_CHART:12345678-1234-1234-1234-123456789abc][SHOW_CHART]';
    const result = parseContent(input);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: 'chart',
      index: 0,
      matchLength: 12,
      chartId: undefined,
    });
    expect(result[1]).toEqual({
      type: 'chart',
      index: 12,
      matchLength: 49,
      chartId: '12345678-1234-1234-1234-123456789abc',
    });
    expect(result[2]).toEqual({
      type: 'chart',
      index: 61,
      matchLength: 12,
      chartId: undefined,
    });
  });

  test('should handle mixed content with all types of markers', () => {
    const input =
      'Start\n```js\nconst x = 1;\n```\n[SHOW_TABLE]\n[SHOW_CHART:12345678-1234-1234-1234-123456789abc]\nEnd';
    const result = parseContent(input);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: 'code',
      language: 'js',
      content: 'const x = 1;\n',
      index: 6,
      matchLength: 22,
    });
    expect(result[1]).toEqual({
      type: 'table',
      index: 29,
      matchLength: 12,
    });
    expect(result[2]).toEqual({
      type: 'chart',
      index: 42,
      matchLength: 49,
      chartId: '12345678-1234-1234-1234-123456789abc',
    });
  });
});
