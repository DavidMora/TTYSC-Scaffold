import {
  escapeMarkdownCell,
  recordsToMarkdownTable,
} from '@/lib/utils/tableMarkdown';

describe('tableMarkdown', () => {
  describe('escapeMarkdownCell', () => {
    it('should return empty string for null and undefined', () => {
      expect(escapeMarkdownCell(null)).toBe('');
      expect(escapeMarkdownCell(undefined)).toBe('');
    });

    it('should return string values as-is without pipes and newlines', () => {
      expect(escapeMarkdownCell('hello world')).toBe('hello world');
    });

    it('should escape pipe characters in strings', () => {
      expect(escapeMarkdownCell('hello | world')).toBe('hello \\| world');
      expect(escapeMarkdownCell('a|b|c')).toBe('a\\|b\\|c');
    });

    it('should replace newlines with <br/> tags', () => {
      expect(escapeMarkdownCell('line1\nline2')).toBe('line1<br/>line2');
      expect(escapeMarkdownCell('line1\nline2\nline3')).toBe(
        'line1<br/>line2<br/>line3'
      );
    });

    it('should handle both pipes and newlines', () => {
      expect(escapeMarkdownCell('a|b\nc|d')).toBe('a\\|b<br/>c\\|d');
    });

    it('should convert numbers to strings', () => {
      expect(escapeMarkdownCell(123)).toBe('123');
      expect(escapeMarkdownCell(3.14)).toBe('3.14');
      expect(escapeMarkdownCell(0)).toBe('0');
    });

    it('should convert booleans to strings', () => {
      expect(escapeMarkdownCell(true)).toBe('true');
      expect(escapeMarkdownCell(false)).toBe('false');
    });

    it('should JSON.stringify objects and arrays', () => {
      expect(escapeMarkdownCell({ key: 'value' })).toBe('{"key":"value"}');
      expect(escapeMarkdownCell([1, 2, 3])).toBe('[1,2,3]');
    });

    it('should handle objects with pipes and newlines', () => {
      const obj = { message: 'hello|world\ntest' };
      const result = escapeMarkdownCell(obj);
      // JSON.stringify turns the actual newline into \\n in the JSON string,
      // then escapeMarkdownCell replaces | with \\| but \\n stays as \\n
      expect(result).toBe('{"message":"hello\\|world\\ntest"}');
    });

    it('should fallback to String() for non-serializable values', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      expect(escapeMarkdownCell(circular)).toBe('[object Object]');
    });
  });

  describe('recordsToMarkdownTable', () => {
    it('should handle empty array', () => {
      const result = recordsToMarkdownTable([]);
      expect(result).toBe('| |\n|---|');
    });

    it('should handle single record', () => {
      const records = [{ name: 'John', age: 30 }];
      const result = recordsToMarkdownTable(records);
      expect(result).toBe('| age | name |\n|---|---|\n| 30 | John |');
    });

    it('should handle multiple records', () => {
      const records = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const result = recordsToMarkdownTable(records);
      expect(result).toBe(
        '| age | name |\n|---|---|\n| 30 | John |\n| 25 | Jane |'
      );
    });

    it('should handle records with different keys', () => {
      const records = [
        { name: 'John', age: 30 },
        { name: 'Jane', city: 'NYC' },
      ];
      const result = recordsToMarkdownTable(records);
      expect(result).toBe(
        '| age | city | name |\n|---|---|---|\n| 30 |  | John |\n|  | NYC | Jane |'
      );
    });

    it('should respect preferred header order', () => {
      const records = [
        { name: 'John', age: 30, city: 'LA' },
        { name: 'Jane', age: 25, city: 'NYC' },
      ];
      const result = recordsToMarkdownTable(records, ['name', 'city']);
      expect(result).toBe(
        '| name | city | age |\n|---|---|---|\n| John | LA | 30 |\n| Jane | NYC | 25 |'
      );
    });

    it('should handle preferred headers that do not exist in records', () => {
      const records = [{ name: 'John', age: 30 }];
      const result = recordsToMarkdownTable(records, ['nonexistent', 'name']);
      expect(result).toBe('| name | age |\n|---|---|\n| John | 30 |');
    });

    it('should handle null and undefined values in records', () => {
      const records = [
        { name: 'John', age: null, city: undefined },
        { name: null, age: 25, city: 'NYC' },
      ];
      const result = recordsToMarkdownTable(records);
      expect(result).toBe(
        '| age | city | name |\n|---|---|---|\n|  |  | John |\n| 25 | NYC |  |'
      );
    });

    it('should escape pipes and newlines in cell values', () => {
      const records = [{ message: 'hello|world', description: 'line1\nline2' }];
      const result = recordsToMarkdownTable(records);
      expect(result).toBe(
        '| description | message |\n|---|---|\n| line1<br/>line2 | hello\\|world |'
      );
    });

    it('should handle complex objects in cells', () => {
      const records = [
        { name: 'John', data: { nested: 'value' }, list: [1, 2, 3] },
      ];
      const result = recordsToMarkdownTable(records);
      expect(result).toBe(
        '| data | list | name |\n|---|---|---|\n| {"nested":"value"} | [1,2,3] | John |'
      );
    });

    it('should handle non-array input by treating as empty array', () => {
      const result = recordsToMarkdownTable(
        null as unknown as Array<Record<string, unknown>>
      );
      expect(result).toBe('| |\n|---|');
    });

    it('should handle array with null/undefined elements', () => {
      const records = [null, undefined, { name: 'John' }] as Array<
        Record<string, unknown>
      >;
      const result = recordsToMarkdownTable(records);
      expect(result).toBe('| name |\n|---|\n|  |\n|  |\n| John |');
    });

    it('should sort remaining headers alphabetically when no preferred order', () => {
      const records = [{ z: 'last', a: 'first', m: 'middle' }];
      const result = recordsToMarkdownTable(records);
      expect(result).toBe(
        '| a | m | z |\n|---|---|---|\n| first | middle | last |'
      );
    });

    it('should maintain preferred order and sort remaining alphabetically', () => {
      const records = [{ z: 'last', a: 'first', m: 'middle', b: 'second' }];
      const result = recordsToMarkdownTable(records, ['z', 'm']);
      expect(result).toBe(
        '| z | m | a | b |\n|---|---|---|---|\n| last | middle | first | second |'
      );
    });
  });
});
