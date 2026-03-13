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
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <ErrorState
        title="Došlo je do greške"
        message="Pokušajte osvježiti stranicu ili se vratite na početnu."
        onRetry={reset}
      />
      <Link href="/" className="mt-6">
        <Button variant="outline">Nazad na početnu</Button>
      </Link>
    </div>
  );
}
