import { httpClient, HttpClientResponse } from '@/lib/api';
import { BFF_TABLES } from '@/lib/constants/api/bff-routes';
import { OptionsTablesResponse } from '@/lib/types/options';

export const getTableOptions = (): Promise<
  HttpClientResponse<OptionsTablesResponse>
> => {
  return httpClient.get<OptionsTablesResponse>(BFF_TABLES);
};
