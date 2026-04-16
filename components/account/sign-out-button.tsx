"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  label = "Odjavi se",
  variant = "outline",
  size = "sm",
  callbackUrl = "/",
}: {
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  callbackUrl?: string;
}) {
  return (
    <Button variant={variant} size={size} onClick={() => signOut({ callbackUrl })}>
      {label}
    </Button>
  );
}
