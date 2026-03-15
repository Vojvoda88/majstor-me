import { AppProviders } from "@/app/app-providers";
import { Providers } from "@/app/providers";

export default function RequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AppProviders>{children}</AppProviders>
    </Providers>
  );
}
