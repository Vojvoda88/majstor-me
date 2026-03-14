import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Circle } from "lucide-react";
import type { OnboardingStep } from "@/lib/handyman-onboarding";

export function OnboardingBanner({
  percent,
  steps,
  className,
}: {
  percent: number;
  steps: OnboardingStep[];
  className?: string;
}) {
  if (percent >= 100) return null;

  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 ${className ?? ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-amber-900">Dovršite profil</h3>
          <p className="mt-1 text-sm text-amber-800">
            Kompletiran profil privlači više klijenata. {percent}% dovršeno.
          </p>
          <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <ul className="mt-3 space-y-1 text-sm text-amber-800">
            {steps
              .filter((s) => !s.done)
              .map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <Circle className="h-3.5 w-3.5 shrink-0" />
                  {s.label}
                </li>
              ))}
          </ul>
        </div>
        <Link href="/dashboard/handyman/profile" className="shrink-0">
          <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100">
            Ažuriraj profil
          </Button>
        </Link>
      </div>
    </div>
  );
}
