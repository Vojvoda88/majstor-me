/**
 * Uski Prisma `select` za admin SSR — smanjuje P2022 kad produkcijska baza zaostaje za schema.prisma
 * (cijeli `include` bez select-a na root modelu vuče sve kolone).
 */

/** Liste zahtjeva (requests page, moderation pending, spam) */
export const ADMIN_REQUEST_LIST_SELECT = {
  id: true,
  adminStatus: true,
  requesterName: true,
  requesterPhone: true,
  city: true,
  category: true,
  title: true,
  description: true,
  createdAt: true,
  status: true,
  user: { select: { name: true } },
  _count: { select: { offers: true, contactUnlocks: true } },
} as const;

/** Moderation request liste (pending/spam) — bez suvišnih relacija i countova. */
export const ADMIN_REQUEST_MODERATION_LIST_SELECT = {
  id: true,
  requesterName: true,
  requesterPhone: true,
  city: true,
  category: true,
  title: true,
  description: true,
  createdAt: true,
  user: { select: { name: true } },
} as const;

/** Lista majstora /admin/handymen */
export const ADMIN_HANDYMAN_LIST_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  city: true,
  suspendedAt: true,
  bannedAt: true,
  createdAt: true,
  handymanProfile: {
    select: {
      cities: true,
      workerStatus: true,
      verifiedStatus: true,
      creditsBalance: true,
      workerCategories: { select: { id: true } },
    },
  },
  _count: {
    select: { offers: true },
  },
} as const;

/** Moderation → majstori na čekanju (uža lista) */
export const ADMIN_HANDYMAN_MODERATION_LIST_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  city: true,
  createdAt: true,
  handymanProfile: {
    select: {
      workerCategories: {
        select: {
          category: { select: { name: true } },
        },
      },
    },
  },
} as const;

/** Detalj zahtjeva /admin/requests/[id] */
export const ADMIN_REQUEST_DETAIL_SELECT = {
  id: true,
  userId: true,
  category: true,
  subcategory: true,
  title: true,
  description: true,
  city: true,
  address: true,
  urgency: true,
  status: true,
  photos: true,
  requesterName: true,
  requesterPhone: true,
  requesterEmail: true,
  adminStatus: true,
  deletedAt: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
  offers: {
    select: {
      id: true,
      handymanId: true,
      status: true,
      handyman: { select: { id: true, name: true } },
    },
  },
  contactUnlocks: {
    select: {
      id: true,
      handymanId: true,
      handyman: { select: { id: true, name: true } },
    },
  },
} as const;

/** Moderation → prijave */
export const ADMIN_REPORT_LIST_SELECT = {
  id: true,
  type: true,
  reporterId: true,
  reportedUserId: true,
  requestId: true,
  description: true,
  status: true,
  createdAt: true,
  reporter: { select: { id: true, name: true, email: true } },
  reportedUser: { select: { id: true, name: true, email: true, role: true } },
  request: { select: { id: true, category: true, city: true } },
} as const;
