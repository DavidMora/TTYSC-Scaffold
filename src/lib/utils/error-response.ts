export function errorResponse(e: unknown, status = 500) {
  let message: string;
  if (e instanceof Error) {
    message = e.message;
  } else if (typeof e === 'string') {
    message = e;
  } else {
    message = 'Internal error';
  }
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
