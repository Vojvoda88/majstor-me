import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ModerationTabs } from "./moderation-tabs";
import { PendingRequestsList } from "./pending-requests-list";
import { PendingWorkersList } from "./pending-workers-list";
import { ReportedItemsList } from "./reported-items-list";
import { SpamList } from "./spam-list";

export const dynamic = "force-dynamic";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdminPermission("moderation");
  const params = await searchParams;
  const tab = params.tab ?? "requests";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Moderation Inbox</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Zahtjevi na čekanju, majstori, prijave i spam
        </p>
      </div>

      <ModerationTabs currentTab={tab} />

      {tab === "requests" && <PendingRequestsList />}
      {tab === "workers" && <PendingWorkersList />}
      {tab === "reports" && <ReportedItemsList />}
      {tab === "spam" && <SpamList />}
    </div>
  );
}
