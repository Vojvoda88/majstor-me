"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { REQUEST_CATEGORY_FALLBACK, REQUEST_CREATE_CATEGORY_CHOICES } from "@/lib/constants";
import { displayLabelForRequestCategory, getInternalCategory } from "@/lib/categories";

const CHOICE_SET = new Set(REQUEST_CREATE_CATEGORY_CHOICES as readonly string[]);

export function AdminRequestExtraCategoriesPanel({
  requestId,
  primaryCategory,
  initialExtras,
  canWrite,
  canDistribute,
  distributionBlockMessage,
}: {
  requestId: string;
  primaryCategory: string;
  initialExtras: readonly string[];
  canWrite: boolean;
  /** Zahtjev je u statusu gdje majstori smiju vidjeti lead (npr. DISTRIBUTED) */
  canDistribute: boolean;
  /** Kad je `canDistribute` false: srpski tekst zašto (iz servera). Kad je true: `null`. */
  distributionBlockMessage: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pick, setPick] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  const primaryCanonical = useMemo(
    () => (getInternalCategory(primaryCategory) ?? primaryCategory).trim(),
    [primaryCategory]
  );

  const addableOptions = useMemo(() => {
    const blocked = new Set<string>([primaryCanonical, primaryCategory.trim(), ...initialExtras]);
    return (REQUEST_CREATE_CATEGORY_CHOICES as readonly string[]).filter(
      (c) => c !== REQUEST_CATEGORY_FALLBACK && !blocked.has(c)
    );
  }, [primaryCanonical, primaryCategory, initialExtras]);

  const canPick = canWrite && canDistribute && addableOptions.length > 0 && !loading;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen || !canPick) {
      setMenuBox(null);
      return;
    }
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 4;
      const cap = 256;
      const spaceBelow = window.innerHeight - r.bottom - gap - 12;
      setMenuBox({
        top: r.bottom + gap,
        left: r.left,
        width: r.width,
        maxHeight: Math.max(120, Math.min(cap, spaceBelow)),
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [menuOpen, canPick]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const callApi = async (body: { action: "add" | "remove"; category: string }) => {
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/extra-distribution-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: { handymenNotified?: number };
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Zahtjev nije uspio");
      }
      if (body.action === "add" && typeof json.data?.handymenNotified === "number") {
        setOk(`Dodata kategorija; novi talas notifikacija: ${json.data.handymenNotified} majstor(a).`);
      } else {
        setOk("Sačuvano.");
      }
      setPick("");
      setMenuOpen(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onAdd = () => {
    const c = pick.trim();
    if (!c || !CHOICE_SET.has(c) || c === REQUEST_CATEGORY_FALLBACK) {
      setError("Izaberite kategoriju iz liste.");
      return;
    }
    void callApi({ action: "add", category: c });
  };

  const onRemove = (category: string) => {
    if (!confirm(`Ukloniti dodatnu kategoriju „${displayLabelForRequestCategory(category)}”?`)) return;
    void callApi({ action: "remove", category });
  };

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dodatne kategorije za obavještenja majstorima</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#64748B]">Nemate dozvolu za izmjene zahtjeva.</p>
          {initialExtras.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm">
              {initialExtras.map((c) => (
                <li key={c}>{displayLabelForRequestCategory(c)}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }

  const statusHint = !canDistribute
    ? (distributionBlockMessage ?? "Trenutno nije moguće slati dodatne kategorije.")
    : addableOptions.length === 0
      ? "Nema više kategorija za dodavanje (sve su već glavna ili dodatna)."
      : null;

  const pickControlTitle =
    !canDistribute
      ? (distributionBlockMessage ?? undefined)
      : addableOptions.length === 0
        ? "Nema više kategorija za izbor (glavna i dodatne pokrivaju sve)."
        : loading
          ? "Sačekajte da se završi slanje."
          : undefined;

  const dropdownPortal =
    mounted &&
    menuOpen &&
    canPick &&
    menuBox &&
    createPortal(
      <ul
        ref={listRef}
        role="listbox"
        style={{
          position: "fixed",
          top: menuBox.top,
          left: menuBox.left,
          width: menuBox.width,
          maxHeight: menuBox.maxHeight,
          zIndex: 200,
        }}
        className="overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
      >
        {addableOptions.map((c) => (
          <li key={c} role="option">
            <button
              type="button"
              className="w-full px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-100"
              onClick={() => {
                setPick(c);
                setMenuOpen(false);
                setError(null);
              }}
            >
              {displayLabelForRequestCategory(c)}
            </button>
          </li>
        ))}
      </ul>,
      document.body
    );

  return (
    <Card className="relative z-10">
      <CardHeader>
        <CardTitle className="text-lg">Dodatne kategorije za obavještenja majstorima</CardTitle>
        <p className="text-sm text-[#64748B]">
          Glavna kategorija zahtjeva ostaje <strong className="font-medium text-slate-800">{primaryCategory}</strong>.
          Ovdje ručno birate još jednu uslugu da <strong className="font-medium text-slate-800">dodatno</strong> obavijestite
          majstore u toj kategoriji. Nema automatskog povezivanja. Već obaviješteni majstori neće duplikat.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusHint && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{statusHint}</p>
        )}

        {initialExtras.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Aktivne dodatne</p>
            <ul className="space-y-2">
              {initialExtras.map((c) => (
                <li
                  key={c}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span>{displayLabelForRequestCategory(c)}</span>
                  <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => onRemove(c)}>
                    Ukloni iz liste
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Label id="extra-cat-label">Dodaj kategoriju</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div ref={menuRef} className="relative min-w-0 flex-1">
              <Button
                ref={triggerRef}
                type="button"
                variant="outline"
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                aria-labelledby="extra-cat-label"
                disabled={!canPick}
                title={pickControlTitle}
                className={cn(
                  "h-auto min-h-[44px] w-full justify-between px-3 py-2.5 text-left font-normal disabled:pointer-events-auto disabled:cursor-not-allowed",
                  !pick && "text-muted-foreground"
                )}
                onClick={() => canPick && setMenuOpen((o) => !o)}
              >
                <span className="truncate">
                  {pick ? displayLabelForRequestCategory(pick) : "— kliknite da izaberete kategoriju —"}
                </span>
                <span className="ml-2 shrink-0 text-slate-400" aria-hidden>
                  {menuOpen ? "▲" : "▼"}
                </span>
              </Button>
              {dropdownPortal}
            </div>
            <Button
              type="button"
              disabled={loading || !canDistribute || !pick}
              onClick={() => onAdd()}
              className="shrink-0"
            >
              {loading ? "Slanje…" : "Dodaj i obavijesti"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-emerald-700">{ok}</p>}
      </CardContent>
    </Card>
  );
}
