"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/admin/permissions";
import type { AdminRole } from "@/lib/admin/permissions";

export function AdminHandymanActions({
  handymanId,
  adminRole,
  verifiedStatus,
  workerStatus,
  suspendedAt,
  bannedAt,
}: {
  handymanId: string;
  adminRole: AdminRole;
  verifiedStatus: string;
  workerStatus?: string;
  suspendedAt: Date | null;
  bannedAt: Date | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const canWrite = hasPermission(adminRole, "workers_write");

  const action = async (path: string, body?: object) => {
    if (!canWrite) return;
    setLoading(path);
    try {
      const res = await fetch(`/api/admin${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  if (!canWrite) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {workerStatus === "PENDING_REVIEW" && (
        <>
          <Button
            size="sm"
            variant="default"
            onClick={() => action(`/handymen/${handymanId}/approve`)}
            disabled={!!loading}
          >
            {loading === `/handymen/${handymanId}/approve` ? "Odobravanje..." : "Odobri profil"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => action(`/handymen/${handymanId}/reject`)}
            disabled={!!loading}
          >
            {loading === `/handymen/${handymanId}/reject` ? "Odbijanje..." : "Odbij profil"}
          </Button>
        </>
      )}
      {verifiedStatus !== "VERIFIED" && (
        <Button
          size="sm"
          variant="default"
          onClick={() => action(`/handymen/${handymanId}/verify`, { status: "VERIFIED" })}
          disabled={!!loading}
        >
          {loading === `/handymen/${handymanId}/verify` ? "Verifikacija..." : "Verifikuj nalog"}
        </Button>
      )}
      {verifiedStatus !== "REJECTED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => action(`/handymen/${handymanId}/verify`, { status: "REJECTED" })}
          disabled={!!loading}
        >
          Odbij verifikaciju
        </Button>
      )}
      {!suspendedAt && !bannedAt && (
        <Button
          size="sm"
          variant="outline"
          className="border-amber-500 text-amber-600 hover:bg-amber-50"
          onClick={() => action(`/handymen/${handymanId}/suspend`)}
          disabled={!!loading}
        >
          Suspenduj
        </Button>
      )}
      {suspendedAt && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => action(`/handymen/${handymanId}/unsuspend`)}
          disabled={!!loading}
        >
          Ukloni suspendovanje
        </Button>
      )}
      {!bannedAt && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => action(`/handymen/${handymanId}/ban`)}
          disabled={!!loading}
        >
          Zabrani nalog
        </Button>
      )}
      {(workerStatus === "BANNED" || bannedAt) && (
        <Button
          size="sm"
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => action(`/handymen/${handymanId}/unban`)}
          disabled={!!loading}
        >
          Ukloni zabranu
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const amt = prompt("Broj kredita (pozitivno=dodaj, negativno=oduzmi):");
          if (amt != null && amt !== "") {
            const n = parseInt(amt, 10);
            if (!isNaN(n) && n !== 0) {
              action(`/handymen/${handymanId}/credits`, { amount: n });
            }
          }
        }}
        disabled={!!loading}
      >
        Krediti
      </Button>
    </div>
  );
}
