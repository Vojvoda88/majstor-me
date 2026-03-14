"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

type Offer = {
  id: string;
  handyman: { name: string };
};

export function RequestDetailClient({
  requestId,
  acceptedOffer,
  sessionUserId,
  showReviewForm = false,
}: {
  requestId: string;
  acceptedOffer: Offer;
  sessionUserId: string;
  showReviewForm?: boolean;
}) {
  const router = useRouter();

  if (showReviewForm) {
    return (
      <ReviewForm requestId={requestId} handymanName={acceptedOffer.handyman.name} />
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Majstor: {acceptedOffer.handyman.name}
      </p>
      <CompleteJobButton requestId={requestId} />
    </div>
  );
}

function CompleteJobButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <div>
      {mutation.error && <p className="mb-2 text-sm text-destructive">{mutation.error.message}</p>}
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Čuvanje..." : "Označi posao završenim"}
      </Button>
    </div>
  );
}

function ReviewForm({ requestId, handymanName }: { requestId: string; handymanName: string }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5 },
  });

  const mutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, ...data }),
      });
      const json = await res.json();
      const msg = typeof json?.error === "string" ? json.error : "Greška pri ostavljanju recenzije";
      if (!json?.success) throw new Error(msg);
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      {mutation.error && <div className="form-error">{mutation.error.message}</div>}
      <div>
        <Label>Ocjena (1-5)</Label>
        <select
          className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
          {...register("rating", { valueAsNumber: true })}
          onChange={(e) => setValue("rating", parseInt(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} ★</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Komentar (opciono)</Label>
        <Textarea {...register("comment")} className="mt-2" rows={3} maxLength={1000} placeholder="Opcionalno (max 1000 znakova)" />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Šaljem..." : "Ostavite recenziju"}
      </Button>
    </form>
  );
}
