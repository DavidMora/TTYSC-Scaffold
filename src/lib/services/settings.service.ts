import { apiClient } from '@/lib/api';
import { HttpClientResponse } from '@/lib/types/api/http-client';
import { SETTINGS } from '@/lib/constants/api/routes';
import {
  SettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from '@/lib/types/settings';

export const getSettings = async (): Promise<
  HttpClientResponse<SettingsResponse>
> => {
  return await apiClient.get<SettingsResponse>(SETTINGS);
};

export const updateSettings = async (
  settings: UpdateSettingsRequest
): Promise<HttpClientResponse<UpdateSettingsResponse>> => {
  return await apiClient.patch<UpdateSettingsResponse>(SETTINGS, settings);
};
