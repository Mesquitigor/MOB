"use client";

import { useMemo, useState } from "react";
import { DayEditor } from "@/components/day-editor";
import { feltLabel, seenLabel, type DayEntryView } from "@/lib/billings";
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

  function openDate(date: string) {
    setSelected(date);
    setOpen(true);
  }

  const rows = [...entries].reverse();

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
            Anotar hoje
          </button>
        </div>

        {dates.length ? (
          <div className="px-6 py-6 sm:px-8">
            <div className="flex gap-1 overflow-x-auto pb-5" role="list" aria-label="Dia do ciclo">
              {dates.map((date, index) => {
                const day = index + 1;
                const isToday = date === today;
                const hasEntry = byDate.has(date);
                return (
                  <button
                    key={date}
                    type="button"
                    role="listitem"
                    onClick={() => openDate(date)}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm transition",
                      isToday
                        ? "bg-teal text-white"
                        : hasEntry
                          ? "bg-cream text-ink hover:bg-cream"
                          : "text-muted hover:bg-cream",
                    )}
                    aria-label={`Dia ${day} do ciclo, ${formatDay(date)}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {rows.length ? (
              <div>
                <div
                  className="hidden border-b border-line pb-3 text-sm text-muted sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1fr)_6rem] sm:gap-6"
                  aria-hidden="true"
                >
                  <span>Dia</span>
                  <span>Sinto</span>
                  <span>Vejo</span>
                  <span>Relação</span>
                </div>
                <ul className="divide-y divide-line">
                  {rows.map((entry) => {
                    const felt = feltLabel(entry.sensation);
                    const seen = seenLabel(entry.mucus);
                    const relation = entry.intercourse ? "Sim" : "Não";
                    const cycleLabel = entry.cycleDay ? `Dia ${entry.cycleDay}` : formatDay(entry.date);
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => openDate(entry.date)}
                          className="grid w-full grid-cols-1 gap-2 py-5 text-left hover:bg-cream/70 sm:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1fr)_6rem] sm:items-baseline sm:gap-6"
                        >
                          <span>
                            <span className="block font-display text-xl text-teal-dark">{cycleLabel}</span>
                            {entry.cycleDay ? (
                              <span className="block text-sm text-muted">{formatDay(entry.date)}</span>
                            ) : null}
                          </span>
                          <span className="text-base text-ink">
                            <span className="mr-2 text-sm text-muted sm:hidden">Sinto</span>
                            {felt}
                          </span>
                          <span className="text-base text-ink">
                            <span className="mr-2 text-sm text-muted sm:hidden">Vejo</span>
                            {seen}
                          </span>
                          <span className="text-base text-ink">
                            <span className="mr-2 text-sm text-muted sm:hidden">Relação</span>
                            {relation}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="py-10 text-center text-muted">
                Toque num dia e anote o que sentiu, o que viu e se houve relação.
              </p>
            )}
          </div>
        ) : (
          <div className="px-6 py-14 text-center sm:px-8">
            <p className="font-display text-2xl text-teal-dark">Nenhuma anotação ainda</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Cada dia leva o que você sente, o que você vê e se houve relação.
            </p>
          </div>
        )}
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
