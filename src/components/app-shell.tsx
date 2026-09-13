"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, FileDown, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/diario", label: "Diário", icon: CalendarDays },
  { href: "/exportar", label: "Exportar", icon: FileDown },
  { href: "/guia", label: "Guia", icon: BookOpen },
  { href: "/configuracoes", label: "Conta", icon: Settings },
];

export function AppShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const first = name.trim().charAt(0).toUpperCase() || "M";
  const firstName = name.split(" ")[0];

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Ir para o conteúdo
      </a>
      <div className="flex min-h-dvh">
        <aside className="hidden w-24 shrink-0 flex-col items-center border-r border-line/80 bg-white/70 py-6 md:flex">
          <Link href="/diario" aria-label="MOB, ir ao diário" className="mb-10">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="flex flex-1 flex-col items-center gap-2">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition",
                    active ? "bg-teal text-white" : "text-muted hover:bg-cream hover:text-ink",
                  )}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-12 w-12 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-ink"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 px-5 py-6 sm:px-10">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/15 text-lg font-medium text-teal-dark">
                {first}
              </div>
              <div>
                <p className="font-display text-2xl text-teal-dark">Olá, {firstName}.</p>
                <p className="text-sm leading-relaxed text-muted">Anote à noite. Primeiro o que sente, depois o que vê.</p>
              </div>
            </div>
            <Link
              href="/configuracoes"
              className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm text-ink hover:border-teal/40 md:inline-flex"
            >
              Conta
            </Link>
          </header>
          <main id="conteudo" className="flex-1 px-5 pb-24 sm:px-10 md:pb-12">
            {children}
          </main>
        </div>
      </div>

      <nav
        aria-label="Principal móvel"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 px-3 py-2 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-full px-2 py-1.5 text-xs",
                    active ? "text-teal-dark" : "text-muted",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
