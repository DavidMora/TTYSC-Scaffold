import type { BaseResponse } from '@/lib/types/http/responses';

export interface OptionTable {
  id: string;
  name: string;
  shareChats: boolean;
  hideIndex: boolean;
}

export type OptionsTablesResponse = BaseResponse<OptionTable[]>;

export type OptionTableResponse = BaseResponse<OptionTable>;
