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
    const next: Settings = { ...this.settings };

    if (Object.prototype.hasOwnProperty.call(updates, 'shareChats')) {
      const v = updates.shareChats;
      if (typeof v !== 'boolean')
        throw new TypeError('shareChats must be a boolean');
      next.shareChats = v;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'hideIndexTable')) {
      const v = updates.hideIndexTable;
      if (typeof v !== 'boolean')
        throw new TypeError('hideIndexTable must be a boolean');
      next.hideIndexTable = v;
    }

    this.settings = next;
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
