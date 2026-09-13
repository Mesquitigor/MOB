import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(31,51,52,0.08)] sm:p-8">
      <h1 className="font-display text-3xl text-teal-dark">Entrar</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Use o e-mail e a senha do cadastro.</p>
      <LoginForm />
    </div>
  );
}
