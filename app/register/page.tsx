import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Registracija | Majstor.me",
  description: "Registrujte se kao korisnik ili majstor na Majstor.me",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <RegisterForm />
    </div>
  );
}
