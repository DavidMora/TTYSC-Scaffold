import { dataFetcher } from "@/lib/api";
import { getSettings } from "@/lib/services/settings.service";

const SETTINGS_KEY = "settings";

export const useSettings = () => {
  const fetcher = dataFetcher.fetchData(SETTINGS_KEY, getSettings);

  return {
    ...fetcher,
    data: fetcher.data?.data,
  };
};
