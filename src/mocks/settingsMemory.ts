import type { Settings } from '@/lib/types/settings';

// Initial default settings
const DEFAULT_SETTINGS: Settings = {
  shareChats: true,
  hideIndexTable: false,
};

class SettingsMemory {
  private settings: Settings;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Get current settings
   */
  get(): Settings {
    return { ...this.settings };
  }

  /**
   * Update settings with partial updates
   */
  update(updates: Partial<Settings>): Settings {
    this.settings = { ...this.settings, ...updates };
    return this.get();
  }

  /**
   * Reset settings to default values
   */
  reset(): Settings {
    this.settings = { ...DEFAULT_SETTINGS };
    return this.get();
  }
}

// Export singleton instance
export const settingsMemory = new SettingsMemory();
