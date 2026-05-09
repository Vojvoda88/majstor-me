import { requireAdminPermission } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { logAdminSsrFatal, prismaErrorCode } from "@/lib/admin/admin-ssr-params";
import { resolveModerationTab } from "@/lib/admin/moderation-tab";
import { ModerationTabs } from "./moderation-tabs";
import { PendingRequestsList } from "./pending-requests-list";
import { PendingWorkersList } from "./pending-workers-list";
import { ReportedItemsList } from "./reported-items-list";
import { SpamList } from "./spam-list";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const { adminRole } = await requireAdminPermission("moderation");

  let tab: Awaited<ReturnType<typeof resolveModerationTab>>;
  try {
    tab = await resolveModerationTab(searchParams);
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logAdminSsrFatal("[AdminModerationSSR]", "resolveModerationTab", {}, err);
    return (
      <AdminRouteLoadError
        routeTitle="Moderacija"
        cardTitle="Ne možemo učitati tab parametar"
        logPrefix="[AdminModerationSSR]"
        message={e.message}
        code={prismaErrorCode(err)}
        snapshot={{}}
        resetHref="/admin/moderation"
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Moderacija"
        description="Zahtjevi na čekanju, majstori, prijave i spam"
      />

      <ModerationTabs currentTab={tab} />

      {tab === "requests" && (
        <PendingRequestsList
          canWriteRequests={hasPermission(adminRole, "requests_write")}
          canTrustSafety={hasPermission(adminRole, "trust_safety")}
        />
      )}
      {tab === "workers" && <PendingWorkersList canWriteWorkers={hasPermission(adminRole, "workers_write")} />}
      {tab === "reports" && <ReportedItemsList />}
      {tab === "spam" && <SpamList />}
    </div>
  );
}
