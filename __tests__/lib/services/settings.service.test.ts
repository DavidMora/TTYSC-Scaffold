import { getSettings, updateSettings } from '@/lib/services/settings.service';
import { apiClient } from '@/lib/api';
import { BFF_SETTINGS } from '@/lib/constants/api/bff-routes';

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('settings.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getSettings calls apiClient.get with correct route', async () => {
    const mockResponse = { data: { shareChats: false, hideIndexTable: false } };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);
    const result = await getSettings();
    expect(apiClient.get).toHaveBeenCalledWith(BFF_SETTINGS);
    expect(result).toBe(mockResponse);
  });

  it('updateSettings calls apiClient.patch with correct route and payload', async () => {
    const settingsPayload = { shareChats: true };
    const mockResponse = { data: { success: true } };
    (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);
    const result = await updateSettings(settingsPayload);
    expect(apiClient.patch).toHaveBeenCalledWith(BFF_SETTINGS, settingsPayload);
    expect(result).toBe(mockResponse);
  });

  it('getSettings handles API errors', async () => {
    const mockError = new Error('API Error');
    (apiClient.get as jest.Mock).mockRejectedValue(mockError);
    await expect(getSettings()).rejects.toThrow('API Error');
  });

  it('updateSettings handles API errors', async () => {
    const mockError = new Error('Update failed');
    (apiClient.patch as jest.Mock).mockRejectedValue(mockError);
    await expect(updateSettings({ shareChats: true })).rejects.toThrow(
      'Update failed'
    );
  });
});
