"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeleteMyAccount() {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Da li ste sigurni? Vaš nalog i svi povezani podaci će biti trajno obrisani. Ova akcija se ne može poništiti."
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await signOut({ callbackUrl: "/" });
        window.location.href = "/";
      } else {
        alert(data.error ?? "Greška");
      }
    } catch {
      alert("Greška pri brisanju");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-100 bg-red-50/30">
      <CardHeader>
        <CardTitle className="text-base text-[#0F172A]">Obriši moj nalog</CardTitle>
        <p className="text-sm text-[#64748B]">
          Trajno obrišite svoj nalog i sve povezane podatke. Nakon brisanja morat ćete se ponovo registrovati da biste koristili uslugu.
        </p>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Brisanje…" : "Obriši nalog"}
        </Button>
      </CardContent>
    </Card>
  );
}
