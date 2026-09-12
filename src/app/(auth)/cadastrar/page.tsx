import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(31,51,52,0.08)] sm:p-8">
      <h1 className="font-display text-3xl text-teal-dark">Criar conta</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Nome, e-mail e senha. Sem confirmação de e-mail.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-teal underline-offset-2 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
