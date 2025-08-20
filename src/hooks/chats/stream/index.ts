'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { newChatMessageStream } from '@/lib/services/chats.service';
import type {
  ChatStreamChunk,
  ExecutionMetadata,
  StreamChoiceData,
} from '@/lib/types/chats';

/**
 * Options for the chat streaming hook
 */
export interface UseChatStreamOptions {
  limit?: number; // optional hard limit of chunks to read
  maxBuffer?: number; // retain only the last N chunks in memory
  autoStart?: boolean; // start automatically on mount (not recommended if you need a user action)
  choiceIndex?: number; // which choice (index) to aggregate
  stopOnFinish?: boolean; // stop automatically when finish_reason is received for the main choice
  defaultPayload?: import('@/lib/types/chats').ChatPromptRequest; // optional payload used when calling start() without args
}

export interface ChatStreamStepInfo {
  ts: string; // timestamp as received in the chunk
  step?: string;
  workflow_status?: string | null;
  data?: StreamChoiceData;
}

export interface UseChatStreamResult {
  chunks: ChatStreamChunk[]; // raw received chunks (capped by maxBuffer)
  isStreaming: boolean;
  error: string | null;
  start: (
    payloadOverride?: import('@/lib/types/chats').ChatPromptRequest
  ) => void; // begin streaming with provided payload
  stop: () => void;
  reset: () => void;
  aggregatedContent: string; // assembled assistant content for the selected choice
  finishReason: string | null; // finish reason for selected choice (once available)
  metadata: ExecutionMetadata | null; // execution metadata delivered in the final chunk
  steps: ChatStreamStepInfo[]; // ordered progression of workflow steps
  lastChunk: ChatStreamChunk | null; // most recent chunk
}

/**
 * useChatStream establishes a streaming connection to the chat backend and
 * incrementally aggregates the content for a given choice index (default 0).
 * It is resilient to chunks that repeat the full content vs only sending deltas.
 */
export function useChatStream(
  options: UseChatStreamOptions = {}
): UseChatStreamResult {
  const {
    limit,
    maxBuffer = 200,
    autoStart = false,
    choiceIndex = 0,
    stopOnFinish = true,
    defaultPayload,
  } = options;

  const [chunks, setChunks] = useState<ChatStreamChunk[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishReason, setFinishReason] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ExecutionMetadata | null>(null);
  const [steps, setSteps] = useState<ChatStreamStepInfo[]>([]);
  const [lastChunk, setLastChunk] = useState<ChatStreamChunk | null>(null);

  // Internal mutable refs
  const abortRef = useRef<AbortController | null>(null);
  const runningRef = useRef(false);
  const contentMapRef = useRef<Record<number, string>>({}); // aggregated per choice
  const latestMetadataRef = useRef<ExecutionMetadata | null>(null);

  const aggregatedContent = contentMapRef.current[choiceIndex] || '';

  const stop = useCallback(() => {
    if (abortRef.current && !abortRef.current.signal.aborted) {
      abortRef.current.abort();
    }
    abortRef.current = null;
    runningRef.current = false;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setChunks([]);
    setError(null);
    setFinishReason(null);
    setMetadata(null);
    setSteps([]);
    setLastChunk(null);
    contentMapRef.current = {};
    latestMetadataRef.current = null;
  }, []);

  const mergeMessageContent = useCallback((idx: number, msgContent: string) => {
    if (!msgContent) return;
    const prevContent = contentMapRef.current[idx] || '';
    if (msgContent.startsWith(prevContent)) {
      contentMapRef.current[idx] = msgContent; // snapshot mode
    } else if (!prevContent.includes(msgContent)) {
      contentMapRef.current[idx] = prevContent + msgContent; // delta append
    } else if (!prevContent.endsWith(msgContent)) {
      contentMapRef.current[idx] = prevContent + msgContent;
    }
  }, []);

  const pushStep = useCallback(
    (chunk: ChatStreamChunk, choice: ChatStreamChunk['choices'][number]) => {
      if (choice.step || choice.workflow_status) {
        setSteps((prev) => [
          ...prev,
          {
            ts: chunk.created,
            step: choice.step,
            workflow_status: choice.workflow_status,
            data: choice.data,
          },
        ]);
      }
    },
    []
  );

  const captureFinals = useCallback(
    (choice: ChatStreamChunk['choices'][number], targetIdx: number) => {
      if (choice.index !== targetIdx) return;
      if (choice.finish_reason)
        setFinishReason((prev) => prev || choice.finish_reason);
      if (choice.execution_metadata) {
        setMetadata((prev) => {
          const next = choice.execution_metadata as ExecutionMetadata;
          let merged: ExecutionMetadata;
          if (prev) {
            merged = {
              ...prev,
              ...next,
              execution_plan: {
                ...(prev.execution_plan ||
                  ({} as ExecutionMetadata['execution_plan'])),
                ...(next.execution_plan ||
                  ({} as ExecutionMetadata['execution_plan'])),
              },
              entity_validation: {
                ...(prev.entity_validation || { valid: [], inferred: {} }),
                ...(next.entity_validation || { valid: [], inferred: {} }),
              },
              query_results: {
                ...(prev.query_results || {
                  dataframe_records: [],
                  success: false,
                  truncated: false,
                  limited_to: -1,
                }),
                ...(next.query_results || {
                  dataframe_records: [],
                  success: false,
                  truncated: false,
                  limited_to: -1,
                }),
              },
            } as ExecutionMetadata;
          } else {
            merged = next;
          }
          latestMetadataRef.current = merged ?? null;
          return merged;
        });
      }
    },
    []
  );

  const processChunk = useCallback(
    (chunk: ChatStreamChunk) => {
      setLastChunk(chunk);
      setChunks((prev) => {
        const next = [...prev, chunk];
        if (next.length > maxBuffer) next.splice(0, next.length - maxBuffer);
        return next;
      });
      for (const choice of chunk.choices || []) {
        mergeMessageContent(choice.index, choice.message?.content ?? '');
        pushStep(chunk, choice);
        captureFinals(choice, choiceIndex);
      }
    },
    [choiceIndex, maxBuffer, mergeMessageContent, pushStep, captureFinals]
  );

  const start = useCallback(
    (payloadOverride?: import('@/lib/types/chats').ChatPromptRequest) => {
      const payload = payloadOverride || defaultPayload;
      if (!payload) {
        setError('Missing payload for chat stream');
        return;
      }
      if (runningRef.current) return;
      setError(null);
      setFinishReason(null);
      runningRef.current = true;
      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      (async () => {
        try {
          const stream = await newChatMessageStream(payload, {
            limit,
            abortSignal: controller.signal,
          });

          for await (const chunk of stream) {
            if (controller.signal.aborted) break;
            processChunk(chunk);
            // Only evaluate finish inside the loop AFTER processing current chunk
            if (stopOnFinish) {
              const choice = chunk.choices.find(
                (c) => c.index === choiceIndex && c.finish_reason
              );
              if (choice?.finish_reason) {
                const m = latestMetadataRef.current;
                const hasCharts = Boolean(
                  m && (m.generated_chart || m.chart_type || m.chart_label)
                );
                if (hasCharts) break;
              }
            }
          }
        } catch (e) {
          if (!(e instanceof DOMException && e.name === 'AbortError')) {
            setError(e instanceof Error ? e.message : 'Unknown stream error');
          }
        } finally {
          stop();
        }
      })();
    },
    [choiceIndex, defaultPayload, limit, processChunk, stop, stopOnFinish]
  );

  // (Re)start automatically when dependencies change if autoStart enabled
  useEffect(() => {
    if (autoStart && defaultPayload) {
      start(defaultPayload);
    }
  }, [autoStart, defaultPayload, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    chunks,
    isStreaming,
    error,
    start,
    stop,
    reset,
    aggregatedContent,
    finishReason,
    metadata,
    steps,
    lastChunk,
  };
}
