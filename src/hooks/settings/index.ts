import { dataFetcher } from '@/lib/api';
import { getSettings } from '@/lib/services/settings.service';
import { SETTINGS_KEY } from '@/lib/constants/cache-keys';

export const useSettings = () => {
  const fetcher = dataFetcher.fetchData(SETTINGS_KEY, getSettings);

  return {
    ...fetcher,
    data: fetcher.data?.data,
  };
};
