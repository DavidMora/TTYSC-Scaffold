import { getSettings, updateSettings } from '@/lib/services/settings.service';
import { httpClient } from '@/lib/api';
import { BFF_SETTINGS } from '@/lib/constants/api/bff-routes';

jest.mock('@/lib/api', () => ({
  httpClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('settings.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getSettings calls httpClient.get with correct route', async () => {
    const mockResponse = { data: { shareChats: false, hideIndexTable: false } };
    (httpClient.get as jest.Mock).mockResolvedValue(mockResponse);
    const result = await getSettings();
    expect(httpClient.get).toHaveBeenCalledWith(BFF_SETTINGS);
    expect(result).toBe(mockResponse);
  });

  it('updateSettings calls httpClient.patch with correct route and payload', async () => {
    const settingsPayload = { shareChats: true };
    const mockResponse = { data: { success: true } };
    (httpClient.patch as jest.Mock).mockResolvedValue(mockResponse);
    const result = await updateSettings(settingsPayload);
    expect(httpClient.patch).toHaveBeenCalledWith(BFF_SETTINGS, settingsPayload);
    expect(result).toBe(mockResponse);
  });

  it('getSettings handles API errors', async () => {
    const mockError = new Error('API Error');
    (httpClient.get as jest.Mock).mockRejectedValue(mockError);
    await expect(getSettings()).rejects.toThrow('API Error');
  });

  it('updateSettings handles API errors', async () => {
    const mockError = new Error('Update failed');
    (httpClient.patch as jest.Mock).mockRejectedValue(mockError);
    await expect(updateSettings({ shareChats: true })).rejects.toThrow(
      'Update failed'
    );
  });
});
