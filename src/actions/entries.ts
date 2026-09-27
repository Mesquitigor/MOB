"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isBleeding, isStampType, suggestStamp } from "@/lib/billings";
import { saveDayEntry, deleteDayEntry } from "@/lib/entries";
import { getSession } from "@/lib/session";

export type EntryState = { error?: string; ok?: boolean };

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function saveEntryAction(_prev: EntryState, formData: FormData): Promise<EntryState> {
  const session = await getSession();
  if (!session) redirect("/entrar");

  const date = asText(formData.get("date"));
  if (!date) {
    return { error: "Escolha a data." };
  }

  const sensation = asText(formData.get("sensation")) || null;
  const mucus = asText(formData.get("mucus")) || null;
  const bleedingRaw = asText(formData.get("bleeding"));
  const bleeding = isBleeding(bleedingRaw) ? bleedingRaw : null;
  const previous = asText(formData.get("stamp"));
  const stamp = suggestStamp({ sensation, mucus, bleeding }) ?? (isStampType(previous) ? previous : "DRY");

  await saveDayEntry({
    userId: session.id,
    date,
    stamp,
    sensation,
    mucus,
    bleeding,
    intercourse: asText(formData.get("intercourse")) === "on",
    peak: asText(formData.get("peak")) === "on",
    notes: asText(formData.get("notes")).slice(0, 280),
    startNewCycle: asText(formData.get("startNewCycle")) === "on",
  });

  revalidatePath("/diario");
  revalidatePath("/exportar");
  return { ok: true };
}

export async function deleteEntryAction(date: string) {
  const session = await getSession();
  if (!session) redirect("/entrar");
  await deleteDayEntry(session.id, date);
  revalidatePath("/diario");
  revalidatePath("/exportar");
}
