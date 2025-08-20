export function errorResponse(e: unknown, status = 500) {
  const message = e instanceof Error ? e.message : 'Internal error';
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}


