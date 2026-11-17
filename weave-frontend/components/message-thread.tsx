"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { ArrowLeft, ArrowUp, BriefcaseBusiness, CheckCheck, ChevronRight, FileText, Inbox, Info, Paperclip, Smile, X } from "lucide-react";
import { api, chatApi, getChatApiUrl } from "../lib/api";
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
  reactions?: Record<string, number>;
  attachments?: { id: number; fileName: string; contentType: string; sizeBytes: number }[];
};

type CurrentUser = { id: number; email: string };
type Booking = { brandId: number; creatorId: number; status: string; amount: number | string };

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = ["image/", "application/pdf", "text/plain"];
const WORKER_CHAT_ENABLED = Boolean(process.env.NEXT_PUBLIC_CHAT_API_URL);
const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL ?? (WORKER_CHAT_ENABLED ? process.env.NEXT_PUBLIC_CHAT_API_URL! : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080")).replace(/^http/, "ws") + (WORKER_CHAT_ENABLED ? "/realtime" : "/ws");
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
  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const uploadedAttachmentIdRef = useRef<number | null>(null);
  const [reactionPicker, setReactionPicker] = useState<string | number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsToggleRef = useRef<HTMLButtonElement | null>(null);
  const detailsCloseRef = useRef<HTMLButtonElement | null>(null);
  const previousDetailsOpenRef = useRef(false);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("connecting");
  const [threadReady, setThreadReady] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [typingUserId, setTypingUserId] = useState<number | null>(null);
  const [typingName, setTypingName] = useState("");
  const [showNewMsgPill, setShowNewMsgPill] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const clientRef = useRef<WebSocket | Client | null>(null);
  const threadSubRef = useRef<StompSubscription | null>(null);
  const typingSubRef = useRef<StompSubscription | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastTypingSentRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (detailsOpen) {
      previousDetailsOpenRef.current = true;
      detailsCloseRef.current?.focus();
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setDetailsOpen(false);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
    if (previousDetailsOpenRef.current) detailsToggleRef.current?.focus();
    previousDetailsOpenRef.current = detailsOpen;
  }, [detailsOpen]);

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
    const bookingRequest = threadId.startsWith("booking-") ? chatApi<Booking>(`/bookings/${encodeURIComponent(threadId.slice("booking-".length))}`) : Promise.resolve(null);
    Promise.all([
      chatApi<CurrentUser>("/users/me"),
      chatApi<Message[]>(`/messages/${encodeURIComponent(threadId)}`),
      bookingRequest,
    ]).then(([user, loaded, context]) => {
      setCurrentUserId(user.id);
      setCurrentUserEmail(user.email);
      setMessages(loaded);
      setBooking(context);
      setThreadReady(true);
    }).catch(() => setError("Sign in as a conversation participant to load this thread."));
  }, [threadId]);

  // Native WebSocket connection to the Workers thread Durable Object
  useEffect(() => {
    if (!threadReady) return;
    if (!WORKER_CHAT_ENABLED) {
      let cancelled = false;
      let client: Client | null = null;
      let backoff = 1000;
      function connectSpring() {
        if (cancelled) return;
        setConnStatus(client?.connected ? "reconnecting" : "connecting");
        void api<{ token: string }>("/auth/realtime-token", { method: "POST" }).then(({ token }) => {
          if (cancelled) return;
          client = new Client({
            brokerURL: REALTIME_URL,
            connectHeaders: { Authorization: "Bearer " + token },
            reconnectDelay: 0,
            onConnect: () => {
              backoff = 1000;
              setConnStatus("connected");
              clientRef.current = client;
              threadSubRef.current = client?.subscribe("/topic/threads/" + threadId, (frame: IMessage) => {
                const incoming = JSON.parse(frame.body) as Message;
                setMessages((current) => current.some((m) => m.id === incoming.id) ? current : [...current, incoming]);
                if (!isNearBottomRef.current && incoming.senderId !== currentUserId) setUnreadCount((count) => count + 1);
              }) ?? null;
              typingSubRef.current = client?.subscribe("/topic/thread/" + threadId + "/typing", (frame: IMessage) => {
                const typing = JSON.parse(frame.body) as { userId: number; senderName?: string };
                if (typing.userId !== currentUserId) {
                  setTypingUserId(typing.userId);
                  setTypingName(typing.senderName ?? "Someone");
                  clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), TYPING_HIDE_DELAY_MS);
                }
              }) ?? null;
            },
            onWebSocketClose: () => {
              clientRef.current = null;
              if (cancelled) return;
              setConnStatus("reconnecting");
              backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
              setTimeout(connectSpring, backoff);
            },
            onStompError: () => {
              clientRef.current = null;
              if (cancelled) return;
              setConnStatus("reconnecting");
              backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
              setTimeout(connectSpring, backoff);
            },
          });
          client.activate();
        }).catch(() => {
          if (cancelled) return;
          setConnStatus("reconnecting");
          backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
          setTimeout(connectSpring, backoff);
        });
      }
      void connectSpring();
      return () => {
        cancelled = true;
        threadSubRef.current?.unsubscribe();
        typingSubRef.current?.unsubscribe();
        clientRef.current = null;
        if (client) void client.deactivate();
      };
    }
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let backoff = 1000;

    async function connect() {
      if (cancelled) return;
      setConnStatus(socket ? "reconnecting" : "connecting");
      try {
        const { token } = await api<{ token: string }>("/auth/realtime-token", { method: "POST" });
        if (cancelled) return;
        const base = REALTIME_URL.replace(/\/$/, "");
        socket = new WebSocket(base + "/" + encodeURIComponent(threadId) + "?token=" + encodeURIComponent(token));
        clientRef.current = socket;
        socket.onopen = () => { backoff = 1000; setConnStatus("connected"); };
        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data)) as { type: string; message?: Message; messageId?: number; reactions?: Record<string, number>; userId?: number; senderName?: string };
            if (payload.type === "message" && payload.message) {
              const incoming = payload.message;
              setMessages((current) => current.some((m) => m.id === incoming.id) ? current : [...current, incoming]);
              if (!isNearBottomRef.current && incoming.senderId !== currentUserId) setUnreadCount((count) => count + 1);
            }
            if (payload.type === "reaction" && payload.messageId) {
              setMessages((current) => current.map((message) => message.id === payload.messageId ? { ...message, reactions: payload.reactions } : message));
            }
            if (payload.type === "typing" && payload.userId !== currentUserId) {
              setTypingUserId(payload.userId ?? null);
              setTypingName(payload.senderName ?? "Someone");
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), TYPING_HIDE_DELAY_MS);
            }
          } catch { /* Ignore malformed socket events. */ }
        };
        socket.onclose = () => {
          clientRef.current = null;
          if (cancelled) return;
          setConnStatus("reconnecting");
          backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
          reconnectTimer = setTimeout(() => void connect(), backoff);
        };
        socket.onerror = () => socket?.close();
      } catch {
        if (cancelled) return;
        setConnStatus("reconnecting");
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
        reconnectTimer = setTimeout(() => void connect(), backoff);
      }
    }

    void connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clientRef.current = null;
      socket?.close();
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
    const connection = clientRef.current;
    if (!currentUserId) return;
    if (connection instanceof WebSocket) {
      if (connection.readyState === WebSocket.OPEN) connection.send(JSON.stringify({ type: "typing", threadId, senderName: currentUserEmail.split("@")[0] }));
    } else if (connection instanceof Client && connection.connected) {
      connection.publish({ destination: "/app/thread/" + threadId + "/typing", body: JSON.stringify({ userId: currentUserId, threadId, senderName: currentUserEmail.split("@")[0] }) });
    }
  }, [threadId, currentUserId, currentUserEmail]);

  async function sendText(text: string, failedId?: string) {
    const recipientId = participant();
    if (!recipientId || !currentUserId || (!text.trim() && !selectedAttachment)) {
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
      let attachmentId = uploadedAttachmentIdRef.current;
      if (selectedAttachment && !attachmentId) {
        const form = new FormData();
        form.set("threadId", threadId);
        form.set("file", selectedAttachment);
        const uploaded = await chatApi<{ id: number }>("/messages/attachments", { method: "POST", body: form });
        attachmentId = uploaded.id;
        uploadedAttachmentIdRef.current = attachmentId;
      }
      const saved = await chatApi<Message>("/messages", {
        method: "POST",
        body: JSON.stringify({ threadId, recipientId, body: text.trim(), attachmentId }),
      });
      setMessages((current) => current.map((m) => m.id === tempId ? saved : m));
      if (!failedId) setBody("");
      uploadedAttachmentIdRef.current = null;
      setSelectedAttachment(null);
      setAttachmentNotice("");
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
    if (!WORKER_CHAT_ENABLED) { setAttachmentNotice("File uploads require the Workers chat API configuration."); return; }
    const supported = ACCEPTED_ATTACHMENT_TYPES.some((type) => type.endsWith("/") ? file.type.startsWith(type) : file.type === type);
    if (!supported) { uploadedAttachmentIdRef.current = null; setSelectedAttachment(null); setAttachmentNotice("This file type is not supported."); return; }
    if (file.size > MAX_ATTACHMENT_BYTES) { uploadedAttachmentIdRef.current = null; setSelectedAttachment(null); setAttachmentNotice("Attachments must be 10 MB or smaller."); return; }
    uploadedAttachmentIdRef.current = null;
    setSelectedAttachment(file);
    setAttachmentNotice(`${file.name} ready to send.`);
  }

  async function toggleReaction(messageId: string | number, emoji: string) {
    setReactionPicker(null);
    if (!WORKER_CHAT_ENABLED) {
      setMessages((current) => current.map((message) => {
        if (message.id !== messageId) return message;
        const reactions = { ...(message.reactions ?? {}) };
        reactions[emoji] = reactions[emoji] ? reactions[emoji] + 1 : 1;
        return { ...message, reactions };
      }));
      return;
    }
    try {
      const result = await chatApi<{ messageId: number; reactions: Record<string, number> }>("/messages/" + encodeURIComponent(String(messageId)) + "/reactions", { method: "POST", body: JSON.stringify({ emoji }) });
      setMessages((current) => current.map((message) => message.id === result.messageId ? { ...message, reactions: result.reactions } : message));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save reaction.");
    }
  }

  function scrollToBottom() {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMsgPill(false);
    setUnreadCount(0);
  }

  return (
    <section className={`chat-workspace ${detailsOpen ? "details-open" : "details-closed"}`} aria-label="Weave conversation">
      <aside className="chat-context-list" aria-label="Conversation overview">
        <Link href={`/${role}/messages`} className="chat-back-link"><ArrowLeft size={16} /> All messages</Link>
        <div className="chat-context-title"><div><span className="chat-eyebrow">ACTIVE THREAD</span><h2>Conversation</h2></div><span className="chat-count">01</span></div>
        <Link href={`/${role}/messages/${encodeURIComponent(threadId)}`} className="chat-thread-summary" aria-current="page">
          <span className="chat-thread-avatar">{role === "brand" ? "C" : "B"}</span>
          <span className="chat-thread-copy"><strong>{role === "brand" ? "Creator" : "Brand"}</strong><small>{messages.at(-1)?.body ?? "Start the conversation"}</small></span><ChevronRight size={15} />
        </Link>
        <div className="chat-context-note"><span className="chat-note-icon"><FileText size={17} /></span><strong>Work stays in one place</strong><p>Keep decisions and updates with your collaboration partner in this thread.</p></div>
        {booking ? <div className="chat-list-booking"><span>BOOKING THREAD</span><strong>{booking.status.replaceAll("_", " ")}</strong></div> : null}
        <div className="chat-context-bottom"><span className="chat-lock-icon"><Info size={14} /></span> Shared work context</div>
      </aside>
      <div className="chat-main-column">
        <div className="chat-main-panel">
          <header className="chat-header">
            <Link href={`/${role}/messages`} className="chat-mobile-back" aria-label="Back to messages"><ArrowLeft size={18} /></Link>
            <div className="chat-person-avatar"><span>{role === "brand" ? "C" : "B"}</span></div>
            <div className="chat-header-person"><strong>{role === "brand" ? "Creator conversation" : "Brand conversation"}</strong><span>{connectionDot(connStatus)}{connectionLabel(connStatus)}</span></div>
            <div className="chat-header-actions"><button ref={detailsToggleRef} type="button" aria-label={detailsOpen ? "Close conversation details" : "Open conversation details"} aria-expanded={detailsOpen} aria-controls="chat-details-panel" onClick={() => setDetailsOpen((value) => !value)} title="Conversation details"><Info size={17} /></button></div>
          </header>
          <ScrollArea ref={scrollContainerRef} onScroll={handleScroll} className="chat-message-scroll min-h-0 flex-1 overscroll-contain">
            {groupedMessages.length ? <div className="chat-message-groups">
              {groupedMessages.map((group) => <div key={group.date}>
                <div className="chat-date-row"><span className="chat-date-divider">{dateLabel(group.date)}</span></div>
                <div className="chat-message-list">{group.items.map((message, idx) => {
                  const isMine = message.senderId === currentUserId;
                  const prevMsg = idx > 0 ? group.items[idx - 1] : null;
                  const showSender = !prevMsg || !sameSender(prevMsg, message) || !sameDay(prevMsg.createdAt, message.createdAt);
                  return <div key={message.id}>
                    {showSender && !isMine ? <p className="chat-sender-label">{message.senderName || `User ${message.senderId}`}</p> : null}
                    <article className={`chat-message-row ${isMine ? "is-mine" : "is-theirs"}`}>
                      <div className={`chat-bubble ${isMine ? "is-mine" : "is-theirs"} ${message.failed ? "has-failed" : ""}`}>
                        {message.body ? <p className="chat-message-body">{message.body}</p> : null}
                        {message.attachments?.map((attachment) => <a key={attachment.id} href={getChatApiUrl() + "/messages/attachments/" + attachment.id} target="_blank" rel="noreferrer" className="chat-message-body underline">{attachment.fileName}</a>)}
                        {message.reactions && Object.keys(message.reactions).length > 0 ? <div className="chat-reactions">{Object.entries(message.reactions).map(([emoji, count]) => <button key={emoji} type="button" onClick={() => toggleReaction(message.id, emoji)} aria-label={`${emoji}, ${count} reactions`}>{emoji} {count}</button>)}</div> : null}
                        {!message.pending && !message.failed ? <div className="chat-reaction-control"><button type="button" onClick={() => setReactionPicker(reactionPicker === message.id ? null : message.id)} aria-expanded={reactionPicker === message.id} aria-label="React to message"><Smile size={14} /><span>React</span></button>{reactionPicker === message.id ? <div className="chat-emoji-picker" role="group" aria-label="Choose a reaction">{["👍", "❤️", "😂", "🎉", "👀"].map((emoji) => <button key={emoji} type="button" onClick={() => toggleReaction(message.id, emoji)} aria-label={`React ${emoji}`}>{emoji}</button>)}</div> : null}</div> : null}
                        <p className="chat-message-meta" title={new Date(message.createdAt).toISOString()}>{relativeTime(message.createdAt)}{message.pending ? " · Sending…" : isMine ? <CheckCheck size={13} aria-label="Sent" /> : null}</p>
                        {message.failed ? <button type="button" onClick={() => void sendText(message.body, String(message.id))} disabled={busy} className="chat-retry">Retry message</button> : null}
                      </div>
                    </article>
                  </div>;
                })}</div>
              </div>)}
              {typingUserId ? <div className="chat-typing" aria-live="polite"><span className="chat-typing-dots"><i /><i /><i /></span><span>{typingName} is typing…</span></div> : null}
              <div ref={bottomAnchorRef} />
            </div> : <div className="chat-empty"><span><Inbox size={22} /></span><strong>No messages yet</strong><p>Start with the brief, timeline, and what a good outcome looks like.</p></div>}
          </ScrollArea>
          {showNewMsgPill ? <button type="button" onClick={scrollToBottom} className="chat-new-message-pill">↓ New message{unreadCount > 1 ? ` (${unreadCount})` : ""}</button> : null}
          {error ? <p role="alert" aria-live="polite" className="chat-error">{error}</p> : null}
          <p className="sr-only" aria-live="polite">{attachmentNotice}</p>
          {selectedAttachment ? <div className="chat-attachment-chip"><span className="truncate">{selectedAttachment.name} · {(selectedAttachment.size / 1024 / 1024).toFixed(1)} MB</span><button type="button" onClick={() => { uploadedAttachmentIdRef.current = null; setSelectedAttachment(null); setAttachmentNotice(""); }} aria-label="Remove attachment"><X size={15} /></button><p role="status">This file will be shared with the conversation.</p></div> : null}
          <form className="chat-composer" onSubmit={submit}>
            <label htmlFor="message-body" className="sr-only">Message</label>
            <label className="chat-attach-button" title="Attach a file" aria-label="Attach a file"><input type="file" className="sr-only" accept={ACCEPTED_ATTACHMENT_TYPES.join(",")} onChange={(e) => chooseAttachment(e.target.files?.[0])} /><Paperclip size={18} /></label>
            <input id="message-body" value={body} onChange={(e) => { setBody(e.target.value); sendTyping(); }} className="chat-composer-input" placeholder="Type a message" />
            <button type="submit" disabled={busy || (!body.trim() && !selectedAttachment)} className={`chat-send-button ${body.trim() || selectedAttachment ? "has-text" : ""}`} aria-label="Send message">{busy ? <span className="chat-send-spinner" /> : <ArrowUp size={19} />}</button>
          </form>
        </div>
      </div>
      <aside id="chat-details-panel" className={`chat-details-panel ${detailsOpen ? "is-open" : ""}`} aria-label="Conversation details" aria-hidden={!detailsOpen} inert={!detailsOpen}>
        <div className="chat-details-top"><span>DETAILS</span><button ref={detailsCloseRef} type="button" onClick={() => setDetailsOpen(false)} aria-label="Close conversation details"><X size={16} /></button></div>
        <div className="chat-details-profile"><span className="chat-details-avatar">{role === "brand" ? "C" : "B"}</span><h3>{role === "brand" ? "Creator" : "Brand"}</h3><p>Conversation participant</p></div>
        <section className="chat-details-card"><h4>About this conversation</h4><p>Keep your creative brief, feedback, and next steps together in this private thread.</p></section>
        <section className="chat-details-card"><div className="chat-detail-section-heading"><h4>Booking</h4><BriefcaseBusiness size={15} /></div>
          {booking ? <><div className="chat-booking-status"><span className={`chat-status-dot ${booking.status.toLowerCase()}`} />{booking.status.replaceAll("_", " ")}</div><strong className="chat-booking-amount">₹{Number(booking.amount).toLocaleString("en-IN")}</strong><p className="chat-thread-id">Thread {threadId}</p><Link href={`/${role}/bookings/${encodeURIComponent(threadId.replace("booking-", ""))}`} className="chat-view-booking">View booking <ChevronRight size={14} /></Link></> : <><p>No booking is linked to this thread.</p><p className="chat-thread-id">Thread {threadId}</p></>}
        </section>
        <section className="chat-details-card chat-details-settings"><h4>Conversation settings</h4><p><span>Notifications</span><span className="chat-setting-label">Managed in account settings</span></p><Link href={`/${role}/messages`}><span>All messages</span><ChevronRight size={15} /></Link></section>
        <div className="chat-details-foot">Shared workspace <span>·</span> Weave</div>
      </aside>
      {detailsOpen ? <button className="chat-details-scrim" type="button" onClick={() => setDetailsOpen(false)} aria-label="Close conversation details" tabIndex={-1} /> : null}
    </section>
  );
}
