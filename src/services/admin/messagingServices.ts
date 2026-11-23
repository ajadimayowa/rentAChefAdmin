import { api } from '../../config/api';

export type ParticipantType = 'Chef' | 'Customer';
export type SenderType = 'Admin' | ParticipantType;

export interface ConversationParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Conversation {
  id: string;
  participantType: ParticipantType;
  participant: ConversationParticipant | null;
  lastMessage: {body: string;senderType: SenderType;sentAt: string;} | null;
  unreadForAdmin: number;
  unreadForParticipant: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversation: string;
  sender: string;
  senderType: SenderType;
  body: string;
  readAt?: string;
  createdAt: string;
}

export interface Recipient extends ConversationParticipant {
  userType: ParticipantType;
}

const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((e): e is [string, string] => Boolean(e[1]));
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

export async function listConversations(params: {type?: ParticipantType;search?: string;} = {}): Promise<Conversation[]> {
  const res = await api.get<{success: boolean;payload: Conversation[];}>(
    `/admin/conversations${query({ type: params.type, search: params.search })}`
  );
  return res.payload;
}

export async function getUnreadConversationCount(): Promise<number> {
  const res = await api.get<{success: boolean;payload: {count: number;};}>('/admin/conversations/unread-count');
  return res.payload.count;
}

export async function searchRecipients(params: {type?: ParticipantType;search?: string;} = {}): Promise<Recipient[]> {
  const res = await api.get<{success: boolean;payload: Recipient[];}>(
    `/admin/conversations/recipients${query({ type: params.type, search: params.search })}`
  );
  return res.payload;
}

/** Returns the participant's existing conversation, or creates it. */
export async function startConversation(participantId: string): Promise<Conversation> {
  const res = await api.post<{success: boolean;payload: Conversation;}>('/admin/conversations', { participantId });
  return res.payload;
}

export async function getMessages(
conversationId: string,
before?: string)
: Promise<{messages: ChatMessage[];hasMore: boolean;}> {
  const res = await api.get<{success: boolean;payload: ChatMessage[];meta: {hasMore: boolean;};}>(
    `/admin/conversations/${conversationId}/messages${query({ before })}`
  );
  return { messages: res.payload, hasMore: res.meta?.hasMore ?? false };
}

export async function sendMessage(conversationId: string, body: string): Promise<ChatMessage> {
  const res = await api.post<{success: boolean;payload: ChatMessage;}>(
    `/admin/conversations/${conversationId}/messages`,
    { body }
  );
  return res.payload;
}

export function markConversationRead(conversationId: string): Promise<{success: boolean;}> {
  return api.post<{success: boolean;}>(`/admin/conversations/${conversationId}/read`);
}
