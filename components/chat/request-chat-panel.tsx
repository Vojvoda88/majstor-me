"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
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
    <div className="flex max-h-[60vh] flex-col overflow-hidden rounded-[20px] border border-[#E7EDF5] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:max-h-[28rem]">
      <div className="shrink-0 border-b border-[#E2E8F0] px-4 py-3">
        <h4 className="font-semibold text-[#0F172A]">Razgovor</h4>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">Nema poruka. Pošaljite prvu!</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-[18px] px-4 py-3 text-[15px] ${
                    m.isMe
                      ? "bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white"
                      : "bg-white border border-[#E2E8F0] text-[#0F172A] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
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
      </div>
      <form
        onSubmit={sendMessage}
        className="shrink-0 border-t border-[#E2E8F0] bg-[rgba(255,255,255,0.92)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[16px]"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Napišite poruku..."
            maxLength={2000}
            disabled={sending}
            className="min-h-[48px] flex-1"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
