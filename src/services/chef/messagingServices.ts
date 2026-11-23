import { api } from '../../config/api';
import type { ChatMessage, Conversation } from '../admin/messagingServices';

export type { ChatMessage, Conversation };

/*
 * The signed-in chef's single conversation with the admin team. The backend
 * always resolves /messages to the caller's own conversation (created on first use).
 */

export async function getMyConversation(): Promise<Conversation> {
  const res = await api.get<{success: boolean;payload: Conversation;}>('/messages/conversation');
  return res.payload;
}

export async function getMyMessages(before?: string): Promise<{messages: ChatMessage[];hasMore: boolean;}> {
  const qs = before ? `?${new URLSearchParams({ before }).toString()}` : '';
  const res = await api.get<{success: boolean;payload: ChatMessage[];meta: {hasMore: boolean;};}>(`/messages${qs}`);
  return { messages: res.payload, hasMore: res.meta?.hasMore ?? false };
}

export async function sendMyMessage(body: string): Promise<ChatMessage> {
  const res = await api.post<{success: boolean;payload: ChatMessage;}>('/messages', { body });
  return res.payload;
}

/** Marks the admin team's messages as read by the chef. */
export function markMyMessagesRead(): Promise<{success: boolean;}> {
  return api.post<{success: boolean;}>('/messages/read');
}
