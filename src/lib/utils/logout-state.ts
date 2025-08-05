/**
 * Utility functions for managing logout state across the application
 */

const LOGOUT_FLAG_KEY = 'user_manually_logged_out';
const LOGOUT_TIMESTAMP_KEY = 'logout_timestamp';
const LOGOUT_EXPIRY_TIME = 5000; // 5 seconds in milliseconds for testing

// Interface for dependency injection
interface LogoutStateOptions {
  location?: Location;
  localStorage?: Storage;
  sessionStorage?: Storage;
  console?: Console;
  dateNow?: () => number;
}

// Create logout state utilities with dependency injection
export function createLogoutState(options: LogoutStateOptions = {}) {
  // If no options are provided at all, use environment defaults
  const hasAnyOptions = Object.keys(options).length > 0;
  
  // Extract location with simplified logic
  let location: Location | null = null;
  if ('location' in options) {
    location = options.location || null;
  } else if (typeof window !== 'undefined') {
    location = window.location;
  }
  
  // Extract localStorage with simplified logic
  let storage: Storage | null = null;
  if ('localStorage' in options) {
    storage = options.localStorage || null;
  } else if (!hasAnyOptions && typeof window !== 'undefined') {
    storage = window.localStorage;
  }
  
  // Extract sessionStorage with simplified logic
  let sessionStore: Storage | null = null;
  if ('sessionStorage' in options) {
    sessionStore = options.sessionStorage || null;
  } else if (!hasAnyOptions && typeof window !== 'undefined') {
    sessionStore = window.sessionStorage;
  }
  const logger = 'console' in options ? options.console : console;
  const dateNow = 'dateNow' in options ? options.dateNow : (() => Date.now());

  const utils = {
    /**
     * Check if user has manually logged out recently (with multiple sources)
     */
    isManuallyLoggedOut(): boolean {
      if (!storage && !sessionStore) return false;
      
      // Check localStorage first (if available)
      const localFlag = storage?.getItem(LOGOUT_FLAG_KEY);
      const localTimestamp = storage?.getItem(LOGOUT_TIMESTAMP_KEY);
      
      // Check sessionStorage as backup (if available)
      const sessionFlag = sessionStore?.getItem(LOGOUT_FLAG_KEY);
      const logoutInProgress = sessionStore?.getItem('logout_in_progress');
      
      // If logout is in progress, always return true
      if (logoutInProgress === 'true') {
        return true;
      }
      
      // Check either storage location
      const flag = localFlag || sessionFlag;
      const timestamp = localTimestamp || sessionStore?.getItem(LOGOUT_TIMESTAMP_KEY);
      
      if (flag === 'true') {
        // Check if logout is still within expiry time
        if (timestamp && dateNow) {
          const logoutTime = parseInt(timestamp);
          const isExpired = dateNow() - logoutTime > LOGOUT_EXPIRY_TIME;
          
          if (isExpired) {
            // Clean up expired logout state
            utils.clearLogoutState();
            return false;
          }
        }
        return true;
      }
      
      return false;
    },

    /**
     * Set the manual logout flag with redundancy
     */
    setManuallyLoggedOut(): void {
      if (!storage && !sessionStore) return;
      
      if (!dateNow) return;
      
      const timestamp = dateNow().toString();
      
      // Set in localStorage if available
      if (storage) {
        storage.setItem(LOGOUT_FLAG_KEY, 'true');
        storage.setItem(LOGOUT_TIMESTAMP_KEY, timestamp);
      }
      
      // Set in sessionStorage if available
      if (sessionStore) {
        sessionStore.setItem(LOGOUT_FLAG_KEY, 'true');
        sessionStore.setItem(LOGOUT_TIMESTAMP_KEY, timestamp);
        // Set a flag to indicate logout is in progress
        sessionStore.setItem('logout_in_progress', 'true');
      }
      
      if (logger) {
        logger.log('[Logout State] Manual logout flag set with redundancy');
      }
    },

    /**
     * Clear the logout state from all locations
     */
    clearLogoutState(): void {
      if (!storage && !sessionStore) return;
      
      // Clear from localStorage if available
      if (storage) {
        storage.removeItem(LOGOUT_FLAG_KEY);
        storage.removeItem(LOGOUT_TIMESTAMP_KEY);
      }
      
      // Clear from sessionStorage if available
      if (sessionStore) {
        sessionStore.removeItem(LOGOUT_FLAG_KEY);
        sessionStore.removeItem(LOGOUT_TIMESTAMP_KEY);
        sessionStore.removeItem('logout_in_progress');
      }
      
      if (logger) {
        logger.log('[Logout State] Logout flags cleared from all locations');
      }
    },

    /**
     * Check if current URL indicates recent logout
     */
    hasLogoutUrlParams(): boolean {
      if (!location) return false;
      
      const urlParams = new URLSearchParams(location.search);
      return urlParams.get('logged_out') === 'true';
    }
  };

  return utils;
}

// Default instance for backward compatibility
export const logoutState = createLogoutState();