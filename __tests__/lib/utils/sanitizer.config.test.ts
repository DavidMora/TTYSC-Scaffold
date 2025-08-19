import {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  FORBID_ATTR,
  ALLOWED_URI_REGEXP,
  SANITIZER_CONFIG,
} from '@/lib/utils/sanitizer.config';

describe('lib/utils/sanitizer.config', () => {
  it('exposes expected arrays and values', () => {
    expect(Array.isArray(ALLOWED_TAGS)).toBe(true);
    expect(Array.isArray(ALLOWED_ATTR)).toBe(true);
    expect(Array.isArray(FORBID_ATTR)).toBe(true);
    expect(ALLOWED_TAGS).toContain('a');
    expect(ALLOWED_ATTR).toContain('href');
    expect(FORBID_ATTR).toContain('style');
  });

  it('has a restrictive allowed URI regexp', () => {
    const valids = [
      'https://example.com',
      'http://test',
      'mailto:user@example.com',
      'data:image/png;base64,AAA',
      'data:image/jpeg;base64,AAA',
      'data:image/jpg;base64,AAA',
      'data:image/gif;base64,AAA',
      'data:image/webp;base64,AAA',
    ];
    const invalids = [
      'javascript:alert(1)',
      'ftp://example.com',
      'data:text/plain;base64,AAA',
      'data:image/svg+xml;base64,AAA',
      'JavaScript:alert(1)',
      'jAvAsCrIpT:alert(1)',
      'JavaScript:alert(1)',
      'jAvAsCrIpT:alert(1)',
      'vbscript:alert(1)',
      'data:text/html;base64,AAA',
      'data:text/html;base64,AAA',
      'data:image/svg+xml;utf8,<svg/>',
      'xhttp://example.com',
      'file:///etc/passwd',
    ];

    for (const url of valids) {
      expect(ALLOWED_URI_REGEXP.test(url)).toBe(true);
      expect(SANITIZER_CONFIG.ALLOWED_URI_REGEXP.test(url)).toBe(true);
    }
    for (const url of invalids) {
      expect(ALLOWED_URI_REGEXP.test(url)).toBe(false);
      expect(SANITIZER_CONFIG.ALLOWED_URI_REGEXP.test(url)).toBe(false);
    }
  });
});
