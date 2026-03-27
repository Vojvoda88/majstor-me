"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch("/api/notifications?limit=15");
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

  const computePanelStyle = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gutter = 12;
    const isMobile = vw < 640;
    const width = isMobile ? Math.min(vw - gutter * 2, 420) : 320;
    const top = Math.min(rect.bottom + 10, vh - 220);
    const idealLeft = rect.right - width;
    const left = Math.max(gutter, Math.min(idealLeft, vw - width - gutter));
    const maxHeight = Math.max(220, vh - top - gutter);

    setPanelStyle({ top, left, width, maxHeight });
  }, []);

  useEffect(() => {
    if (!open) return;
    computePanelStyle();
    const onChange = () => computePanelStyle();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [computePanelStyle, open]);

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
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            fetchNotifications();
            computePanelStyle();
          }
        }}
        className="relative h-10 min-h-[44px] w-10"
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
            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="fixed z-50 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.2)]"
            style={{
              top: panelStyle?.top ?? 68,
              left: panelStyle?.left ?? 12,
              width: panelStyle?.width ?? 320,
              maxHeight: panelStyle?.maxHeight ?? 420,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <span className="text-sm font-semibold tracking-tight text-slate-900">Notifikacije</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                >
                  Označi sve kao pročitano
                </button>
              )}
            </div>
            <div
              className="overflow-y-auto overscroll-contain p-1.5"
              style={{ maxHeight: Math.max(160, (panelStyle?.maxHeight ?? 420) - 52) }}
            >
              {loading ? (
                <div className="p-5 text-center text-sm text-slate-500">
                  Učitavanje...
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <Bell className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">Nema notifikacija</p>
                  <p className="text-xs text-slate-400">
                    Obavještenja ćete dobiti kad dobijete ponudu ili novu poruku
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={(e) => {
                      if (!n.link) e.preventDefault();
                      if (!n.read) markAsRead(n.id);
                      setOpen(false);
                    }}
                    className={`block min-h-[56px] rounded-xl px-3.5 py-3 text-left transition hover:bg-slate-50 ${
                      !n.read ? "bg-blue-50/70" : ""
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
