import Link from "next/link";
import { Logo } from "@/components/logo";
import { Stamp } from "@/components/stamp";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-teal-dark px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/entrar" className="flex items-center gap-3">
          <Logo />
          <span className="text-sm font-semibold tracking-[0.22em]">MÉTODO BILLINGS</span>
        </Link>
        <div>
          <p className="font-display text-5xl leading-tight">Anote o ciclo. Leia o corpo.</p>
          <p className="mt-4 max-w-md text-white/75">
            Selos, sensação e muco em um gráfico limpo — para o dia a dia, o PDF e o envio à sua caixa de entrada.
          </p>
          <div className="mt-10 flex gap-3">
            <Stamp type="MENSTRUATION" size="lg" />
            <Stamp type="DRY" size="lg" />
            <Stamp type="FERTILE" size="lg" />
            <Stamp type="INFERTILE" size="lg" />
            <Stamp type="SPOTTING" size="lg" />
          </div>
        </div>
        <p className="text-sm text-white/50">Apoio às anotações. Não substitui instrutora credenciada.</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="text-sm font-semibold tracking-[0.18em] text-teal">MÉTODO BILLINGS</span>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
