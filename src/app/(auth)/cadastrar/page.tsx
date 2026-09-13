import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-4xl text-teal-dark">Criar conta</h1>
      <p className="mt-2 mb-8 text-sm leading-relaxed text-muted">Nome, e-mail e senha. Sem confirmação de e-mail.</p>
      <RegisterForm />
      <p className="mt-8 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-teal-dark underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
