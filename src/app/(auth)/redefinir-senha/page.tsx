import Link from "next/link";
import { ResetForm } from "@/components/auth-forms";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(31,51,52,0.08)] sm:p-8">
      <h1 className="font-display text-3xl text-teal-dark">Nova senha</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Defina a senha que será usada no próximo login.</p>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-sm text-stamp-red">Link inválido. Peça um novo envio.</p>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/recuperar-senha" className="font-semibold text-teal underline-offset-2 hover:underline">
          Pedir outro link
        </Link>
      </p>
    </div>
  );
}
