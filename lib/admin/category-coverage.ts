import type { PrismaClient } from "@prisma/client";
import { ACTIVE_INTERNAL_CATEGORY_NAMES } from "@/lib/categories";
import { isUserExcludedFromPublicHandymanSurfaces } from "@/lib/demo-email";

type CategoryCoverageRow = {
  category: string;
  registered: number;
  active: number;
  publicVisible: number;
};

function normalizeCategoryName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getOfficialCategoryAliases(officialCategory: string): string[] {
  const norm = normalizeCategoryName(officialCategory);
  const aliases = new Set<string>([norm]);

  if (norm === "moler") aliases.add("moler gipsar");
  if (norm === "gipsar") {
    aliases.add("moler gipsar");
    aliases.add("gipsani radovi");
  }
  if (norm === "sitni kucni poslovi") {
    aliases.add("sitne kucne popravke");
    aliases.add("moler sitne kucne popravke");
  }
  if (norm === "grubi gradevinski radovi") aliases.add("gradevinski radovi");
  if (norm === "ciscenje") aliases.add("dubinsko ciscenje");

  return Array.from(aliases);
}

export async function getOfficialCategoryCoverage(
  prisma: PrismaClient
): Promise<CategoryCoverageRow[]> {
  const workerCategories = await prisma.workerCategory.findMany({
    select: {
      category: { select: { name: true } },
      worker: {
        select: {
          userId: true,
          workerStatus: true,
          user: {
            select: {
              role: true,
              email: true,
              name: true,
              bannedAt: true,
              suspendedAt: true,
            },
          },
        },
      },
    },
  });

  const rows: CategoryCoverageRow[] = [];

  for (const officialCategory of ACTIVE_INTERNAL_CATEGORY_NAMES) {
    const aliases = new Set(getOfficialCategoryAliases(officialCategory));
    const matching = workerCategories.filter((row) =>
      aliases.has(normalizeCategoryName(row.category.name))
    );

    const registered = new Set<string>();
    const active = new Set<string>();
    const publicVisible = new Set<string>();

    for (const row of matching) {
      if (row.worker.user.role !== "HANDYMAN") continue;

      registered.add(row.worker.userId);

      const isActiveNow =
        row.worker.workerStatus === "ACTIVE" &&
        !row.worker.user.bannedAt &&
        !row.worker.user.suspendedAt;
      if (!isActiveNow) continue;

      active.add(row.worker.userId);

      if (
        !isUserExcludedFromPublicHandymanSurfaces(
          row.worker.user.email,
          row.worker.user.name
        )
      ) {
        publicVisible.add(row.worker.userId);
      }
    }

    rows.push({
      category: officialCategory,
      registered: registered.size,
      active: active.size,
      publicVisible: publicVisible.size,
    });
  }

  return rows;
}
