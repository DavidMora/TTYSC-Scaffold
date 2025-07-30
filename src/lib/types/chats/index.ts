import type { BaseResponse } from "@/lib/types/http/responses";
import { FilterState } from "../analysisFilters";

export type VoteType = "up" | "down" | null;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  title?: string;
  content: string;
  created: string;
  feedbackVote?: VoteType;
}

export interface Chat {
  id: string;
  date: string;
  title: string;
  draft?: string;
  messages: ChatMessage[];
  metadata?: Partial<FilterState>;
}

export type ChatsResponse = BaseResponse<Chat[]>;

export type ChatResponse = BaseResponse<Chat>;

// Create payloads
export interface CreateChatRequest {
  title: string;
}
export type UpdateChatRequest = Partial<Chat> & { id: string };

export interface CreateChatMessageRequest {
  chatId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  use_knowledge_base: boolean;
}

export interface BotResponse {
  id: string;
  object: string;
  model: string;
  created: string;
  choices: Array<{
    message: {
      content: string;
      role: "user" | "assistant";
      title?: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
