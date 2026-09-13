import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-4xl text-teal-dark">Entrar</h1>
      <p className="mt-2 mb-8 text-sm leading-relaxed text-muted">Use o e-mail e a senha do cadastro.</p>
      <LoginForm />
    </div>
  );
}
