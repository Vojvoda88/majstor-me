import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";

export function FeaturedMajstori() {
  return (
    <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E2E8F0] text-[#94A3B8]">
        <User className="h-8 w-8" />
      </div>
      <h3 className="font-semibold text-[#1E293B]">Budite dio zajednice</h3>
      <p className="mt-2 max-w-md mx-auto text-sm text-[#64748B]">
        Prijavite se kao korisnik da vidite dostupne majstore ili registrujte se kao majstor da budete ovdje.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link href="/register">
          <Button>Registruj se</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Prijava</Button>
        </Link>
      </div>
    </div>
  );
}
