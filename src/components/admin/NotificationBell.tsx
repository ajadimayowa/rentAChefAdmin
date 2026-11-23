import { CalendarCheck, CreditCard, Info, UserCheck, UserPlus, UserX } from 'lucide-react';
import {
  getAdminNotificationUnreadCount,
  listAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead } from
'../../services/admin/adminNotificationServices';
import { NotificationBell as Bell, type NotificationSource } from '../notifications/NotificationBell';

const source: NotificationSource = {
  list: () => listAdminNotifications(),
  unreadCount: getAdminNotificationUnreadCount,
  markRead: markAdminNotificationRead,
  markAllRead: markAllAdminNotificationsRead
};

const ICONS: Record<string, React.ReactNode> = {
  'new-booking': <CalendarCheck className="h-4 w-4" />,
  'new-customer': <UserPlus className="h-4 w-4" />,
  'payment-confirmed': <CreditCard className="h-4 w-4" />,
  'chef-accepted': <UserCheck className="h-4 w-4" />,
  'chef-declined': <UserX className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />
};

/** Admin top-bar bell: admin feed + conversations with unread chef/client messages. */
export function NotificationBell({ unreadMessages }: {unreadMessages: number;}) {
  return (
    <Bell
      source={source}
      unreadMessages={unreadMessages}
      messagesPath="/admin/messages"
      messagesTitle={(n) => `${n} unread conversation${n === 1 ? '' : 's'}`}
      messagesHint="Chefs or clients are waiting for a reply."
      icons={ICONS} />);


}
