import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet } from "lucide-react";

type Props = {
  /** True kada je Stripe / online plaćanje podešeno */
  paymentOnline: boolean;
};

/**
 * Jasni CTA: online kupovina + aktivacija u kešu (ne sakriveno u tekstu).
 */
export function HandymanCreditsCtaBlock({ paymentOnline }: Props) {
  const onlineHref = paymentOnline
    ? "/dashboard/handyman/credits#online-paketi"
    : "/dashboard/handyman/credits#online-info";

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-slate-50 p-5 shadow-md md:p-6">
      <h2 className="font-display text-lg font-bold text-slate-900 md:text-xl">Dopuni kredite</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Krediti se dodaju na račun nakon uspješne uplate online ili kad potvrdimo uplatu u kešu / preko Pošte.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <Button asChild size="lg" className="w-full sm:min-h-[48px] sm:flex-1">
          <Link href={onlineHref} className="inline-flex items-center justify-center gap-2">
            <CreditCard className="h-5 w-5 shrink-0" aria-hidden />
            Kupi kredite
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full border-2 border-slate-300 bg-white sm:min-h-[48px] sm:flex-1">
          <Link
            href="/dashboard/handyman/credits/aktivacija-kes"
            className="inline-flex items-center justify-center gap-2"
          >
            <Wallet className="h-5 w-5 shrink-0" aria-hidden />
            Aktivacija u kešu
          </Link>
        </Button>
      </div>
      {!paymentOnline && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Kupovina karticom na sajtu uskoro — do tada su krediti dostupni preko aktivacije u kešu. Dugme „Kupi kredite“
          vodi na objašnjenje.
        </p>
      )}
    </div>
  );
}
