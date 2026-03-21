import { AppProviders } from "@/app/app-providers";

/**
 * SessionProvider je već u root layoutu (app/layout.tsx). Dupli <Providers> ovdje
 * udvostručuje next-auth context — SiteHeader na /request/[id] može ostati bez sesije.
 */
export default function RequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProviders>{children}</AppProviders>;
}
