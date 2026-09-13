import Link from "next/link";
import { Logo } from "@/components/logo";
import { Stamp } from "@/components/stamp";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between px-14 py-14 lg:flex">
        <Link href="/entrar" className="flex items-center gap-3">
          <Logo />
          <span className="text-sm font-medium text-teal-dark">Método Billings</span>
        </Link>
        <div className="max-w-md">
          <p className="font-display text-6xl leading-[1.05] text-teal-dark">Anote o ciclo. Leia o corpo.</p>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
            Um gráfico limpo do que você sente e vê — para o dia, o PDF e o envio ao seu e-mail.
          </p>
          <div className="mt-12 flex gap-2">
            <Stamp type="MENSTRUATION" size="md" />
            <Stamp type="DRY" size="md" />
            <Stamp type="FERTILE" size="md" />
            <Stamp type="INFERTILE" size="md" />
            <Stamp type="SPOTTING" size="md" />
          </div>
        </div>
        <p className="text-sm text-muted">Apoio às anotações. Não substitui instrutora credenciada.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="text-sm font-medium text-teal-dark">Método Billings</span>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
