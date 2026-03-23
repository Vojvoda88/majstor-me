/**
 * Prikaz kada je HandymanProfile.workerStatus = PENDING_REVIEW (default nakon registracije dok admin ne odobri).
 */
export function HandymanPendingReviewBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50/90 p-4 sm:p-5">
      <h3 className="font-semibold text-sky-950">Profil je na pregledu kod administratora</h3>
      <p className="mt-2 text-sm leading-relaxed text-sky-900">
        Prijava je primljena. Vaš profil je poslat na pregled. Bićete obaviješteni kada profil bude odobren ili ako bude
        potrebna dorada.
      </p>
    </div>
  );
}
