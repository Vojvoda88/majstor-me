"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({ userId, label = "Obriši korisnika" }: { userId: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Trajno obrisati ovog korisnika (majstora)? Sve povezane podatke će biti uklonjeni.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/handymen");
        router.refresh();
      } else {
        alert(data.error ?? "Greška");
      }
    } catch {
      alert("Greška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "..." : label}
    </Button>
  );
}
