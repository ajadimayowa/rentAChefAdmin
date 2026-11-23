import { useCallback, useEffect, useRef, useState } from 'react';
import { Headset, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../config/api';
import {
  getMyMessages,
  markMyMessagesRead,
  sendMyMessage,
  type ChatMessage } from
'../../services/chef/messagingServices';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

// No realtime channel yet, so the open thread is polled.
const THREAD_POLL_MS = 5_000;

/** Lets the sidebar badge and bell refresh straight away after the thread is read. */
export const CHEF_MESSAGES_READ_EVENT = 'chef-messages-read';

function timeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Merges a freshly polled page into what's loaded, de-duplicated and oldest → newest. */
function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(current.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ChefMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const markRead = useCallback(async () => {
    try {
      await markMyMessagesRead();
      window.dispatchEvent(new Event(CHEF_MESSAGES_READ_EVENT));
    } catch {
      /* non-fatal: retried on the next poll */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMyMessages().
    then((res) => {
      if (cancelled) return;
      setMessages(res.messages);
      setHasMore(res.hasMore);
      markRead();
    }).
    catch((err) => toast.error(errorMessage(err, 'Could not load messages.'))).
    finally(() => !cancelled && setLoading(false));

    const poll = setInterval(async () => {
      try {
        const res = await getMyMessages();
        if (cancelled) return;
        setMessages((prev) => {
          const next = mergeMessages(prev, res.messages);
          const gotNewFromAdmin = next.length > prev.length && next[next.length - 1]?.senderType === 'Admin';
          if (gotNewFromAdmin) {
            stickToBottom.current = true;
            markRead();
          }
          return next;
        });
      } catch {
        /* keep the thread as-is; next poll retries */
      }
    }, THREAD_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [markRead]);

  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const loadOlder = async () => {
    if (!messages.length) return;
    setLoadingOlder(true);
    stickToBottom.current = false;
    try {
      const res = await getMyMessages(messages[0].createdAt);
      setMessages((prev) => mergeMessages(prev, res.messages));
      setHasMore(res.hasMore);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load older messages.'));
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const message = await sendMyMessage(body);
      stickToBottom.current = true;
      setMessages((prev) => mergeMessages(prev, [message]));
      setDraft('');
    } catch (err) {
      toast.error(errorMessage(err, 'Message not sent.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader title="Messages" description="Chat with the Rent a Chef admin team. Replies show up here and in the app." />

      <Card className="overflow-hidden">
        <div className="flex h-[calc(100vh-230px)] min-h-[480px] flex-col">
          <header className="flex items-center gap-3 border-b border-ink-200 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-buttons/15 text-ink-900">
              <Headset className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-950">Rent a Chef Admin</p>
              <p className="truncate text-xs text-ink-500">Questions about bookings, payments or your profile</p>
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-ink-50/60 px-4 py-4">
            {hasMore ?
            <div className="flex justify-center">
                <Button variant="secondary" size="sm" disabled={loadingOlder} onClick={loadOlder}>
                  {loadingOlder ? 'Loading…' : 'Load older messages'}
                </Button>
              </div> :
            null}
            {loading ?
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
              </div> :
            messages.length === 0 ?
            <p className="p-8 text-center text-sm text-ink-500">No messages yet. Send the admin team a message below.</p> :

            messages.map((m) => {
              const mine = m.senderType !== 'Admin';
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                    mine ? 'rounded-br-md bg-buttons text-ink-950' : 'rounded-bl-md bg-white text-ink-900'}`
                    }>

                      {mine ? null : <p className="mb-0.5 text-[11px] font-semibold text-ink-500">Admin</p>}
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`mt-1 text-right text-[10px] ${mine ? 'text-ink-800/70' : 'text-ink-400'}`}>
                        {timeLabel(m.createdAt)}
                        {mine && m.readAt ? ' · Read' : ''}
                      </p>
                    </div>
                  </div>);

            })}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex items-end gap-2 border-t border-ink-200 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter adds a new line.
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              maxLength={4000}
              placeholder="Write a message…"
              aria-label="Message"
              className="max-h-40 min-h-[40px] flex-1 resize-y rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

            <Button type="submit" disabled={!draft.trim() || sending} icon={<Send className="h-4 w-4" />}>
              {sending ? 'Sending…' : 'Send'}
            </Button>
          </form>
        </div>
      </Card>
    </div>);

}
