import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { PasswordForm, ProfileForm } from "@/components/auth-forms";
import { getSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/entrar");

  return (
    <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-2">
      <section className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(31,51,52,0.08)]">
        <h1 className="font-display text-2xl text-teal-dark">Perfil</h1>
        <p className="mb-4 text-sm text-muted">O e-mail recebe os relatórios em PDF.</p>
        <ProfileForm name={session.name} email={session.email} />
      </section>
      <section className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(31,51,52,0.08)]">
        <h2 className="font-display text-2xl text-teal-dark">Senha</h2>
        <p className="mb-4 text-sm text-muted">A autenticação usa exatamente a senha cadastrada.</p>
        <PasswordForm />
        <form action={logoutAction} className="mt-6">
          <button type="submit" className="btn-ghost w-full">
            Sair
          </button>
        </form>
      </section>
    </div>
  );
}
