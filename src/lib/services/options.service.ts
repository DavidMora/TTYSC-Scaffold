import { httpClient } from "@/lib/api";
import { TABLES } from "@/lib/constants/api/routes";

export const getTableOptions = () => {
  return httpClient.get(TABLES);
};
