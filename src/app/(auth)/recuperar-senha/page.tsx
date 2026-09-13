import Link from "next/link";
import { ForgotForm } from "@/components/auth-forms";

export default function ForgotPage() {
  return (
    <div>
      <h1 className="font-display text-4xl text-teal-dark">Redefinir senha</h1>
      <p className="mt-2 mb-8 text-sm leading-relaxed text-muted">Enviamos um link para o e-mail cadastrado.</p>
      <ForgotForm />
      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/entrar" className="text-teal-dark underline-offset-4 hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
