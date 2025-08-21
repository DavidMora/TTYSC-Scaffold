import { apiClient } from '@/lib/api'; // apiClient targets FRONTEND_BASE_URL (BFF)
import { HttpClientResponse } from '@/lib/types/api/http-client';
import { BFF_SETTINGS } from '@/lib/constants/api/bff-routes';
import {
  SettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from '@/lib/types/settings';

export const getSettings = async (): Promise<
  HttpClientResponse<SettingsResponse>
> => {
  return await apiClient.get<SettingsResponse>(BFF_SETTINGS);
};

export const updateSettings = async (
  settings: UpdateSettingsRequest
): Promise<HttpClientResponse<UpdateSettingsResponse>> => {
  return await apiClient.patch<UpdateSettingsResponse>(BFF_SETTINGS, settings);
};
