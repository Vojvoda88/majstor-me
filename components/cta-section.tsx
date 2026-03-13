import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-12 lg:py-16 bg-[#F8FAFC]">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-6">
          Spremni da krenete?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/request/create"
            className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 py-3.5 rounded-full font-medium transition-colors shadow-lg inline-block text-center"
          >
            Objavi zahtjev
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#0F172A] border border-[#E2E8F0] px-8 py-3.5 rounded-full font-medium transition-colors inline-block text-center"
          >
            Registruj se besplatno
          </Link>
        </div>
      </div>
    </section>
  );
}
