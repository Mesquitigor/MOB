"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { saveEntryAction, deleteEntryAction, type EntryState } from "@/actions/entries";
import { mucusDisplay, SENSATION_SUGGESTIONS, type DayEntryView } from "@/lib/billings";
import { cn } from "@/lib/cn";
import { formatLong } from "@/lib/dates";

const initial: EntryState = {};

function preservedBleeding(entry: DayEntryView | null) {
  if (entry?.bleeding) return entry.bleeding;
  if (entry?.stamp === "MENSTRUATION") return "MENSTRUATION";
  if (entry?.stamp === "SPOTTING") return "SPOTTING";
  return "";
}

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
  const [sensation, setSensation] = useState(entry?.sensation ?? "");
  const [customOpen, setCustomOpen] = useState(false);
  const [mucus, setMucus] = useState(mucusDisplay(entry?.mucus));
  const [currentDate, setCurrentDate] = useState(date);

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) onClose();
    wasPending.current = pending;
  }, [pending, state.ok, onClose]);

  useEffect(() => {
    if (!open) return;
    const next = entry?.sensation ?? "";
    const isPreset = SENSATION_SUGGESTIONS.some(
      (option) => option.label.toLowerCase() === next.trim().toLowerCase(),
    );
    setSensation(next);
    setCustomOpen(Boolean(next) && !isPreset);
    setMucus(mucusDisplay(entry?.mucus));
    setCurrentDate(date);
  }, [open, date, entry]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
              Adicionar anotação
            </p>
            <h2 id="anotar-titulo" className="mt-1 font-display text-2xl text-teal-dark">
              {currentDate === today ? "Hoje" : formatLong(currentDate)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg bg-stamp-red text-white"
            aria-label="Fechar"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        <form action={action} className="space-y-5" key={entry?.id ?? `new-${date}`}>
          <input type="hidden" name="stamp" value={entry?.stamp ?? "DRY"} />
          <input type="hidden" name="bleeding" value={preservedBleeding(entry)} />
          <input type="hidden" name="notes" value={entry?.notes ?? ""} />

          <label className="block">
            <span className="sr-only">Data</span>
            <input
              type="date"
              name="date"
              value={currentDate}
              onChange={(event) => setCurrentDate(event.target.value)}
              className="input"
              required
            />
          </label>

          <SensationField
            value={sensation}
            customOpen={customOpen}
            onChange={setSensation}
            onCustomOpen={setCustomOpen}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium">O que você vê?</span>
            <input
              name="mucus"
              type="text"
              value={mucus}
              onChange={(event) => setMucus(event.target.value)}
              className="input"
              maxLength={80}
              placeholder="Se desejar, digite uma observação"
              autoComplete="off"
            />
          </label>

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

          {state.error ? (
            <p role="alert" className="text-sm text-stamp-red">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
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
            <button type="submit" className="btn-pink" disabled={pending}>
              {pending ? "Salvando..." : entry ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SensationField({
  value,
  customOpen,
  onChange,
  onCustomOpen,
}: {
  value: string;
  customOpen: boolean;
  onChange: (value: string) => void;
  onCustomOpen: (open: boolean) => void;
}) {
  const selectedPreset = SENSATION_SUGGESTIONS.find(
    (option) => option.label.toLowerCase() === value.trim().toLowerCase(),
  );
  const outraSelected = customOpen && !selectedPreset;

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">O que você sente?</legend>
      {outraSelected ? null : <input type="hidden" name="sensation" value={value} />}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SENSATION_SUGGESTIONS.map((option) => {
          const selected = selectedPreset?.label === option.label;
          return (
            <button
              key={option.label}
              type="button"
              title={option.hint}
              aria-pressed={selected}
              onClick={() => {
                onCustomOpen(false);
                onChange(selected ? "" : option.label);
              }}
              className={cn(
                "rounded-xl border px-3 py-3 text-center text-xs font-semibold tracking-[0.08em] uppercase transition",
                selected
                  ? "border-teal bg-white text-teal-dark"
                  : "border-line bg-white text-ink hover:border-teal/40",
              )}
            >
              {option.label}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={outraSelected}
          onClick={() => {
            if (outraSelected) {
              onCustomOpen(false);
              onChange("");
              return;
            }
            onCustomOpen(true);
            if (selectedPreset) onChange("");
          }}
          className={cn(
            "rounded-xl border px-3 py-3 text-center text-xs font-semibold tracking-[0.08em] uppercase transition",
            outraSelected
              ? "border-teal bg-white text-teal-dark"
              : "border-line bg-white text-ink hover:border-teal/40",
          )}
        >
          Outra
        </button>
      </div>
      {outraSelected ? (
        <input
          name="sensation"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="input mt-3"
          maxLength={80}
          placeholder="Descreva o que sentiu"
          autoComplete="off"
          autoFocus
        />
      ) : null}
    </fieldset>
  );
}
