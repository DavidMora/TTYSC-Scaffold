import { httpClient, HttpClientResponse } from '@/lib/api';
import { TABLES } from '@/lib/constants/api/routes';
import { OptionsTablesResponse } from '@/lib/types/options';

export const getTableOptions = (): Promise<
  HttpClientResponse<OptionsTablesResponse>
> => {
  return httpClient.get<OptionsTablesResponse>(TABLES);
};
