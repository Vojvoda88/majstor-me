/**
 * Ponovni push majstorima na produkciji (VAPID).
 * U .env: PRODUCTION_URL=https://www.brzimajstor.me, CRON_SECRET=...
 *
 * Usage:
 *   npx tsx scripts/repush-production-handyman-request.ts [requestId]
 */
import { repushHandymanRequestNotifyOnProduction } from "./replay-production-admin-notify";

const REQUEST_ID = process.argv[2] ?? "cmppo2usp000m97y2t2n4ceau";

async function main() {
  const result = await repushHandymanRequestNotifyOnProduction({
    requestId: REQUEST_ID,
    onlyWithPush: true,
    pushOnly: true,
    cityFilter: "podgorica",
    reminderSuffix: "reminder-push2-20260529",
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
