import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const rows = await prisma.$queryRaw<
    { column_name: string }[]
  >`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'offers' AND column_name IN ('price_type_other_label','availability_window','included_in_price','extra_note') ORDER BY column_name`;
  console.log("offer columns:", rows.map((r) => r.column_name).join(", "));
  const enums = await prisma.$queryRaw<{ e: string }[]>`SELECT e.enumlabel AS e FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'PriceType' AND e.enumlabel IN ('DRUGO','PREGLED_PA_KONACNA') ORDER BY e`;
  console.log("PriceType samples:", enums.map((x) => x.e).join(", "));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
