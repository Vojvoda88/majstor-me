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
  const [fetchError, setFetchError] = useState(false);
  const [liveBanner, setLiveBanner] = useState<Notification | null>(null);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const firstLoadRef = useRef(true);
  const latestIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=15", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (json.success && json.data) {
        setFetchError(false);
        const incoming = (json.data.notifications ?? []) as Notification[];
        setNotifications(incoming);
        setUnreadCount(json.data.unreadCount ?? 0);

        const latest = incoming[0];
        if (latest?.id) {
          if (firstLoadRef.current) {
            latestIdRef.current = latest.id;
            firstLoadRef.current = false;
          } else if (latestIdRef.current && latest.id !== latestIdRef.current) {
            // Obična live notifikacija u-app (fallback kad push ne stigne na uređaj).
            setLiveBanner(latest);
            latestIdRef.current = latest.id;
          } else if (!latestIdRef.current) {
            latestIdRef.current = latest.id;
          }
        }
      } else if (!opts?.silent) {
        setFetchError(true);
      }
    } catch {
      if (!opts?.silent) setFetchError(true);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void fetchNotifications({ silent: true });
      }
    };
    const id = window.setInterval(tick, 15000);
    const onVisibility = () => tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchNotifications]);

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
            void fetchNotifications();
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
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <Bell className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">Greška pri učitavanju</p>
                  <button
                    type="button"
                    onClick={() => void fetchNotifications()}
                    className="mt-1 text-xs font-medium text-blue-600 hover:underline"
                  >
                    Pokušaj ponovo
                  </button>
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
      {liveBanner && !open && (
        <div className="fixed right-3 top-[max(4rem,env(safe-area-inset-top)+3.25rem)] z-[130] w-[min(92vw,23rem)] rounded-xl border border-blue-200 bg-white p-3 shadow-xl">
          <p className="text-sm font-semibold text-slate-900">{liveBanner.title}</p>
          {liveBanner.body ? <p className="mt-1 text-sm text-slate-600">{liveBanner.body}</p> : null}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
              onClick={() => setLiveBanner(null)}
            >
              Zatvori
            </button>
            <Link
              href={liveBanner.link ?? "#"}
              onClick={() => {
                setLiveBanner(null);
                setOpen(false);
              }}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Otvori
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
