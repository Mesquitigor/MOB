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

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Ir para o conteúdo
      </a>
      <div className="flex min-h-dvh">
        <aside className="hidden w-[88px] shrink-0 flex-col items-center bg-teal-dark py-5 text-white md:flex">
          <Link href="/diario" aria-label="MOB, ir ao diário" className="mb-8">
            <Logo className="h-10 w-10" />
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
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition",
                    active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
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
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-lg font-semibold text-white md:hidden">
                {first}
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-teal text-lg font-semibold text-white md:flex">
                {first}
              </div>
              <div>
                <p className="font-display text-lg leading-tight text-teal-dark sm:text-xl">
                  Olá {name.split(" ")[0]}, bom te ver aqui.
                </p>
                <p className="text-sm text-muted">Anote à noite. Primeiro o que sente, depois o que vê.</p>
              </div>
            </div>
            <Link
              href="/configuracoes"
              className="hidden rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:border-teal/40 md:inline-flex"
            >
              Conta
            </Link>
          </header>
          <main id="conteudo" className="flex-1 px-4 pb-24 sm:px-8 md:pb-10">
            {children}
          </main>
        </div>
      </div>

      <nav
        aria-label="Principal móvel"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 py-2 backdrop-blur md:hidden"
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
                    "flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium",
                    active ? "text-teal" : "text-muted",
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
