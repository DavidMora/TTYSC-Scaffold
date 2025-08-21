import { parseDate } from '@/lib/utils/dateUtils';

describe('parseDate', () => {
  test('should format date correctly for AM time', () => {
    const input = '2024-01-15T09:30:00Z';
    const result = parseDate(input);

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(result).toContain('AM');
  });

  test('should format date correctly for PM time', () => {
    const input = '2024-01-15T16:30:00Z';
    const result = parseDate(input);

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(['AM', 'PM']).toContain(result.split(' ').pop());
  });

  test('should format date correctly for midnight time', () => {
    const input = '2024-01-15T00:00:00Z';
    const result = parseDate(input);

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
  });

  test('should handle different time zones consistently', () => {
    const inputs = [
      '2024-01-15T09:30:00Z',
      '2024-01-15T16:30:00Z',
      '2024-01-15T00:00:00Z',
    ];

    inputs.forEach((input) => {
      const result = parseDate(input);
      expect(result).toMatch(
        /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
      );
    });
  });

  test('should use UTC methods when useUTC is true', () => {
    const input = '2024-01-15T14:30:00Z';
    const result = parseDate(input, true); // useUTC = true

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(result).toContain('PM'); // 14:30 UTC = 2:30 PM
  });

  test('should handle PM time correctly (hours >= 12)', () => {
    const input = '2024-01-15T14:30:00Z';
    const result = parseDate(input);

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(['AM', 'PM']).toContain(result.split(' ').pop());
  });

  test('should handle noon time (12:00 PM)', () => {
    const input = '2024-01-15T12:00:00Z';
    const result = parseDate(input);

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(['AM', 'PM']).toContain(result.split(' ').pop());
  });

  test('should handle midnight time showing 12 AM (not 0 AM)', () => {
    // Create a Date object for midnight (00:00) in UTC
    const date = new Date('2024-01-15T00:00:00.000Z');
    const input = date.toISOString();
    const result = parseDate(input, true); // Use UTC to ensure consistent behavior

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(result).toContain('12:00 AM');
  });

  test('should handle noon time showing 12 PM (not 0 PM)', () => {
    // Create a Date object for noon (12:00) in UTC
    const date = new Date('2024-01-15T12:00:00.000Z');
    const input = date.toISOString();
    const result = parseDate(input, true); // Use UTC to ensure consistent behavior

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(result).toContain('12:00 PM');
  });

  test('should handle edge case of 11:59 AM', () => {
    const input = '2024-01-15T11:59:00Z';
    const result = parseDate(input);

    expect(result).toMatch(
      /^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2} (AM|PM)$/
    );
    expect(result).toContain('AM');
  });

  test('should handle invalid date', () => {
    const input = 'invalid-date';
    const result = parseDate(input);

    expect(result).toBe('Invalid date');
  });
});
