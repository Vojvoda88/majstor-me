"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type AdminRole = "SUPER_ADMIN" | "OPERATIONS_ADMIN" | "MODERATION_ADMIN" | "FINANCE_ADMIN" | "SUPPORT_ADMIN" | "READ_ONLY";
type StaffRole = Exclude<AdminRole, "SUPER_ADMIN">;

type AdminItem = {
  id: string;
  email: string;
  name: string;
  adminRole: AdminRole;
  createdAt: string;
};

const STAFF_ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "OPERATIONS_ADMIN", label: "Operations admin" },
  { value: "MODERATION_ADMIN", label: "Moderation admin" },
  { value: "FINANCE_ADMIN", label: "Finance admin" },
  { value: "SUPPORT_ADMIN", label: "Support admin" },
  { value: "READ_ONLY", label: "Read only" },
];

export function AdminStaffManager({
  admins,
  currentUserId,
}: {
  admins: AdminItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [createLoading, setCreateLoading] = useState(false);
  const [rowLoadingId, setRowLoadingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminRole, setAdminRole] = useState<StaffRole>("OPERATIONS_ADMIN");

  const initialRoleDrafts = useMemo(() => {
    const map: Record<string, StaffRole> = {};
    for (const a of admins) {
      if (a.adminRole !== "SUPER_ADMIN") {
        map[a.id] = a.adminRole;
      }
    }
    return map;
  }, [admins]);
  const [roleDraftById, setRoleDraftById] = useState<Record<string, StaffRole>>(initialRoleDrafts);

  useEffect(() => {
    setRoleDraftById(initialRoleDrafts);
  }, [initialRoleDrafts]);

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/users/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, adminRole }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Kreiranje admin naloga nije uspjelo.");
      }

      setStatus(json.created ? "Admin nalog je kreiran." : "Admin nalog je ažuriran.");
      setEmail("");
      setPassword("");
      setName("");
      setAdminRole("OPERATIONS_ADMIN");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  const onSaveRole = async (userId: string) => {
    setRowLoadingId(userId);
    setStatus(null);
    setError(null);
    try {
      const role = roleDraftById[userId];
      const res = await fetch(`/api/admin/users/${userId}/admin-access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminRole: role }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Promjena role nije uspjela.");
      }
      setStatus("Admin rola je ažurirana.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRowLoadingId(null);
    }
  };

  const onRevoke = async (userId: string) => {
    if (!window.confirm("Da li ste sigurni da želite ukloniti admin pristup ovom nalogu?")) return;

    setRowLoadingId(userId);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/admin-access`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Uklanjanje admin pristupa nije uspjelo.");
      }
      setStatus("Admin pristup je uklonjen.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRowLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="staff-admin-email">Email</Label>
          <Input
            id="staff-admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="npr. operativa@brzimajstor.me"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="staff-admin-password">Šifra</Label>
          <Input
            id="staff-admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="min 8 karaktera"
            minLength={8}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="staff-admin-name">Ime</Label>
          <Input
            id="staff-admin-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ime i prezime"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="staff-admin-role">Admin rola</Label>
          <Select
            id="staff-admin-role"
            value={adminRole}
            onChange={(e) => setAdminRole(e.target.value as StaffRole)}
          >
            {STAFF_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" size="sm" disabled={createLoading}>
            {createLoading ? "Čuvanje..." : "Kreiraj / ažuriraj pod-admina"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Ime</th>
              <th className="px-3 py-2">Rola</th>
              <th className="px-3 py-2">Kreiran</th>
              <th className="px-3 py-2">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isSelf = a.id === currentUserId;
              const isSuper = a.adminRole === "SUPER_ADMIN";
              const draftRole = roleDraftById[a.id] ?? "OPERATIONS_ADMIN";
              const busy = rowLoadingId === a.id;
              return (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{a.email}</td>
                  <td className="px-3 py-2">{a.name || "-"}</td>
                  <td className="px-3 py-2">
                    {isSuper ? (
                      <span className="font-semibold text-emerald-700">SUPER_ADMIN</span>
                    ) : (
                      <Select
                        value={draftRole}
                        onChange={(e) =>
                          setRoleDraftById((prev) => ({ ...prev, [a.id]: e.target.value as StaffRole }))
                        }
                      >
                        {STAFF_ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {new Date(a.createdAt).toLocaleDateString("sr")}
                  </td>
                  <td className="px-3 py-2">
                    {isSelf ? (
                      <span className="text-xs text-slate-500">Vaš nalog</span>
                    ) : (
                      <div className="flex gap-2">
                        {!isSuper && (
                          <Button size="sm" variant="outline" disabled={busy} onClick={() => onSaveRole(a.id)}>
                            Sačuvaj rolu
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" disabled={busy} onClick={() => onRevoke(a.id)}>
                          Ukloni pristup
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {status && <p className="text-sm text-emerald-700">{status}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
