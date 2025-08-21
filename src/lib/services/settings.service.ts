import { httpClient } from '@/lib/api';
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
  return await httpClient.get<SettingsResponse>(BFF_SETTINGS);
};

export const updateSettings = async (
  settings: UpdateSettingsRequest
): Promise<HttpClientResponse<UpdateSettingsResponse>> => {
  return await httpClient.patch<UpdateSettingsResponse>(BFF_SETTINGS, settings);
};
