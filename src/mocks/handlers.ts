import { http, HttpResponse } from 'msw';
import { chatsMemory } from '@/mocks/chatsMemory';
import { settingsMemory } from '@/mocks/settingsMemory';
import type { Settings } from '@/lib/types/settings';

export const handlers = [
  // List chats
  http.get('/api/chats', () => {
    const body = chatsMemory.list();
    return HttpResponse.json(body, { status: 200 });
  }),

  // Create chat
  http.post('/api/chats', async ({ request }) => {
    try {
      const json = (await request.json()) as { title?: string };
      const created = chatsMemory.create({ title: json?.title || 'Untitled' });
      return HttpResponse.json(created, { status: 201 });
    } catch {
      const created = chatsMemory.create({ title: 'Untitled' });
      return HttpResponse.json(created, { status: 201 });
    }
  }),

  // Get chat by id
  http.get('/api/chats/:id', ({ params }) => {
    const id = String(params.id);
    const found = chatsMemory.get(id);
    if (!found)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json({ success: true, data: found }, { status: 200 });
  }),

  // Update chat
  http.patch('/api/chats/:id', async ({ params, request }) => {
    const id = String(params.id);
    let body: Record<string, unknown> | undefined;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = undefined;
    }
    const updated = chatsMemory.update({ ...(body || {}), id });
    if (!updated)
      return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
    return HttpResponse.json(updated, { status: 200 });
  }),

  // Delete chat
  http.delete('/api/chats/:id', ({ params }) => {
    const id = String(params.id);
    const removed = chatsMemory.delete(id);
    return new HttpResponse(null, { status: removed ? 204 : 404 });
  }),

  // Get settings
  http.get('/api/settings', () => {
    const settings = settingsMemory.get();
    return HttpResponse.json(
      { success: true, data: settings },
      { status: 200 }
    );
  }),

  // Update settings
  http.patch('/api/settings', async ({ request }) => {
    try {
      const body = await request.json();
      const updatedSettings = settingsMemory.update(body as Partial<Settings>);

      return HttpResponse.json(
        { success: true, data: updatedSettings },
        { status: 200 }
      );
    } catch {
      return HttpResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }),
];
