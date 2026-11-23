import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarCheck, CreditCard, Info, Loader2, MessageSquare, UserCheck, UserPlus, UserX } from 'lucide-react';
import {
  getAdminNotificationUnreadCount,
  listAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
  type AdminNotificationType } from
'../../services/admin/adminNotificationServices';

const POLL_MS = 30_000;

const TYPE_ICON: Record<AdminNotificationType, React.ReactNode> = {
  'new-booking': <CalendarCheck className="h-4 w-4" />,
  'new-customer': <UserPlus className="h-4 w-4" />,
  'payment-confirmed': <CreditCard className="h-4 w-4" />,
  'chef-accepted': <UserCheck className="h-4 w-4" />,
  'chef-declined': <UserX className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />
};

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Top-bar bell. The badge is unread notifications + conversations with unread
 * messages; the dropdown shows both, newest first.
 */
export function NotificationBell({ unreadMessages }: {unreadMessages: number;}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    getAdminNotificationUnreadCount().then(setUnreadNotifications).catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshCount();
    const poll = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(poll);
  }, [refreshCount]);

  // Load the list whenever the panel opens.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listAdminNotifications().
    then(setItems).
    catch(() => setItems([])).
    finally(() => setLoading(false));
    refreshCount();
  }, [open, refreshCount]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const total = unreadNotifications + unreadMessages;

  const openItem = async (n: AdminNotification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((i) => i.id === n.id ? { ...i, isRead: true } : i));
      setUnreadNotifications((c) => Math.max(0, c - 1));
      markAdminNotificationRead(n.id).catch(() => undefined);
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    setUnreadNotifications(0);
    markAllAdminNotificationsRead().catch(refreshCount);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={total ? `Notifications, ${total} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100">

        <Bell className="h-5 w-5" />
        {total > 0 ?
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white">
            {total > 99 ? '99+' : total}
          </span> :
        null}
      </button>

      {open ?
      <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
            <p className="font-heading text-sm font-semibold text-ink-950">Notifications</p>
            {unreadNotifications > 0 ?
          <button type="button" onClick={markAll} className="text-xs font-medium text-buttons hover:underline">
                Mark all as read
              </button> :
          null}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {unreadMessages > 0 ?
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/admin/messages');
            }}
            className="flex w-full items-start gap-3 border-b border-ink-100 bg-buttons/10 px-4 py-3 text-left hover:bg-buttons/15">

                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-buttons text-ink-950">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-950">
                    {unreadMessages} unread conversation{unreadMessages === 1 ? '' : 's'}
                  </span>
                  <span className="block text-xs text-ink-600">Chefs or clients are waiting for a reply.</span>
                </span>
              </button> :
          null}

            {loading ?
          <p className="flex items-center justify-center gap-2 p-6 text-sm text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p> :
          items.length === 0 ?
          <p className="p-6 text-center text-sm text-ink-500">No notifications yet.</p> :

          <ul>
                {items.map((n) =>
            <li key={n.id}>
                    <button
                type="button"
                onClick={() => openItem(n)}
                className={`flex w-full items-start gap-3 border-b border-ink-100 px-4 py-3 text-left hover:bg-ink-50 ${
                n.isRead ? '' : 'bg-ink-50/60'}`
                }>

                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600">
                        {TYPE_ICON[n.type] ?? TYPE_ICON.system}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${n.isRead ? 'text-ink-700' : 'font-semibold text-ink-950'}`}>
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-ink-400">{timeAgo(n.createdAt)}</span>
                        </span>
                        {n.message ? <span className="mt-0.5 block text-xs text-ink-500">{n.message}</span> : null}
                      </span>
                      {n.isRead ? null : <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-buttons" aria-label="Unread" />}
                    </button>
                  </li>
            )}
              </ul>
          }
          </div>
        </div> :
      null}
    </div>);

}
