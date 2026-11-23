import { api } from '../config/api';
import type { BellNotification } from '../components/notifications/NotificationBell';

/* The signed-in chef's or client's own notification feed (/me/notifications). */

export async function listMyNotifications(limit = 20): Promise<BellNotification[]> {
  const res = await api.get<{success: boolean;payload: BellNotification[];}>(`/me/notifications?limit=${limit}`);
  return res.payload;
}

export async function getMyNotificationUnreadCount(): Promise<number> {
  const res = await api.get<{success: boolean;payload: {count: number;};}>('/me/notifications/unread-count');
  return res.payload.count;
}

export function markMyNotificationRead(id: string): Promise<{success: boolean;}> {
  return api.post<{success: boolean;}>(`/me/notifications/${id}/read`);
}

export function markAllMyNotificationsRead(): Promise<{success: boolean;}> {
  return api.post<{success: boolean;}>('/me/notifications/read-all');
}
