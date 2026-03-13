import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Prijava | Majstor.me",
  description: "Prijavite se na Majstor.me nalog",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
