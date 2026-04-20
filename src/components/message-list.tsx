"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

type Conversation = {
  userId: string;
  name: string;
  lastMessage: string;
  lastAt: string;
  unread: boolean;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

type Props = {
  conversations: Conversation[];
  currentUserId: string;
};

export function MessageList({ conversations, currentUserId }: Props) {
  const locale = useLocale();
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedUser) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedUser!.userId}),and(sender_id.eq.${selectedUser!.userId},recipient_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      setMessages(data ?? []);

      // Mark unread messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", selectedUser!.userId)
        .eq("recipient_id", currentUserId)
        .is("read_at", null);
    }

    loadMessages();
  }, [selectedUser, currentUserId, supabase]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!selectedUser) return;

    const channel = supabase
      .channel(`messages-${selectedUser.userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${selectedUser.userId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.recipient_id === currentUserId) {
            setMessages((prev) => [...prev, msg]);
            // Mark as read immediately
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", msg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, currentUserId, supabase]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);

    const { data } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        recipient_id: selectedUser.userId,
        content: newMessage.trim(),
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data]);
    }
    setNewMessage("");
    setSending(false);
  }

  return (
    <div className="mt-6 flex h-[600px] rounded-2xl bg-surface border border-line shadow-sm overflow-hidden">
      {/* Conversation list */}
      <div className="w-80 border-r border-line overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.userId}
            onClick={() => setSelectedUser(conv)}
            className={`w-full px-4 py-4 text-left border-b border-line hover:bg-canvas transition-colors ${
              selectedUser?.userId === conv.userId ? "bg-brand-soft" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-brand-soft flex items-center justify-center text-sm font-semibold text-brand-ink">
                {conv.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink truncate">
                    {conv.name}
                  </p>
                  {conv.unread && (
                    <span className="h-2 w-2 rounded-full bg-brand-soft0" />
                  )}
                </div>
                <p className="text-xs text-ink-muted truncate">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-ink-soft text-sm">
            {locale === "es"
              ? "Selecciona una conversación"
              : "Select a conversation"}
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="border-b border-line px-6 py-3">
              <p className="font-medium text-ink">
                {selectedUser.name}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? "bg-brand text-surface"
                          : "bg-line/50 text-ink"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`mt-1 text-xs ${
                          isMine ? "text-brand-soft" : "text-ink-soft"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString(
                          locale === "es" ? "es-ES" : "en-GB",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="border-t border-line px-4 py-3 flex gap-3"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  locale === "es" ? "Escribe un mensaje..." : "Type a message..."
                }
                className="flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-sm focus:bg-surface focus:border-brand focus:ring-4 focus:ring-brand/25 focus:outline-none transition-all"
              />
              <Button
                type="submit"
                disabled={sending || !newMessage.trim()}
                size="sm"
                className="rounded-full"
              >
                {locale === "es" ? "Enviar" : "Send"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
