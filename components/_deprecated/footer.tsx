import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold">
            <span className="text-[#2563EB]">Majstor</span>
            <span className="text-[#0F172A]">.me</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-[#475569] hover:text-[#0F172A] transition-colors">
              O nama
            </Link>
            <Link href="#" className="text-[#475569] hover:text-[#0F172A] transition-colors">
              Kontakt
            </Link>
            <Link href="#" className="text-[#475569] hover:text-[#0F172A] transition-colors">
              Uslovi korištenja
            </Link>
            <Link href="#" className="text-[#475569] hover:text-[#0F172A] transition-colors">
              Privatnost
            </Link>
          </div>
          <p className="text-[#475569] text-sm">© {new Date().getFullYear()} BrziMajstor.ME</p>
        </div>
      </div>
    </footer>
  );
}
