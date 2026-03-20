import Link from "next/link";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  referenceId: string | null;
  reason: string | null;
  createdAt: Date;
};

const TYPE_LABELS: Record<string, string> = {
  PURCHASE: "Kupovina",
  CONTACT_UNLOCK: "Uzimanje kontakta",
  REFUND: "Povrat kredita",
  ADMIN_ADD: "Dodano od admina",
  ADMIN_REMOVE: "Oduzeto od admina",
  PROMO_BONUS: "Promo bonus",
  BONUS: "Bonus",
  CORRECTION: "Korekcija",
};

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

function getReasonDisplay(txn: Transaction): string {
  if (txn.reason) return txn.reason;
  if (txn.type === "REFUND") return "Povrat zbog spam/zaobilaženja zahtjeva";
  if (txn.type === "CONTACT_UNLOCK") return "Uzimanje kontakta";
  if (txn.type === "PURCHASE") return "Kupovina paketa";
  return "";
}

export function CreditTransactionHistory({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-slate-500">Još nema transakcija.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-600">
            <th className="pb-2 pr-4 font-medium">Datum</th>
            <th className="pb-2 pr-4 font-medium">Tip</th>
            <th className="pb-2 pr-4 text-right font-medium">Promjena</th>
            <th className="pb-2 font-medium">Detalji</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr
              key={txn.id}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="py-3 pr-4 text-slate-600">
                {new Date(txn.createdAt).toLocaleDateString("sr", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-3 pr-4">{getTypeLabel(txn.type)}</td>
              <td className="py-3 pr-4 text-right">
                <span
                  className={
                    txn.amount >= 0
                      ? "font-medium text-emerald-600"
                      : "font-medium text-red-600"
                  }
                >
                  {txn.amount >= 0 ? "+" : ""}
                  {txn.amount} kredita
                </span>
              </td>
              <td className="py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-600">
                    {getReasonDisplay(txn)}
                  </span>
                  {txn.referenceId && (
                    <Link
                      href={`/request/${txn.referenceId}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Zahtjev →
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
