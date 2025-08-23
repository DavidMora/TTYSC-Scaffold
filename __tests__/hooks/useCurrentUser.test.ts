import { renderHook } from '@testing-library/react';
import {
  useCurrentUser,
  getInitials,
  getFirstName,
} from '@/hooks/useCurrentUser';

// Default mock for useAuth so the hook does not require AuthProvider
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    session: {
      user: { name: 'John Doe', email: 'john@example.com', image: null },
    },
  }),
}));

describe('useCurrentUser', () => {
  describe('getInitials', () => {
    it('returns first and last initials for multi-word names', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('  Mary   Jane  ')).toBe('MJ');
    });

    it('returns single initial for single-word names', () => {
      expect(getInitials('alice')).toBe('A');
    });

    it('returns U for empty or falsy names', () => {
      expect(getInitials('   ')).toBe('U');
      expect(getInitials(undefined)).toBe('U');
      expect(getInitials(null)).toBe('U');
    });
  });

  describe('getFirstName', () => {
    it('returns first token for multi-word names', () => {
      expect(getFirstName('Mary Jane Watson')).toBe('Mary');
    });

    it('returns "there" for empty or falsy names', () => {
      expect(getFirstName('   ')).toBe('there');
      expect(getFirstName(undefined)).toBe('there');
      expect(getFirstName(null)).toBe('there');
    });
  });

  describe('hook behavior', () => {
    it('returns current user info derived from session', () => {
      const { result } = renderHook(() => useCurrentUser());
      expect(result.current.currentUser).toEqual({
        name: 'John Doe',
        initials: 'JD',
        image: null,
      });
    });
  });
});
