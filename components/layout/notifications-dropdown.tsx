"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications");
    const json = await res.json();
    if (json.success && json.data) {
      setNotifications(json.data.notifications ?? []);
      setUnreadCount(json.data.unreadCount ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
              <span className="font-semibold text-slate-900">Notifikacije</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Označi sve kao pročitano
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Učitavanje...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Nema notifikacija
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                      setOpen(false);
                    }}
                    className={`block border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      !n.read ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <p className="font-medium text-slate-900">{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString("sr")}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
