import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChefHat, Loader2, MessageSquare, Plus, Search, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  getMessages,
  listConversations,
  markConversationRead,
  searchRecipients,
  sendMessage,
  startConversation,
  type ChatMessage,
  type Conversation,
  type ParticipantType,
  type Recipient } from
'../../services/admin/messagingServices';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

// No realtime channel yet, so the inbox and the open thread are polled.
const INBOX_POLL_MS = 10_000;
const THREAD_POLL_MS = 5_000;

/** Lets the sidebar badge refresh straight away after a thread is read. */
export const MESSAGES_READ_EVENT = 'admin-messages-read';

type Filter = 'all' | ParticipantType;

const typeLabel = (t: ParticipantType) => t === 'Chef' ? 'Chef' : 'Client';

function timeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function Avatar({ name, src, type }: {name: string;src?: string;type?: ParticipantType;}) {
  if (src) return <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
      {type === 'Chef' ? <ChefHat className="h-4 w-4" /> : name ? name.slice(0, 1).toUpperCase() : <User className="h-4 w-4" />}
    </span>);

}

/** Merges a freshly polled page into what's loaded, de-duplicated and oldest → newest. */
function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(current.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(searchParams.get('c'));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  // ---------- inbox ----------
  // The inbox is polled, so a failing request would toast every few seconds.
  // Show the error once and stay quiet until a load succeeds again.
  const inboxErrorShown = useRef(false);
  const loadInbox = useCallback(async () => {
    try {
      const list = await listConversations({
        type: filter === 'all' ? undefined : filter,
        search: search.trim() || undefined
      });
      setConversations(list);
      inboxErrorShown.current = false;
    } catch (err) {
      if (!inboxErrorShown.current) {
        inboxErrorShown.current = true;
        toast.error(errorMessage(err, 'Could not load conversations.'), { id: 'inbox-load-error' });
      }
    } finally {
      setInboxLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const t = setTimeout(loadInbox, 250); // debounce typing in the search box
    const poll = setInterval(loadInbox, INBOX_POLL_MS);
    return () => {
      clearTimeout(t);
      clearInterval(poll);
    };
  }, [loadInbox]);

  // ---------- open thread ----------
  const markRead = useCallback(async (id: string) => {
    try {
      await markConversationRead(id);
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unreadForAdmin: 0 } : c));
      window.dispatchEvent(new Event(MESSAGES_READ_EVENT));
    } catch {
      /* non-fatal: retried on the next poll */
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    setThreadLoading(true);
    setMessages([]);
    stickToBottom.current = true;
    getMessages(activeId).
    then((res) => {
      if (cancelled) return;
      setMessages(res.messages);
      setHasMore(res.hasMore);
      markRead(activeId);
    }).
    catch((err) => toast.error(errorMessage(err, 'Could not load messages.'))).
    finally(() => !cancelled && setThreadLoading(false));

    const poll = setInterval(async () => {
      try {
        const res = await getMessages(activeId);
        if (cancelled) return;
        setMessages((prev) => {
          const next = mergeMessages(prev, res.messages);
          const gotNewFromThem = next.length > prev.length && next[next.length - 1]?.senderType !== 'Admin';
          if (gotNewFromThem) markRead(activeId);
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
  }, [activeId, markRead]);

  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const openConversation = (id: string | null) => {
    setActiveId(id);
    setDraft('');
    setSearchParams(id ? { c: id } : {}, { replace: true });
  };

  const loadOlder = async () => {
    if (!activeId || !messages.length) return;
    setLoadingOlder(true);
    stickToBottom.current = false;
    try {
      const res = await getMessages(activeId, messages[0].createdAt);
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
    if (!activeId || !body || sending) return;
    setSending(true);
    try {
      const message = await sendMessage(activeId, body);
      stickToBottom.current = true;
      setMessages((prev) => mergeMessages(prev, [message]));
      setDraft('');
      // Move this thread to the top of the inbox with its new preview.
      setConversations((prev) => {
        const current = prev.find((c) => c.id === activeId);
        if (!current) return prev;
        const updated: Conversation = {
          ...current,
          lastMessage: { body, senderType: 'Admin', sentAt: message.createdAt },
          unreadForParticipant: current.unreadForParticipant + 1
        };
        return [updated, ...prev.filter((c) => c.id !== activeId)];
      });
    } catch (err) {
      toast.error(errorMessage(err, 'Message not sent.'));
    } finally {
      setSending(false);
    }
  };

  const handleRecipientPicked = async (recipient: Recipient) => {
    try {
      const conversation = await startConversation(recipient.id);
      setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
      setComposeOpen(false);
      openConversation(conversation.id);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not start the conversation.'));
    }
  };

  const unreadTotal = conversations.filter((c) => c.unreadForAdmin > 0).length;

  return (
    <div>
      <PageHeader
        title="Messaging"
        description="Message chefs and clients directly. Replies from the app land here."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setComposeOpen(true)}>
            New message
          </Button>
        } />


      <Card className="overflow-hidden">
        <div className="grid h-[calc(100vh-230px)] min-h-[480px] grid-cols-1 lg:grid-cols-[340px_1fr]">
          {/* ---------- inbox ---------- */}
          <aside className={`flex min-h-0 flex-col border-ink-200 lg:border-r ${activeId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="space-y-3 border-b border-ink-200 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email or phone…"
                  aria-label="Search conversations"
                  className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

              </div>
              <div className="flex gap-1 rounded-lg bg-ink-100 p-1 text-sm" role="tablist">
                {(['all', 'Chef', 'Customer'] as Filter[]).map((f) =>
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${
                  filter === f ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`
                  }>

                    {f === 'all' ? 'All' : f === 'Chef' ? 'Chefs' : 'Clients'}
                  </button>
                )}
              </div>
              {unreadTotal ?
              <p className="text-xs text-ink-500">{unreadTotal} unread conversation{unreadTotal === 1 ? '' : 's'}</p> :
              null}
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto">
              {inboxLoading ?
              <li className="flex items-center justify-center gap-2 p-8 text-sm text-ink-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </li> :
              conversations.length === 0 ?
              <li className="p-8 text-center text-sm text-ink-500">
                  {search ? 'No conversations match your search.' : 'No conversations yet. Start one with “New message”.'}
                </li> :

              conversations.map((c) => {
                const name = c.participant?.name || 'Deleted user';
                const unread = c.unreadForAdmin > 0;
                return (
                  <li key={c.id}>
                      <button
                      type="button"
                      onClick={() => openConversation(c.id)}
                      className={`flex w-full items-start gap-3 border-b border-ink-100 px-4 py-3 text-left transition-colors ${
                      c.id === activeId ? 'bg-buttons/10' : 'hover:bg-ink-50'}`
                      }>

                        <Avatar name={name} src={c.participant?.avatar} type={c.participantType} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`truncate text-sm ${unread ? 'font-semibold text-ink-950' : 'font-medium text-ink-900'}`}>
                              {name}
                            </p>
                            <span className="shrink-0 text-[11px] text-ink-400">{timeLabel(c.lastMessage?.sentAt)}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p className={`min-w-0 flex-1 truncate text-xs ${unread ? 'text-ink-800' : 'text-ink-500'}`}>
                              {c.lastMessage ?
                            `${c.lastMessage.senderType === 'Admin' ? 'You: ' : ''}${c.lastMessage.body}` :
                            'No messages yet'}
                            </p>
                            {unread ?
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-buttons px-1.5 text-[11px] font-semibold text-ink-950">
                                {c.unreadForAdmin}
                              </span> :
                          null}
                          </div>
                          <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-wide text-ink-400">
                            {typeLabel(c.participantType)}
                          </span>
                        </div>
                      </button>
                    </li>);

              })}
            </ul>
          </aside>

          {/* ---------- thread ---------- */}
          <section className={`min-h-0 flex-col ${activeId ? 'flex' : 'hidden lg:flex'}`}>
            {!activeId ?
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
                  <MessageSquare className="h-6 w-6" />
                </span>
                <p className="mt-4 font-heading text-[15px] font-semibold text-ink-900">Select a conversation</p>
                <p className="mt-1 max-w-sm text-sm text-ink-500">
                  Pick a chef or client on the left, or start a new conversation.
                </p>
              </div> :

            <>
                <header className="flex items-center gap-3 border-b border-ink-200 px-4 py-3">
                  <button
                  type="button"
                  onClick={() => openConversation(null)}
                  className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden"
                  aria-label="Back to conversations">

                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <Avatar
                  name={active?.participant?.name ?? ''}
                  src={active?.participant?.avatar}
                  type={active?.participantType} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-950">
                      {active?.participant?.name || 'Conversation'}
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {[active?.participant?.email, active?.participant?.phone].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {active ? <Badge tone={active.participantType === 'Chef' ? 'brand' : 'neutral'}>{typeLabel(active.participantType)}</Badge> : null}
                </header>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-ink-50/60 px-4 py-4">
                  {hasMore ?
                <div className="flex justify-center">
                      <Button variant="secondary" size="sm" disabled={loadingOlder} onClick={loadOlder}>
                        {loadingOlder ? 'Loading…' : 'Load older messages'}
                      </Button>
                    </div> :
                null}
                  {threadLoading ?
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-ink-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
                    </div> :
                messages.length === 0 ?
                <p className="p-8 text-center text-sm text-ink-500">No messages yet — say hello below.</p> :

                messages.map((m) => {
                  const mine = m.senderType === 'Admin';
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                        mine ? 'rounded-br-md bg-buttons text-ink-950' : 'rounded-bl-md bg-white text-ink-900'}`
                        }>

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
              </>
            }
          </section>
        </div>
      </Card>

      <NewMessageModal open={composeOpen} onClose={() => setComposeOpen(false)} onPick={handleRecipientPicked} />
    </div>);

}

function NewMessageModal({
  open,
  onClose,
  onPick




}: {open: boolean;onClose: () => void;onPick: (r: Recipient) => Promise<void>;}) {
  const [type, setType] = useState<ParticipantType>('Chef');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      searchRecipients({ type, search: search.trim() || undefined }).
      then((r) => !cancelled && setResults(r)).
      catch((err) => toast.error(errorMessage(err, 'Could not search users.'))).
      finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, type, search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setPicking(null);
    }
  }, [open]);

  const label = useMemo(() => type === 'Chef' ? 'chefs' : 'clients', [type]);

  return (
    <Modal open={open} onClose={onClose} title="New message" description="Choose who to message." size="md">
      <div className="space-y-3 px-6 py-5">
        <div className="flex gap-1 rounded-lg bg-ink-100 p-1 text-sm" role="tablist">
          {(['Chef', 'Customer'] as ParticipantType[]).map((t) =>
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={type === t}
            onClick={() => setType(t)}
            className={`flex-1 rounded-md px-2 py-1.5 font-medium transition-colors ${
            type === t ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`
            }>

              {t === 'Chef' ? 'Chefs' : 'Clients'}
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label} by name, email or phone…`}
            aria-label={`Search ${label}`}
            className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

        </div>
        <ul className="max-h-80 divide-y divide-ink-100 overflow-y-auto rounded-lg border border-ink-200">
          {loading ?
          <li className="flex items-center justify-center gap-2 p-6 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </li> :
          results.length === 0 ?
          <li className="p-6 text-center text-sm text-ink-500">No {label} found.</li> :

          results.map((r) =>
          <li key={r.id}>
                <button
              type="button"
              disabled={Boolean(picking)}
              onClick={async () => {
                setPicking(r.id);
                await onPick(r);
                setPicking(null);
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-ink-50 disabled:opacity-60">

                  <Avatar name={r.name} src={r.avatar} type={r.userType} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{r.name || 'Unnamed'}</p>
                    <p className="truncate text-xs text-ink-500">{[r.email, r.phone].filter(Boolean).join(' · ')}</p>
                  </div>
                  {picking === r.id ? <Loader2 className="h-4 w-4 animate-spin text-ink-400" /> : null}
                </button>
              </li>
          )}
        </ul>
      </div>
    </Modal>);

}
