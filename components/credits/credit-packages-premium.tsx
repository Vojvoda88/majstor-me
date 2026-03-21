import { getLeadsEstimate } from "@/lib/credit-packages";
import type { CreditPackage } from "@/lib/credit-packages";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { CreditsPurchaseButton } from "@/components/credits/credits-purchase-button";

type Props = {
  packages: CreditPackage[];
};

/**
 * Premium prikaz paketa — suptilan glow, jasan hijerarhija, bez agresivnih efekata.
 */
export function CreditPackagesPremium({ packages }: Props) {
  return (
    <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
      {packages.map((pkg) => {
        const popular = !!pkg.popular;
        const leads = getLeadsEstimate(pkg.credits);
        const leadsLabel =
          leads === 1 ? "Oko 1 kontakta po uobičajenoj cijeni" : `Oko ${leads} kontakata po uobičajenoj cijeni`;

        return (
          <div
            key={pkg.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-white p-6 transition-[box-shadow,transform] duration-300",
              popular
                ? "z-[1] border-amber-200/70 shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_12px_48px_-16px_rgba(37,99,235,0.28)] sm:scale-[1.02]"
                : "border-slate-200/90 shadow-[0_4px_28px_-12px_rgba(15,23,42,0.14)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(15,23,42,0.18)]"
            )}
          >
            {popular && (
              <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-100/90 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                Najbolja vrijednost
              </div>
            )}

            <div className="mt-2 flex flex-1 flex-col">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paket</p>
              <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight text-slate-900">
                {pkg.credits}{" "}
                <span className="text-2xl font-semibold text-slate-600">kredita</span>
              </p>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums text-slate-900">
                {pkg.priceEur.toFixed(2)}
                <span className="text-base font-semibold text-slate-600"> €</span>
              </p>
              {pkg.perCredit && <p className="mt-1 text-xs font-medium text-slate-500">{pkg.perCredit}</p>}
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{leadsLabel}</p>
            </div>

            <div className="mt-6">
              <CreditsPurchaseButton pkg={pkg} variant={popular ? "premium" : "default"} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
