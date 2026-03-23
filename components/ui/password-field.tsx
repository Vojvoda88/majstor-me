"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Input>, "type"> & {
  id: string;
  /** "current-password" za login, "new-password" za registraciju */
  autoComplete?: string;
};

/**
 * Polje za lozinku sa Prikaži/Sakrij — isti obrazac na login/register.
 */
export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { className, id, autoComplete = "current-password", ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className={cn("pr-11", className)}
        {...rest}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sakrij lozinku" : "Prikaži lozinku"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4 shrink-0" aria-hidden /> : <Eye className="h-4 w-4 shrink-0" aria-hidden />}
      </button>
    </div>
  );
});
