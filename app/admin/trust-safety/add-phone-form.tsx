"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddPhoneForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blacklist/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setPhone("");
        setReason("");
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
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Telefon</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+382 69 123 456"
          className="w-40"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Razlog (opciono)</label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Spam"
          className="w-32"
        />
      </div>
      <Button type="submit" disabled={loading || !phone.trim()}>
        Blacklist
      </Button>
    </form>
  );
}
