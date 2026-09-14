"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { api } from "../lib/api";
import { showToast } from "../lib/toast";
import { ButtonLink, Card } from "./ui";
import { ScrollArea } from "./ui/scroll-area";

type Message = {
  id: number | string;
  threadId: string;
  senderId: number;
  senderName?: string;
  recipientId: number;
  body: string;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
};

type CurrentUser = { id: number; email: string };
type Booking = { brandId: number; creatorId: number; status: string; amount: number | string };

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = ["image/", "application/pdf", "text/plain"];
const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/^http/, "ws") + "/ws";
const TYPING_DEBOUNCE_MS = 400;
const TYPING_HIDE_DELAY_MS = 3000;
const MAX_BACKOFF_MS = 30000;
const SCROLL_THRESHOLD_PX = 100;

type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

function connectionDot(status: ConnectionStatus) {
  if (status === "connected") return <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-label="Live" />;
  if (status === "connecting" || status === "reconnecting") return <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-label="Connecting" />;
  return <span className="inline-block h-2 w-2 rounded-full bg-red-400" aria-label="Offline" />;
}

function connectionLabel(status: ConnectionStatus) {
  if (status === "connected") return "Live";
  if (status === "connecting") return "Connecting…";
  if (status === "reconnecting") return "Reconnecting…";
  return "Offline — messages will send when reconnected";
}

function relativeTime(iso: string) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "yesterday";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function dateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function sameSender(a: Message, b: Message) {
  return a.senderId === b.senderId;
}

export function MessageThread({ threadId, role }: { threadId: string; role: "creator" | "brand" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attachmentNotice, setAttachmentNotice] = useState("");
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("connecting");
  const [threadReady, setThreadReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [typingUserId, setTypingUserId] = useState<number | null>(null);
  const [typingName, setTypingName] = useState("");
  const [showNewMsgPill, setShowNewMsgPill] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const clientRef = useRef<Client | null>(null);
  const threadSubRef = useRef<StompSubscription | null>(null);
  const typingSubRef = useRef<StompSubscription | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastTypingSentRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; items: Message[] }[] = [];
    let current: { date: string; items: Message[] } | null = null;
    for (const msg of messages) {
      if (!current || !sameDay(current.date, msg.createdAt)) {
        current = { date: msg.createdAt, items: [] };
        groups.push(current);
      }
      current.items.push(msg);
    }
    return groups;
  }, [messages]);

  const participant = useCallback(() => {
    const first = messages.find((m) => !m.pending);
    if (first && currentUserId) return first.senderId === currentUserId ? first.recipientId : first.senderId;
    if (booking && currentUserId) return booking.brandId === currentUserId ? booking.creatorId : booking.creatorId === currentUserId ? booking.brandId : null;
    return null;
  }, [messages, currentUserId, booking]);

  // Load initial data
  useEffect(() => {
    setThreadReady(false);
    setMessages([]);
    setShowNewMsgPill(false);
    setUnreadCount(0);
    const bookingRequest = threadId.startsWith("booking-") ? api<Booking>(`/bookings/${encodeURIComponent(threadId.slice("booking-".length))}`) : Promise.resolve(null);
    Promise.all([
      api<CurrentUser>("/users/me"),
      api<Message[]>(`/messages/${encodeURIComponent(threadId)}`),
      bookingRequest,
    ]).then(([user, loaded, context]) => {
      setCurrentUserId(user.id);
      setCurrentUserEmail(user.email);
      setMessages(loaded);
      setBooking(context);
      setThreadReady(true);
    }).catch(() => setError("Sign in as a conversation participant to load this thread."));
  }, [threadId]);

  // STOMP connection with exponential backoff
  useEffect(() => {
    if (!threadReady) return;
    let cancelled = false;
    let client: Client | null = null;
    let backoff = 1000;

    function connect() {
      if (cancelled) return;
      setConnStatus(client?.connected ? "reconnecting" : "connecting");

      void api<{ token: string }>("/auth/realtime-token", { method: "POST" }).then(({ token }) => {
        if (cancelled) return;
        client = new Client({
          brokerURL: REALTIME_URL,
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 0,
          onConnect: () => {
            backoff = 1000;
            setConnStatus("connected");
            // Subscribe to thread messages
            threadSubRef.current = client?.subscribe(`/topic/threads/${threadId}`, (frame: IMessage) => {
              const incoming = JSON.parse(frame.body) as Message;
              setMessages((current) => {
                if (current.some((m) => m.id === incoming.id)) return current;
                return [...current, incoming];
              });
              if (!isNearBottomRef.current && incoming.senderId !== currentUserId) {
                setUnreadCount((c) => c + 1);
              }
            }) ?? null;
            // Subscribe to typing events (backend may not support yet)
            typingSubRef.current = client?.subscribe(`/topic/thread/${threadId}/typing`, (frame: IMessage) => {
              const typing = JSON.parse(frame.body) as { userId: number; threadId: string; senderName?: string };
              if (typing.userId !== currentUserId) {
                setTypingUserId(typing.userId);
                setTypingName(typing.senderName ?? "Someone");
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), TYPING_HIDE_DELAY_MS);
              }
            }) ?? null;
          },
          onDisconnect: () => {
            setConnStatus("disconnected");
          },
          onStompError: () => {
            setConnStatus("reconnecting");
            backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
            setTimeout(connect, backoff);
          },
          onWebSocketClose: () => {
            setConnStatus("reconnecting");
            backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
            setTimeout(connect, backoff);
          },
        });
        client.activate();
      }).catch(() => {
        if (!cancelled) {
          setConnStatus("reconnecting");
          backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
          setTimeout(connect, backoff);
        }
      });
    }

    connect();

    return () => {
      cancelled = true;
      threadSubRef.current?.unsubscribe();
      typingSubRef.current?.unsubscribe();
      if (client) void client.deactivate();
    };
  }, [threadId, threadReady, currentUserId]);

  // Scroll detection
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distFromBottom < SCROLL_THRESHOLD_PX;
    if (isNearBottomRef.current) {
      setShowNewMsgPill(false);
      setUnreadCount(0);
    }
  }, []);

  // Auto-scroll on new message if near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowNewMsgPill(true);
    }
  }, [messages]);

  // Send typing event (debounced)
  const sendTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < TYPING_DEBOUNCE_MS) return;
    lastTypingSentRef.current = now;
    const client = clientRef.current;
    if (!client?.connected || !currentUserId) return;
    client.publish({
      destination: `/app/thread/${threadId}/typing`,
      body: JSON.stringify({ userId: currentUserId, threadId, senderName: currentUserEmail.split("@")[0] }),
    });
  }, [threadId, currentUserId, currentUserEmail]);

  async function sendText(text: string, failedId?: string) {
    const recipientId = participant();
    if (!recipientId || !currentUserId || !text.trim()) {
      setError("This conversation has no valid participant yet.");
      return;
    }
    const tempId = failedId ?? `pending-${Date.now()}`;
    const pending: Message = {
      id: tempId,
      threadId,
      senderId: currentUserId,
      recipientId,
      body: text.trim(),
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setError("");
    setBusy(true);
    setMessages((current) => failedId ? current.map((m) => m.id === failedId ? pending : m) : [...current, pending]);
    try {
      const saved = await api<Message>("/messages", {
        method: "POST",
        body: JSON.stringify({ threadId, recipientId, body: text.trim() }),
      });
      setMessages((current) => current.map((m) => m.id === tempId ? saved : m));
      if (!failedId) setBody("");
    } catch (caught) {
      setMessages((current) => current.map((m) => m.id === tempId ? { ...m, pending: false, failed: true } : m));
      setError(caught instanceof Error ? `${caught.message}. Retry when ready.` : "Message failed. Retry when ready.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendText(body);
  }

  function chooseAttachment(file: File | undefined) {
    if (!file) return;
    const supported = ACCEPTED_ATTACHMENT_TYPES.some((type) => type.endsWith("/") ? file.type.startsWith(type) : file.type === type);
    setAttachmentNotice(!supported ? "This file type is not supported." : file.size > MAX_ATTACHMENT_BYTES ? "Attachments must be 10 MB or smaller." : `Ready to attach ${file.name}. Storage upload is not connected yet.`);
  }

  function scrollToBottom() {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMsgPill(false);
    setUnreadCount(0);
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="flex h-[min(70svh,760px)] min-h-[520px] min-w-0 flex-col">
        {/* Header with connection status */}
        <div className="shrink-0 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-black">{role === "brand" ? "Creator conversation" : "Brand conversation"}</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
              {connectionDot(connStatus)}
              {connectionLabel(connStatus)}
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overscroll-contain py-6 pr-2"
        >
          {groupedMessages.length ? (
            <div className="space-y-6">
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-[var(--line)]" />
                    <span className="shrink-0 rounded-full bg-[var(--paper)] px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
                      {dateLabel(group.date)}
                    </span>
                    <div className="h-px flex-1 bg-[var(--line)]" />
                  </div>

                  {/* Messages in this day */}
                  <div className="space-y-2">
                    {group.items.map((message, idx) => {
                      const isMine = message.senderId === currentUserId;
                      const prevMsg = idx > 0 ? group.items[idx - 1] : null;
                      const showSender = !prevMsg || !sameSender(prevMsg, message) || !sameDay(prevMsg.createdAt, message.createdAt);
                      const isTyping = typingUserId === message.senderId && idx === group.items.length - 1 && message.pending;

                      return (
                        <div key={message.id}>
                          {/* Sender label (first in consecutive block) */}
                          {showSender && !isMine ? (
                            <p className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
                              {message.senderName || `User ${message.senderId}`}
                            </p>
                          ) : null}

                          <div
                            className={`group max-w-sm rounded-2xl px-4 py-3 text-sm leading-6 ${
                              isMine
                                ? "ml-auto bg-[var(--forest)] text-white"
                                : "bg-[var(--paper)] text-[var(--ink)]"
                            } ${message.failed ? "border-2 border-[var(--danger)]" : ""}`}
                          >
                            <p>{message.body}</p>
                            <p
                              className={`mt-1 text-[10px] ${isMine ? "text-white/60" : "text-[var(--muted)]"}`}
                              title={new Date(message.createdAt).toISOString()}
                            >
                              {relativeTime(message.createdAt)}
                              {message.pending ? " · Sending…" : null}
                            </p>
                            {message.failed ? (
                              <button
                                type="button"
                                onClick={() => void sendText(message.body, String(message.id))}
                                disabled={busy}
                                className="mt-1 text-xs font-bold underline"
                              >
                                Retry
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typingUserId ? (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]" aria-live="polite">
                  <span className="inline-flex gap-0.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:300ms]" />
                  </span>
                  <span>{typingName} is typing…</span>
                </div>
              ) : null}

              <div ref={bottomAnchorRef} />
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No messages yet. Start with the brief, timeline, and what a good outcome looks like.
            </p>
          )}
        </ScrollArea>

        {/* New message pill */}
        {showNewMsgPill ? (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-xs font-bold shadow-lg transition-colors hover:bg-[var(--paper)]"
          >
            ↓ New message{unreadCount > 1 ? ` (${unreadCount})` : ""}
          </button>
        ) : null}

        {/* Error */}
        {error ? (
          <p role="alert" aria-live="polite" className="mb-4 shrink-0 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <p className="sr-only" aria-live="polite">{attachmentNotice}</p>

        {/* Composer */}
        <form className="flex shrink-0 flex-wrap gap-3 border-t border-[var(--line)] pt-4" onSubmit={submit}>
          <label htmlFor="message-body" className="sr-only">Message</label>
          <input
            id="message-body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              sendTyping();
            }}
            className="min-h-12 min-w-0 flex-1 rounded-full border border-[var(--line)] px-5"
            placeholder="Write a message"
          />
          <label className="inline-flex min-h-12 cursor-pointer items-center rounded-full border border-[var(--line)] px-4 text-sm font-bold" title="Attach a file">
            <input type="file" className="sr-only" accept={ACCEPTED_ATTACHMENT_TYPES.join(",")} onChange={(e) => chooseAttachment(e.target.files?.[0])} />
            Attach
          </label>
          <button type="submit" disabled={busy || !body.trim()} className="inline-flex min-h-12 items-center rounded-full bg-[var(--forest)] px-6 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Sending…" : "Send"}
          </button>
        </form>
      </Card>

      {/* Thread sidebar */}
      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-black">Thread info</h3>
          <p className="mt-2 text-xs text-[var(--muted)]">Thread {threadId}</p>
          {booking ? (
            <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted)]">Booking</p>
              <p className="mt-1 text-sm font-black">{booking.status.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">₹{Number(booking.amount).toLocaleString("en-IN")}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
