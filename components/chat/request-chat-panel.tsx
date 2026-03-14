"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  isMe: boolean;
};

export function RequestChatPanel({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch(`/api/conversations/${requestId}`);
    const json = await res.json();
    if (json.success && json.data?.messages) {
      setMessages(json.data.messages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    const res = await fetch(`/api/conversations/${requestId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed }),
    });
    const json = await res.json();
    setSending(false);
    if (json.success && json.data) {
      setMessages((prev) => [...prev, json.data]);
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Učitavanje razgovora...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 sm:py-2">
        <h4 className="font-medium text-slate-900">Razgovor</h4>
      </div>
      <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3 sm:max-h-64">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Nema poruka. Pošaljite prvu!</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:px-3 sm:py-2 ${
                  m.isMe
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <p>{m.content}</p>
                <p className={`mt-1 text-xs ${m.isMe ? "text-blue-100" : "text-slate-500"}`}>
                  {new Date(m.createdAt).toLocaleTimeString("sr", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 p-4 sm:p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napišite poruku..."
          maxLength={2000}
          disabled={sending}
          className="min-h-[48px] flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || !input.trim()}
          className="min-h-[48px] min-w-[48px] shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
