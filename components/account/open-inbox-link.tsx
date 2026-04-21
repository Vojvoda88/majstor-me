import type { ReactNode } from "react";
import { getWebmailInboxLink } from "@/lib/webmail-url";
import { ExternalLink } from "lucide-react";

interface Props {
  email: string;
  variant?: "primary" | "secondary";
  className?: string;
  children?: ReactNode;
}

export function OpenInboxLink({ email, variant = "primary", className = "", children }: Props) {
  const link = getWebmailInboxLink(email);
  if (!link) return null;

  const base =
    variant === "primary"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d4ed8]"
      : "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50";

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${className}`}
    >
      {children ?? (
        <>
          <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
          Otvori {link.label} — kliknite ovdje
        </>
      )}
    </a>
  );
}
