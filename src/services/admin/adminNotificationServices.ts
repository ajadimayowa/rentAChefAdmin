import { api } from '../../config/api';

export type AdminNotificationType =
'new-booking' |
'new-customer' |
'payment-confirmed' |
'chef-accepted' |
'chef-declined' |
'system';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  /** Admin-portal path to open on click. */
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export async function listAdminNotifications(limit = 20): Promise<AdminNotification[]> {
  const res = await api.get<{success: boolean;payload: AdminNotification[];}>(`/admin/notifications?limit=${limit}`);
  return res.payload;
}

export async function getAdminNotificationUnreadCount(): Promise<number> {
  const res = await api.get<{success: boolean;payload: {count: number;};}>('/admin/notifications/unread-count');
  return res.payload.count;
}

export function markAdminNotificationRead(id: string): Promise<{success: boolean;}> {
  return api.post<{success: boolean;}>(`/admin/notifications/${id}/read`);
}

export function markAllAdminNotificationsRead(): Promise<{success: boolean;}> {
  return api.post<{success: boolean;}>('/admin/notifications/read-all');
}
