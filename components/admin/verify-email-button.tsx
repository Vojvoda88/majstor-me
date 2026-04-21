"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function AdminVerifyEmailButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify-email`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Odobreno
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 disabled:opacity-50"
    >
      {loading ? "..." : "Odobri email"}
    </button>
  );
}
