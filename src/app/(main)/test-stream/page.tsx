'use client';

import React, { useCallback, useState } from 'react';
import { useChatStream } from '@/hooks/chats/stream';
import type { ChatPromptRequest } from '@/lib/types/chats';

// Simple demo page to exercise the streaming hook manually.
export default function TestStreamPage() {
  const [prompt, setPrompt] = useState(
    'Hola, genera un resumen de la cadena de suministro.'
  );
  const [model, setModel] = useState('supply_chain_workflow');
  const {
    start,
    stop,
    reset,
    isStreaming,
    aggregatedContent,
    steps,
    finishReason,
    metadata,
    error,
    chunks,
  } = useChatStream({ stopOnFinish: true });

  const handleSend = useCallback(() => {
    if (!prompt.trim()) return;
    // Opcional: reiniciar para un nuevo ciclo
    reset();
    const payload: ChatPromptRequest = {
      messages: [
        {
          role: 'user',
          content: prompt.trim(),
        },
      ],
      model,
      temperature: 0,
      max_tokens: 0,
      top_p: 0,
    };
    start(payload);
  }, [model, prompt, reset, start]);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Test Chat Stream</h1>
      <section className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="model">
            Modelo
          </label>
          <input
            id="model"
            className="border rounded px-3 py-2 text-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="model"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="prompt">
            Prompt
          </label>
          <textarea
            id="prompt"
            className="border rounded px-3 py-2 text-sm min-h-[120px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Escribe tu mensaje..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={isStreaming || !prompt.trim()}
            className="bg-blue-600 disabled:bg-blue-300 text-white text-sm px-4 py-2 rounded"
          >
            {isStreaming ? 'Transmitiendo...' : 'Enviar'}
          </button>
          <button
            onClick={stop}
            disabled={!isStreaming}
            className="bg-yellow-600 disabled:bg-yellow-300 text-white text-sm px-4 py-2 rounded"
          >
            Detener
          </button>
          <button
            onClick={() => {
              stop();
              reset();
            }}
            className="bg-gray-600 text-white text-sm px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
        <div className="text-sm space-x-4">
          {(() => {
            let stateLabel = 'Idle';
            if (isStreaming) stateLabel = 'Streaming';
            else if (finishReason) stateLabel = 'Finalizado';
            return <span>Estado: {stateLabel}</span>;
          })()}
          {finishReason && (
            <span className="text-green-600">
              finish_reason: {finishReason}
            </span>
          )}
          {error && <span className="text-red-600">Error: {error}</span>}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Contenido agregado</h2>
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm max-h-80 overflow-auto">
          {aggregatedContent || '(sin contenido todavía)'}
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Pasos / Workflow</h2>
        {steps.length === 0 && (
          <p className="text-sm text-gray-500">(sin pasos)</p>
        )}
        <ol className="list-decimal ml-5 space-y-1 text-sm">
          {steps.map((s) => {
            const key = `${s.ts}-${s.step || 'step'}`;
            return (
              <li key={key} className="break-words">
                <span className="font-medium">{s.step || '(step)'}</span>
                {s.workflow_status && (
                  <span className="ml-2 text-xs text-gray-500">
                    [{s.workflow_status}]
                  </span>
                )}
                {s.data && (
                  <details className="mt-1 ml-2">
                    <summary className="cursor-pointer text-xs text-blue-700">
                      data
                    </summary>
                    <pre className="text-xs bg-white border p-2 rounded max-h-48 overflow-auto">
                      {JSON.stringify(s.data, null, 2)}
                    </pre>
                  </details>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Metadata final</h2>
        {!metadata && (
          <p className="text-sm text-gray-500">(no disponible aún)</p>
        )}
        {metadata && (
          <pre className="text-xs bg-gray-100 p-4 rounded max-h-72 overflow-auto">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Últimos chunks (debug)</h2>
        {chunks.length === 0 && (
          <p className="text-sm text-gray-500">(sin chunks)</p>
        )}
        {chunks.length > 0 && (
          <details open className="bg-gray-50 border rounded p-2">
            <summary className="cursor-pointer text-sm">
              Ver chunks ({chunks.length})
            </summary>
            <div className="space-y-2 mt-2 max-h-96 overflow-auto text-xs">
              {chunks.slice(-20).map((c) => (
                <pre
                  key={c.id + c.created}
                  className="bg-white p-2 border rounded"
                >
                  {JSON.stringify(c, null, 2)}
                </pre>
              ))}
            </div>
          </details>
        )}
      </section>
    </div>
  );
}
