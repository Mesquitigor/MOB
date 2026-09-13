"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { saveEntryAction, deleteEntryAction, type EntryState } from "@/actions/entries";
import { Stamp } from "@/components/stamp";
import {
  BLEEDING_META,
  BLEEDING_TYPES,
  MUCUS_META,
  MUCUS_TYPES,
  SENSATION_META,
  SENSATIONS,
  STAMP_META,
  STAMP_TYPES,
  suggestStamp,
  type Bleeding,
  type DayEntryView,
  type Mucus,
  type Sensation,
  type StampType,
} from "@/lib/billings";
import { cn } from "@/lib/cn";
import { formatLong } from "@/lib/dates";

const initial: EntryState = {};

export function DayEditor({
  open,
  date,
  today,
  entry,
  onClose,
}: {
  open: boolean;
  date: string;
  today: string;
  entry: DayEntryView | null;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(saveEntryAction, initial);
  const wasPending = useRef(false);
  const [stamp, setStamp] = useState<StampType>(entry?.stamp ?? "DRY");
  const [sensation, setSensation] = useState<Sensation | "">(entry?.sensation ?? "");
  const [mucus, setMucus] = useState<Mucus | "">(entry?.mucus ?? "");
  const [bleeding, setBleeding] = useState<Bleeding | "">(entry?.bleeding ?? "");
  const [currentDate, setCurrentDate] = useState(date);

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) onClose();
    wasPending.current = pending;
  }, [pending, state.ok, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const suggested = useMemo(
    () =>
      suggestStamp({
        sensation: sensation || null,
        mucus: mucus || null,
        bleeding: bleeding || null,
      }),
    [sensation, mucus, bleeding],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="anotar-titulo"
        className="card relative z-10 max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl sm:p-8"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Anotação</p>
            <h2 id="anotar-titulo" className="font-display text-2xl text-teal-dark">
              {currentDate === today ? "Hoje" : formatLong(currentDate)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-muted hover:bg-cream"
          >
            Fechar
          </button>
        </div>

        <form action={action} className="space-y-5">
          <input type="hidden" name="stamp" value={stamp} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Data</span>
            <input
              type="date"
              name="date"
              value={currentDate}
              onChange={(event) => setCurrentDate(event.target.value)}
              className="input"
              required
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Selo do dia</legend>
            <div className="grid grid-cols-5 gap-2">
              {STAMP_TYPES.map((type) => {
                const selected = stamp === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setStamp(type)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border px-1 py-3 text-center transition",
                      selected
                        ? "border-teal bg-cream"
                        : "border-line bg-white hover:border-teal/40",
                    )}
                  >
                    <Stamp type={type} size="md" selected={selected} />
                    <span className="text-[11px] font-semibold leading-tight">
                      {STAMP_META[type].label}
                    </span>
                  </button>
                );
              })}
            </div>
            {suggested && suggested !== stamp ? (
              <button
                type="button"
                className="mt-2 text-sm text-teal underline-offset-2 hover:underline"
                onClick={() => setStamp(suggested)}
              >
                Usar selo sugerido: {STAMP_META[suggested].label}
              </button>
            ) : null}
          </fieldset>

          <ChipGroup
            legend="O que sinto"
            name="sensation"
            value={sensation}
            onChange={(value) => setSensation(value as Sensation | "")}
            options={SENSATIONS.map((item) => ({
              value: item,
              label: SENSATION_META[item].label,
              hint: SENSATION_META[item].hint,
            }))}
          />
          <ChipGroup
            legend="O que vejo"
            name="mucus"
            value={mucus}
            onChange={(value) => setMucus(value as Mucus | "")}
            options={MUCUS_TYPES.map((item) => ({
              value: item,
              label: MUCUS_META[item].label,
              hint: MUCUS_META[item].hint,
            }))}
          />
          <ChipGroup
            legend="Sangramento"
            name="bleeding"
            value={bleeding}
            onChange={(value) => setBleeding(value as Bleeding | "")}
            options={BLEEDING_TYPES.map((item) => ({
              value: item,
              label: BLEEDING_META[item].label,
              hint: BLEEDING_META[item].hint,
            }))}
          />

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="intercourse" defaultChecked={entry?.intercourse} className="check" />
              Relação
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="peak" defaultChecked={entry?.peak} className="check" />
              Ápice
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="startNewCycle" className="check" />
              Iniciar ciclo nesta data
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nota</span>
            <textarea
              name="notes"
              maxLength={280}
              defaultValue={entry?.notes ?? ""}
              rows={2}
              className="input resize-none"
              placeholder="Opcional"
            />
          </label>

          {state.error ? (
            <p role="alert" className="text-sm text-stamp-red">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-pink flex-1" disabled={pending}>
              {pending ? "Salvando..." : "Salvar dia"}
            </button>
            {entry ? (
              <button
                type="button"
                className="btn-ghost"
                onClick={async () => {
                  await deleteEntryAction(entry.date);
                  onClose();
                }}
              >
                Excluir
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

function ChipGroup({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; hint: string }[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.hint || option.label}
              aria-pressed={selected}
              onClick={() => onChange(selected ? "" : option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition",
                selected
                  ? "border-teal bg-teal text-white"
                  : "border-line bg-cream text-ink hover:border-teal/40",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
