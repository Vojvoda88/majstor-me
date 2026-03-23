import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { hashEmailVerificationToken } from "@/lib/email-verification-token";
import { SiteHeaderSimple } from "@/components/layout/site-header-simple";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-page">
      <SiteHeaderSimple />
      <div className="mx-auto max-w-md px-4 py-16 text-center">{children}</div>
    </div>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token: raw } = await searchParams;
  const token = raw?.trim() ?? "";

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-slate-900">Link nije važeći</h1>
        <p className="mt-3 text-slate-600">Link za potvrdu nije ispravan ili je nepotpun.</p>
        <Button asChild className="mt-8">
          <Link href="/login">Na prijavu</Link>
        </Button>
      </Shell>
    );
  }

  const plain = token.toLowerCase();
  const hash = hashEmailVerificationToken(plain);
  const { prisma } = await import("@/lib/db");

  const user = await prisma.user.findFirst({
    where: { emailVerificationTokenHash: hash },
  });

  if (!user) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-slate-900">Link nije važeći</h1>
        <p className="mt-3 text-slate-600">Ovaj link više nije važeći ili nije ispravan.</p>
        <Button asChild className="mt-8">
          <Link href="/login">Na prijavu</Link>
        </Button>
      </Shell>
    );
  }

  if (user.emailVerified) {
    redirect("/login?verified=1");
  }

  if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < new Date()) {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-slate-900">Link je istekao</h1>
        <p className="mt-3 text-slate-600">
          Pošaljite novi link za potvrdu sa stranice za prijavu (Pošalji ponovo link za potvrdu).
        </p>
        <Button asChild className="mt-8">
          <Link href="/login">Na prijavu</Link>
        </Button>
      </Shell>
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
  });

  redirect("/login?verified=1");
}
