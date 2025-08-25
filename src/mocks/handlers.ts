import { http, HttpResponse } from 'msw';
import { chatsMemory } from '@/mocks/chatsMemory';
import { settingsMemory } from '@/mocks/settingsMemory';
import type { Settings } from '@/lib/types/settings';

export const handlers = [
  // List chats
  http.get('/api/chats', () => {
    const body = chatsMemory.list();
    return HttpResponse.json({ success: true, data: body }, { status: 200 });
  }),

  // Create chat
  http.post('/api/chats', async ({ request }) => {
    try {
      const json = (await request.json()) as { title?: string };
      const created = chatsMemory.create({ title: json?.title || 'Untitled' });
      return HttpResponse.json(
        { success: true, data: created },
        {
          status: 201,
          headers: { Location: `/api/chats/${created.id}` },
        }
      );
    } catch {
      return HttpResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
  }),

  // Get chat by id
  http.get('/api/chats/:id', ({ params }) => {
    const id = String(params.id);
    const found = chatsMemory.get(id);
    if (!found)
      return HttpResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    return HttpResponse.json({ success: true, data: found }, { status: 200 });
  }),

  // Update chat
  http.patch('/api/chats/:id', async ({ params, request }) => {
    const id = String(params.id);
    // Parse raw JSON
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return HttpResponse.json(
        { success: false, error: 'Invalid request body: expected JSON object' },
        { status: 400 }
      );
    }
    // Must be an object (not null/array)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return HttpResponse.json(
        { success: false, error: 'Invalid request body: expected JSON object' },
        { status: 400 }
      );
    }
    const body = raw as Record<string, unknown>;
    // Whitelist updatable fields (only title)
    const updates: { title?: string } = {};
    if ('title' in body) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return HttpResponse.json(
          { success: false, error: 'title must be a non-empty string' },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }
    if (Object.keys(updates).length === 0) {
      return HttpResponse.json(
        { success: false, error: 'No valid fields provided (allowed: title)' },
        { status: 400 }
      );
    }
    const updated = chatsMemory.update({ id, ...updates });
    if (!updated)
      return HttpResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    // Mock backend should mirror real BFF: return the raw Chat, not an envelope
    return HttpResponse.json(updated, { status: 200 });
  }),

  // Delete chat
  http.delete('/api/chats/:id', ({ params }) => {
    const id = String(params.id);
    const removed = chatsMemory.delete(id);
    if (!removed) {
      return HttpResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    }
    return new HttpResponse(null, { status: 204 });
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

      // Basic shape check
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Invalid request body: expected JSON object',
          },
          { status: 400 }
        );
      }

      const updates: Partial<Settings> = {};
      const bodyRecord = body as Record<string, unknown>;

      // Collect valid updates
      if ('shareChats' in bodyRecord) {
        if (typeof bodyRecord.shareChats !== 'boolean') {
          return HttpResponse.json(
            { success: false, error: 'shareChats must be a boolean' },
            { status: 400 }
          );
        }
        updates.shareChats = bodyRecord.shareChats;
      }
      if ('hideIndexTable' in bodyRecord) {
        if (typeof bodyRecord.hideIndexTable !== 'boolean') {
          return HttpResponse.json(
            { success: false, error: 'hideIndexTable must be a boolean' },
            { status: 400 }
          );
        }
        updates.hideIndexTable = bodyRecord.hideIndexTable;
      }

      if (Object.keys(updates).length === 0) {
        return HttpResponse.json(
          { success: false, error: 'No valid settings fields provided' },
          { status: 400 }
        );
      }

      const updatedSettings = settingsMemory.update(updates);

      return HttpResponse.json(
        { success: true, data: updatedSettings },
        { status: 200 }
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid request body';
      return HttpResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }
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

      // Basic shape check
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Invalid request body: expected JSON object',
          },
          { status: 400 }
        );
      }

      // Enforce allowed keys and boolean types
      const updates: Partial<Settings> = {};
      const bodyRecord = body as Record<string, unknown>;

      if ('shareChats' in bodyRecord) {
        if (typeof bodyRecord.shareChats !== 'boolean') {
          return HttpResponse.json(
            { success: false, error: 'shareChats must be a boolean' },
            { status: 400 }
          );
        }
        updates.shareChats = bodyRecord.shareChats;
      }
      if ('hideIndexTable' in bodyRecord) {
        if (typeof bodyRecord.hideIndexTable !== 'boolean') {
          return HttpResponse.json(
            { success: false, error: 'hideIndexTable must be a boolean' },
            { status: 400 }
          );
        }
        updates.hideIndexTable = bodyRecord.hideIndexTable;
      }

      if (Object.keys(updates).length === 0) {
        return HttpResponse.json(
          { success: false, error: 'No valid settings fields provided' },
          { status: 400 }
        );
      }

      const updatedSettings = settingsMemory.update(updates);

      return HttpResponse.json(
        { success: true, data: updatedSettings },
        { status: 200 }
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid request body';
      return HttpResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }
  }),
];
