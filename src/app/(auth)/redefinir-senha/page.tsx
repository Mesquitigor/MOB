import Link from "next/link";
import { ResetForm } from "@/components/auth-forms";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-4xl text-teal-dark">Nova senha</h1>
      <p className="mt-2 mb-8 text-sm leading-relaxed text-muted">Defina a senha que será usada no próximo login.</p>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-sm text-stamp-red">Link inválido. Peça um novo envio.</p>
      )}
      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/recuperar-senha" className="text-teal-dark underline-offset-4 hover:underline">
          Pedir outro link
        </Link>
      </p>
    </div>
  );
}
