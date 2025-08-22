import type { BaseResponse } from '@/lib/types/http/responses';
import type { AIChartData } from '@/lib/types/charts';
import { FilterState } from '../analysisFilters';
import type { TableData } from '@/lib/types/datatable';

export type VoteType = 'up' | 'down' | null;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  title?: string;
  content: string;
  chart?: AIChartData;
  created: string;
  feedbackVote?: VoteType;
  table?: TableData;
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
    role: 'user' | 'assistant';
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
      role: 'user' | 'assistant';
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

// Streamed chat (LLM) response types
// Note: during streaming some chunks may arrive with empty "choices" or with an empty "message.content".
// Modeled as an ordered array of chunks (similar to OpenAI style aggregation) with metadata variants.

// Individual data payload shapes observed inside the "data" field for different steps.
export interface StreamDataEntitiesFound {
  entities_found: number;
}
export interface StreamDataEntityValidation {
  valid_entities?: number; // backward compatibility if the key changes
  valid?: number; // example shows "valid_entities" and also lists them inside execution_metadata
  inferred_entities?: number;
  inferred?: number;
}
export interface StreamDataSourceSelected {
  selected: string; // e.g. "databricks_odp"
}
export interface StreamDataRefinement {
  refinement_applied: boolean;
}
export interface StreamDataSQLGenerated {
  query_generated: string;
}
export interface StreamDataQueryExecution {
  dataframe_records: Array<Record<string, unknown>>; // returned rows (may repeat or be truncated)
  success: boolean;
  limited_to: number; // -1 when no limit
  truncated: boolean;
}

export type StreamChoiceData =
  | StreamDataEntitiesFound
  | StreamDataEntityValidation
  | StreamDataSourceSelected
  | StreamDataRefinement
  | StreamDataSQLGenerated
  | StreamDataQueryExecution
  | Record<string, unknown>; // future-proof fallback

// Structured metadata that appears only in the final chunk ("execution_metadata").
export interface ExecutionMetadata {
  original_query: string;
  final_query: string;
  execution_plan: {
    complexity: string;
    entities_referenced: Record<
      string,
      {
        matched_text: string;
        match_type: string;
        field_name: string;
      }
    >;
    data_sources_needed: string[];
    reasoning: string;
    steps: string[];
    parallel_steps: string[];
  };
  selected_data_source: string;
  entity_validation: {
    valid: string[];
    inferred: Record<string, unknown>;
  };
  generated_sql: string;
  query_results: Omit<StreamDataQueryExecution, 'dataframe_records'> & {
    dataframe_records: Array<Record<string, unknown>>;
    columns: string[];
  };
  // Optional visualization payload (may be provided by a later chunk)
  chart_type?: string | null;
  chart_label?: string | null;
  generated_chart?: {
    Series: Array<{
      name: string;
      data: Array<{ x: string | number; y: number }>;
    }>;
    XAxisKey: string;
    YAxisKey: string;
  } | null;
  chartgen_error?: string | null;
  // Optional follow-up suggestions
  followup_questions?: string[];
  followup_metadata?: {
    original_question: string;
    num_questions: number;
  };
  followup_error?: string | null;
  completed_steps: string[];
  error: string | null;
}

export interface ChatStreamChoice {
  index: number;
  // May be null while the stream is ongoing
  finish_reason: string | null;
  // Content may be missing or empty in incremental chunks
  message?: {
    content: string; // may be empty string
    role: 'user' | 'assistant' | null; // null during intermediate workflow steps
    title?: string;
  };
  // Workflow-specific fields
  workflow_status?: string; // known values: 'started','in_progress','completed'
  step?: string; // step description (e.g. "Planning completed")
  query?: string; // original natural language query (first chunk)
  data?: StreamChoiceData; // variable payload depending on the step
  execution_metadata?: ExecutionMetadata; // only present upon completion
}

export interface ChatStreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  model: string;
  created: string; // ISO timestamp
  // A chunk may arrive with no useful choices (empty array) if the backend emits heartbeats
  choices: ChatStreamChoice[];
}

// Complete streaming response: ordered collection of chunks.
export type ChatStreamResponse = ChatStreamChunk[];

// Generic prompt request payload for initiating a model completion (non-streaming)
// Matches the expected POST body structure provided by backend.
export interface ChatPromptRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
}
