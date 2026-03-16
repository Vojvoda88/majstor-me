"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-[#F3F4F6] pb-20 pt-16">
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <ErrorState
          title="Nešto je pošlo po zlu"
          message="Došlo je do privremene greške pri učitavanju stranice. Pokušajte ponovo ili se vratite na početnu."
          onRetry={reset}
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            onClick={reset}
            className="h-11 px-6 text-sm font-semibold sm:h-12 sm:px-7"
          >
            Pokušaj ponovo
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="h-11 px-6 text-sm font-semibold text-[#0F172A] sm:h-12 sm:px-7"
            >
              Nazad na početnu
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
