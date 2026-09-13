"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DayEditor } from "@/components/day-editor";
import { Stamp } from "@/components/stamp";
import { MUCUS_META, SENSATION_META, STAMP_META, type DayEntryView } from "@/lib/billings";
import { cn } from "@/lib/cn";
import { eachDate, formatDay } from "@/lib/dates";

export function CycleBoard({
  today,
  startDate,
  endDate,
  entries,
}: {
  today: string;
  startDate: string | null;
  endDate: string | null;
  entries: DayEntryView[];
}) {
  const byDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries],
  );
  const lastDate = endDate || today;
  const dates = startDate ? eachDate(startDate, lastDate > startDate ? lastDate : startDate) : [];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(today);

  const selectedEntry = byDate.get(selected) ?? null;
  const stats = {
    days: entries.length,
    fertile: entries.filter((entry) => entry.stamp === "FERTILE").length,
    relations: entries.filter((entry) => entry.intercourse).length,
    peak: entries.find((entry) => entry.peak)?.date,
  };

  function openDate(date: string) {
    setSelected(date);
    setOpen(true);
  }

  return (
    <>
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 py-6 sm:px-8">
          <div>
            <p className="text-sm text-muted">Ciclo atual</p>
            <h1 className="font-display text-3xl text-teal-dark">
              {startDate ? `Desde ${formatDay(startDate)}` : "Comece pelo dia de hoje"}
            </h1>
          </div>
          <button type="button" className="btn-pink" onClick={() => openDate(today)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Anotar hoje
          </button>
        </div>

        {dates.length ? (
          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Selos do ciclo">
              {dates.map((date, index) => {
                const entry = byDate.get(date);
                const isToday = date === today;
                return (
                  <button
                    key={date}
                    type="button"
                    role="listitem"
                    onClick={() => openDate(date)}
                    className={cn(
                      "flex w-14 shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5 text-center transition hover:bg-cream",
                      isToday && "bg-cream",
                    )}
                    aria-label={`${index + 1}, ${date}${entry ? `, ${STAMP_META[entry.stamp].label}` : ", sem anotação"}`}
                  >
                    <span className="text-[11px] font-semibold text-muted">{index + 1}</span>
                    {entry ? (
                      <Stamp type={entry.stamp} size="md" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-line text-line">
                        ·
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wide text-muted">
                      {formatDay(date)}
                    </span>
                    {entry?.peak ? (
                      <span className="text-[10px] font-bold text-pink">ÁPICE</span>
                    ) : entry?.intercourse ? (
                      <span className="text-[10px] text-teal">REL</span>
                    ) : (
                      <span className="h-3" />
                    )}
                  </button>
                );
              })}
            </div>

            <ul className="divide-y divide-line">
              {[...entries].reverse().map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => openDate(entry.date)}
                    className="flex w-full items-center gap-3 py-3 text-left hover:bg-cream/70"
                  >
                    <span className="w-6 text-center text-sm font-semibold text-muted">
                      {entry.cycleDay ?? "–"}
                    </span>
                    <Stamp type={entry.stamp} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold tracking-wide text-ink">
                        {STAMP_META[entry.stamp].short}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {detailLine(entry)}
                      </span>
                    </span>
                    <span className="text-xs font-medium uppercase text-muted">
                      {formatDay(entry.date)}
                    </span>
                    <span className="flex w-16 justify-end gap-2 text-[10px] font-bold text-muted">
                      {entry.intercourse ? <span>REL</span> : null}
                      {entry.peak ? <span className="text-pink">ÁPICE</span> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="px-6 py-14 text-center sm:px-8">
            <div className="mx-auto mb-4 flex justify-center gap-2">
              <Stamp type="DRY" />
              <Stamp type="FERTILE" />
              <Stamp type="MENSTRUATION" />
            </div>
            <p className="font-display text-2xl text-teal-dark">Nenhuma anotação ainda</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Um toque por dia. O gráfico se monta sozinho.
            </p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          <Stat label="Dias" value={stats.days} />
          <Stat label="Férteis" value={stats.fertile} />
          <Stat label="Ápice" value={stats.peak ? formatDay(stats.peak) : "—"} />
          <Stat label="Relações" value={stats.relations} />
        </dl>
      </section>

      {open ? (
        <DayEditor
          key={`${selected}-${selectedEntry?.id ?? "new"}`}
          open={open}
          date={selected}
          today={today}
          entry={selectedEntry}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function detailLine(entry: DayEntryView) {
  const parts = [
    entry.sensation ? SENSATION_META[entry.sensation].label : null,
    entry.mucus && entry.mucus !== "NONE" ? MUCUS_META[entry.mucus].label : null,
    entry.notes.trim() || null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Sem detalhes";
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-xl text-teal-dark">{value}</dd>
    </div>
  );
}
