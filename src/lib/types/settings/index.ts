import type { BaseResponse } from "@/lib/types/http/responses";

export interface Settings {
  shareChats: boolean;
  hideIndexTable: boolean;
}

// Create payloads
export type UpdateSettingsRequest = Partial<Settings>;

// Response types
export type SettingsResponse = BaseResponse<Settings>;
export type UpdateSettingsResponse = BaseResponse<Settings>;
