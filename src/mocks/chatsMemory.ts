import { v4 as uuidv4 } from 'uuid';
import { Chat, CreateChatRequest, UpdateChatRequest } from '@/lib/types/chats';

class ChatsMemoryStore {
  private readonly chats = new Map<string, Chat>();

  list(): Chat[] {
    return Array.from(this.chats.values());
  }

  get(id: string): Chat | null {
    return this.chats.get(id) || null;
  }

  create(payload: CreateChatRequest): Chat {
    const id = uuidv4();
    const now = new Date().toISOString();
    const chat: Chat = {
      id,
      date: now,
      title: payload.title || 'Untitled',
      draft: '',
      messages: [],
      metadata: {},
    };
    this.chats.set(id, chat);
    return chat;
  }

  update(payload: UpdateChatRequest): Chat | null {
    const existing = this.chats.get(payload.id);
    if (!existing) return null;
    const updated: Chat = { ...existing, ...payload, id: existing.id };
    this.chats.set(existing.id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.chats.delete(id);
  }
}

export const chatsMemory = new ChatsMemoryStore();
