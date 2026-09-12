"use client";

import { useMemo, useState } from "react";
import { Download, Mail } from "lucide-react";
import { endOfMonthISO, endOfYearISO, startOfMonthISO, startOfYearISO } from "@/lib/dates";

type Preset = "today" | "cycle" | "month" | "year" | "custom";

export function ExportPanel({
  today,
  cycleStart,
  cycleEnd,
  email,
}: {
  today: string;
  cycleStart: string | null;
  cycleEnd: string | null;
  email: string;
}) {
  const [preset, setPreset] = useState<Preset>("cycle");
  const [from, setFrom] = useState(cycleStart || today);
  const [to, setTo] = useState(cycleEnd || today);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState<"pdf" | "email" | null>(null);

  const range = useMemo(() => {
    if (preset === "today") return { from: today, to: today };
    if (preset === "cycle") return { from: cycleStart || today, to: cycleEnd || today };
    if (preset === "month") {
      const anchor = from || today;
      return { from: startOfMonthISO(anchor), to: endOfMonthISO(anchor) };
    }
    if (preset === "year") {
      const anchor = from || today;
      return { from: startOfYearISO(anchor), to: endOfYearISO(anchor) };
    }
    return { from, to };
  }, [preset, from, to, today, cycleStart, cycleEnd]);

  function applyPreset(next: Preset) {
    setPreset(next);
    setStatus("");
    if (next === "today") {
      setFrom(today);
      setTo(today);
    } else if (next === "cycle") {
      setFrom(cycleStart || today);
      setTo(cycleEnd || today);
    } else if (next === "month") {
      setFrom(startOfMonthISO(today));
      setTo(endOfMonthISO(today));
    } else if (next === "year") {
      setFrom(startOfYearISO(today));
      setTo(endOfYearISO(today));
    }
  }

  async function downloadPdf() {
    setBusy("pdf");
    setStatus("");
    try {
      const response = await fetch(`/api/export?from=${range.from}&to=${range.to}`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Não foi possível gerar o PDF.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mob-billings-${range.from}-a-${range.to}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("PDF baixado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao exportar.");
    } finally {
      setBusy(null);
    }
  }

  async function sendEmail() {
    setBusy("email");
    setStatus("");
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(range),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível enviar o e-mail.");
      }
      setStatus(`Relatório enviado para ${email}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao enviar.");
    } finally {
      setBusy(null);
    }
  }

  const presets: { id: Preset; label: string }[] = [
    { id: "today", label: "Hoje" },
    { id: "cycle", label: "Ciclo atual" },
    { id: "month", label: "Mês" },
    { id: "year", label: "Ano" },
    { id: "custom", label: "Livre" },
  ];

  return (
    <section className="max-w-xl rounded-3xl bg-white p-5 shadow-[0_20px_50px_rgba(31,51,52,0.08)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">Relatório</p>
      <h1 className="font-display text-3xl text-teal-dark">Exportar anotações</h1>
      <p className="mt-1 text-sm text-muted">PDF do período, ou envio direto para {email}.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => applyPreset(item.id)}
            className={
              preset === item.id
                ? "rounded-full bg-teal px-3 py-1.5 text-sm text-white"
                : "rounded-full border border-line px-3 py-1.5 text-sm hover:border-teal/40"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">De</span>
          <input
            type="date"
            className="input"
            value={range.from}
            onChange={(event) => {
              setPreset("custom");
              setFrom(event.target.value);
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Até</span>
          <input
            type="date"
            className="input"
            value={range.to}
            onChange={(event) => {
              setPreset("custom");
              setTo(event.target.value);
            }}
          />
        </label>
      </div>

      {status ? (
        <p className="mt-4 text-sm text-teal-dark" role="status">
          {status}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-pink flex-1" onClick={downloadPdf} disabled={Boolean(busy)}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {busy === "pdf" ? "Gerando..." : "Baixar PDF"}
        </button>
        <button type="button" className="btn-ghost flex-1" onClick={sendEmail} disabled={Boolean(busy)}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          {busy === "email" ? "Enviando..." : "Enviar ao meu e-mail"}
        </button>
      </div>
    </section>
  );
}
