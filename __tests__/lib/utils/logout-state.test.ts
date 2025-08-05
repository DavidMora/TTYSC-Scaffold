/**
 * Tests for logout state management with dependency injection
 */

import { createLogoutState } from '@/lib/utils/logout-state';

describe('Logout State Utils', () => {
  let mockLocalStorage: Storage;
  let mockSessionStorage: Storage;
  let mockConsole: Console;
  let mockLocation: Location;
  let mockDateNow: jest.Mock;

  beforeEach(() => {
    // Mock localStorage
    const localStorageData: Record<string, string> = {};
    mockLocalStorage = {
      getItem: jest.fn((key: string) => localStorageData[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        localStorageData[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete localStorageData[key];
      }),
      clear: jest.fn(() => {
        Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
      }),
      key: jest.fn(),
      length: 0
    };

    // Mock sessionStorage
    const sessionStorageData: Record<string, string> = {};
    mockSessionStorage = {
      getItem: jest.fn((key: string) => sessionStorageData[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        sessionStorageData[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete sessionStorageData[key];
      }),
      clear: jest.fn(() => {
        Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key]);
      }),
      key: jest.fn(),
      length: 0
    };

    // Mock console
    mockConsole = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    } as any;

    // Mock location
    mockLocation = {
      hostname: 'example.com',
      href: 'https://example.com?logout=true',
      origin: 'https://example.com',
      protocol: 'https:',
      host: 'example.com',
      pathname: '/',
      search: '?logout=true',
      hash: ''
    } as Location;

    // Mock Date.now
    mockDateNow = jest.fn().mockReturnValue(1234567890);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLogoutState', () => {
    it('should create logout state utilities with injected dependencies', () => {
      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        console: mockConsole,
        location: mockLocation,
        dateNow: mockDateNow
      });

      expect(logoutState.isManuallyLoggedOut).toBeDefined();
      expect(logoutState.setManuallyLoggedOut).toBeDefined();
      expect(logoutState.clearLogoutState).toBeDefined();
      expect(logoutState.hasLogoutUrlParams).toBeDefined();
    });

    it('should handle missing dependencies gracefully', () => {
      const logoutState = createLogoutState({});
      
      // Should not throw when calling methods without dependencies
      expect(() => logoutState.setManuallyLoggedOut()).not.toThrow();
      expect(() => logoutState.clearLogoutState()).not.toThrow();
      expect(() => logoutState.isManuallyLoggedOut()).not.toThrow();
    });
  });

  describe('setManuallyLoggedOut', () => {
    it('should set manual logout flag with timestamp in both storages', () => {
      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        console: mockConsole,
        dateNow: mockDateNow
      });

      logoutState.setManuallyLoggedOut();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_manually_logged_out', 'true');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('logout_timestamp', '1234567890');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('user_manually_logged_out', 'true');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('logout_timestamp', '1234567890');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('logout_in_progress', 'true');
      expect(mockConsole.log).toHaveBeenCalledWith('[Logout State] Manual logout flag set with redundancy');
    });

    it('should not execute when dependencies are missing', () => {
      const logoutState = createLogoutState({
        console: mockConsole,
        dateNow: mockDateNow
      });

      expect(() => logoutState.setManuallyLoggedOut()).not.toThrow();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe('clearLogoutState', () => {
    it('should clear logout flags from all storage locations', () => {
      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        console: mockConsole
      });

      logoutState.clearLogoutState();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_manually_logged_out');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('logout_timestamp');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('user_manually_logged_out');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('logout_timestamp');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('logout_in_progress');
      expect(mockConsole.log).toHaveBeenCalledWith('[Logout State] Logout flags cleared from all locations');
    });

    it('should not execute when dependencies are missing', () => {
      const logoutState = createLogoutState({
        console: mockConsole
      });

      expect(() => logoutState.clearLogoutState()).not.toThrow();
      expect(mockConsole.log).not.toHaveBeenCalled();
    });
  });

  describe('isManuallyLoggedOut', () => {
    it('should return true when manual logout flag exists and is not expired', () => {
      mockLocalStorage.setItem('user_manually_logged_out', 'true');
      mockLocalStorage.setItem('logout_timestamp', (1234567890 - 1000).toString()); // 1 second ago

      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        dateNow: mockDateNow
      });

      expect(logoutState.isManuallyLoggedOut()).toBe(true);
    });

    it('should return false when manual logout flag is expired', () => {
      mockLocalStorage.setItem('user_manually_logged_out', 'true');
      mockLocalStorage.setItem('logout_timestamp', (1234567890 - 6000).toString()); // 6 seconds ago

      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        dateNow: mockDateNow
      });

      expect(logoutState.isManuallyLoggedOut()).toBe(false);
      // Should also clean up expired state
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_manually_logged_out');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('logout_timestamp');
    });

    it('should return false when manual logout flag does not exist', () => {
      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage
      });

      expect(logoutState.isManuallyLoggedOut()).toBe(false);
    });

    it('should fallback to sessionStorage when localStorage is missing', () => {
      mockSessionStorage.setItem('user_manually_logged_out', 'true');
      mockSessionStorage.setItem('logout_timestamp', (1234567890 - 1000).toString());

      const logoutState = createLogoutState({
        sessionStorage: mockSessionStorage,
        dateNow: mockDateNow
      });

      expect(logoutState.isManuallyLoggedOut()).toBe(true);
    });

    it('should return false when all dependencies are missing', () => {
      const logoutState = createLogoutState({});

      expect(logoutState.isManuallyLoggedOut()).toBe(false);
    });
  });

  describe('hasLogoutUrlParams', () => {
    it('should return true when logged_out parameter exists in URL', () => {
      const logoutLocation = {
        ...mockLocation,
        search: '?logged_out=true',
        href: 'https://example.com?logged_out=true'
      };

      const logoutState = createLogoutState({
        location: logoutLocation
      });

      expect(logoutState.hasLogoutUrlParams()).toBe(true);
    });

    it('should return false when logged_out parameter does not exist', () => {
      const noLogoutLocation = {
        ...mockLocation,
        search: '?other=param',
        href: 'https://example.com?other=param'
      };

      const logoutState = createLogoutState({
        location: noLogoutLocation
      });

      expect(logoutState.hasLogoutUrlParams()).toBe(false);
    });

    it('should return false when location is missing', () => {
      const logoutState = createLogoutState({});

      expect(logoutState.hasLogoutUrlParams()).toBe(false);
    });

    it('should handle various URL parameter formats', () => {
      const testCases = [
        '?logged_out=true',
        '?other=value&logged_out=true',
        '?logged_out=true&other=value'
      ];

      testCases.forEach(search => {
        const testLocation = {
          ...mockLocation,
          search,
          href: `https://example.com${search}`
        };

        const logoutState = createLogoutState({
          location: testLocation
        });

        expect(logoutState.hasLogoutUrlParams()).toBe(true);
      });
    });
  });

  describe('backward compatibility exports', () => {
    it('should provide backward compatible function exports', () => {
      // Import the default exports
      const {
        logoutState
      } = require('@/lib/utils/logout-state');

      expect(typeof logoutState.isManuallyLoggedOut).toBe('function');
      expect(typeof logoutState.setManuallyLoggedOut).toBe('function');
      expect(typeof logoutState.clearLogoutState).toBe('function');
      expect(typeof logoutState.hasLogoutUrlParams).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete logout flow', () => {
      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        console: mockConsole,
        location: mockLocation,
        dateNow: mockDateNow
      });

      // Set manual logout
      logoutState.setManuallyLoggedOut();
      
      expect(logoutState.isManuallyLoggedOut()).toBe(true);
      expect(logoutState.hasLogoutUrlParams()).toBe(false); // URL has logged_out, not logout param

      // Clear logout
      logoutState.clearLogoutState();
      
      expect(logoutState.isManuallyLoggedOut()).toBe(false);
    });

    it('should handle mixed state scenarios', () => {
      // Set logout flag but old timestamp
      const oldTimestamp = 1234567890 - 10000;
      mockLocalStorage.setItem('user_manually_logged_out', 'true');
      mockLocalStorage.setItem('logout_timestamp', oldTimestamp.toString());

      const logoutState = createLogoutState({
        localStorage: mockLocalStorage,
        sessionStorage: mockSessionStorage,
        dateNow: mockDateNow
      });

      // Should be false due to expiry and should clean up
      expect(logoutState.isManuallyLoggedOut()).toBe(false);
    });

    it('should handle URL-based logout detection', () => {
      const logoutLocation = {
        ...mockLocation,
        search: '?logged_out=true',
        href: 'https://example.com?logged_out=true'
      };

      const logoutState = createLogoutState({
        location: logoutLocation
      });

      expect(logoutState.hasLogoutUrlParams()).toBe(true);
    });
  });
});
