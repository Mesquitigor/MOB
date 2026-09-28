"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const stripRef = useRef<HTMLDivElement>(null);

  function openDate(date: string) {
    setSelected(date);
    setOpen(true);
  }

  useEffect(() => {
    const active = stripRef.current?.querySelector<HTMLElement>("[data-today='true']");
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [dates, today]);

  const rows = [...entries].reverse();

  return (
    <>
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="text-sm text-muted">Ciclo atual</p>
            <h1 className="font-display text-3xl text-teal-dark">
              {startDate ? `Desde ${formatDay(startDate)}` : "Comece pelo dia de hoje"}
            </h1>
          </div>
          <button type="button" className="btn-pink w-full sm:w-auto" onClick={() => openDate(today)}>
            Anotar hoje
          </button>
        </div>

        {dates.length ? (
          <div className="px-5 py-6 sm:px-8">
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">Dia do ciclo</p>
                  <p className="text-sm text-muted">O círculo vinho é hoje. Os preenchidos já foram anotados.</p>
                </div>
              </div>
              <div
                ref={stripRef}
                className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible"
                role="list"
                aria-label="Dia do ciclo"
              >
                {dates.map((date, index) => {
                  const day = index + 1;
                  const isToday = date === today;
                  const hasEntry = byDate.has(date);
                  return (
                    <button
                      key={date}
                      type="button"
                      role="listitem"
                      data-today={isToday ? "true" : undefined}
                      aria-current={isToday ? "date" : undefined}
                      onClick={() => openDate(date)}
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-medium transition",
                        isToday
                          ? "bg-teal text-white"
                          : hasEntry
                            ? "bg-cream text-ink hover:bg-cream"
                            : "text-muted ring-1 ring-inset ring-line hover:bg-cream",
                      )}
                      aria-label={`Dia ${day} do ciclo, ${formatDay(date)}${isToday ? ", hoje" : ""}${hasEntry ? ", anotado" : ", sem anotação"}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {rows.length ? (
              <div>
                <h2 className="mb-3 text-sm font-medium text-ink">Anotações</h2>
                <ul className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-line">
                  {rows.map((entry) => (
                    <DayRow
                      key={entry.id}
                      entry={entry}
                      isToday={entry.date === today}
                      onOpen={() => openDate(entry.date)}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <p className="py-10 text-center text-muted">
                Toque num dia do ciclo e anote o que sentiu, o que viu e se houve relação.
              </p>
            )}
          </div>
        ) : (
          <div className="px-5 py-14 text-center sm:px-8">
            <p className="font-display text-2xl text-teal-dark">Nenhuma anotação ainda</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Cada dia leva o que você sentiu, o que você viu e se houve relação.
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

function DayRow({
  entry,
  isToday,
  onOpen,
}: {
  entry: DayEntryView;
  isToday: boolean;
  onOpen: () => void;
}) {
  const felt = feltLabel(entry.sensation);
  const seen = seenLabel(entry.mucus);
  const relation = entry.intercourse ? "Sim" : "Não";
  const cycleLabel = entry.cycleDay ? `Dia ${entry.cycleDay}` : formatDay(entry.date);

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "w-full rounded-2xl bg-cream/70 p-4 text-left transition hover:bg-cream sm:rounded-none sm:bg-transparent sm:px-0 sm:py-5 sm:hover:bg-cream/70",
          isToday && "ring-1 ring-teal/25 sm:bg-cream/60 sm:ring-0",
        )}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-start sm:gap-6">
          <div>
            <p className="text-sm text-muted">Dia do ciclo</p>
            <p className="font-display text-xl text-teal-dark">
              {cycleLabel}
              {isToday ? (
                <span className="ml-2 align-middle rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal-dark">
                  Hoje
                </span>
              ) : null}
            </p>
            {entry.cycleDay ? (
              <p className="mt-0.5 text-sm text-muted">{formatDay(entry.date)}</p>
            ) : null}
          </div>
          <Fact label="O que sentiu" value={felt} />
          <Fact label="O que viu" value={seen} />
          <Fact label="Relação" value={relation} tone={entry.intercourse ? "yes" : "no"} />
        </div>
      </button>
    </li>
  );
}

function Fact({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: string;
  tone?: "plain" | "yes" | "no";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 sm:block">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={cn(
          "text-base font-medium sm:mt-1 sm:text-lg",
          tone === "yes" && "text-pink",
          tone === "no" && "text-muted",
          tone === "plain" && "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}
