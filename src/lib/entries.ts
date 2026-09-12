import { prisma } from "@/lib/db";
import { addDaysISO, diffDays } from "@/lib/dates";
import {
  isBleeding,
  isMucus,
  isSensation,
  isStampType,
  type DayEntryView,
  type StampType,
} from "@/lib/billings";
import type { Cycle, DayEntry } from "@prisma/client";

function toView(entry: DayEntry, cycleStart?: string | null): DayEntryView {
  return {
    id: entry.id,
    date: entry.date,
    stamp: isStampType(entry.stamp) ? entry.stamp : "DRY",
    sensation: isSensation(entry.sensation) ? entry.sensation : null,
    mucus: isMucus(entry.mucus) ? entry.mucus : null,
    bleeding: isBleeding(entry.bleeding) ? entry.bleeding : null,
    intercourse: entry.intercourse,
    peak: entry.peak,
    notes: entry.notes,
    cycleDay: cycleStart ? diffDays(cycleStart, entry.date) + 1 : null,
  };
}

export async function getOpenCycle(userId: string) {
  return prisma.cycle.findFirst({
    where: { userId, endDate: null },
    orderBy: { startDate: "desc" },
  });
}

export async function listCycles(userId: string) {
  return prisma.cycle.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: {
      entries: { orderBy: { date: "asc" } },
    },
  });
}

export async function listEntriesInRange(userId: string, from: string, to: string) {
  const entries = await prisma.dayEntry.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    orderBy: { date: "asc" },
    include: { cycle: true },
  });

  return entries.map((entry) => toView(entry, entry.cycle?.startDate));
}

export function mapCycleEntries(cycle: Cycle & { entries: DayEntry[] }) {
  return cycle.entries.map((entry) => toView(entry, cycle.startDate));
}

function shouldStartNewCycle(
  stamp: StampType,
  date: string,
  cycle: Cycle & { entries: DayEntry[] },
) {
  if (stamp !== "MENSTRUATION") return false;
  return cycle.entries.some(
    (entry) =>
      entry.date < date &&
      entry.stamp !== "MENSTRUATION" &&
      entry.stamp !== "SPOTTING",
  );
}

export async function saveDayEntry(input: {
  userId: string;
  date: string;
  stamp: StampType;
  sensation: string | null;
  mucus: string | null;
  bleeding: string | null;
  intercourse: boolean;
  peak: boolean;
  notes: string;
  startNewCycle: boolean;
}) {
  const existing = await prisma.dayEntry.findUnique({
    where: { userId_date: { userId: input.userId, date: input.date } },
  });

  let cycle = await getOpenCycle(input.userId);
  if (cycle) {
    const withEntries = await prisma.cycle.findUniqueOrThrow({
      where: { id: cycle.id },
      include: { entries: true },
    });
    if (input.startNewCycle || shouldStartNewCycle(input.stamp, input.date, withEntries)) {
      await prisma.cycle.update({
        where: { id: cycle.id },
        data: { endDate: addDaysISO(input.date, -1) },
      });
      cycle = await prisma.cycle.create({
        data: { userId: input.userId, startDate: input.date },
      });
    } else if (input.date < cycle.startDate) {
      cycle = await prisma.cycle.update({
        where: { id: cycle.id },
        data: { startDate: input.date },
      });
    }
  } else {
    cycle = await prisma.cycle.create({
      data: { userId: input.userId, startDate: input.date },
    });
  }

  const data = {
    stamp: input.stamp,
    sensation: input.sensation,
    mucus: input.mucus,
    bleeding: input.bleeding,
    intercourse: input.intercourse,
    peak: input.peak,
    notes: input.notes,
    cycleId: cycle.id,
  };

  const saved = existing
    ? await prisma.dayEntry.update({ where: { id: existing.id }, data })
    : await prisma.dayEntry.create({
        data: { userId: input.userId, date: input.date, ...data },
      });

  return toView(saved, cycle.startDate);
}

export async function deleteDayEntry(userId: string, date: string) {
  const existing = await prisma.dayEntry.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (!existing) return;
  await prisma.dayEntry.delete({ where: { id: existing.id } });
}

export function cycleStats(entries: DayEntryView[]) {
  const peak = entries.find((entry) => entry.peak);
  return {
    days: entries.length,
    fertile: entries.filter((entry) => entry.stamp === "FERTILE").length,
    peakDate: peak?.date ?? null,
    relations: entries.filter((entry) => entry.intercourse).length,
    postPeak: peak
      ? entries.filter((entry) => entry.date > peak.date).length
      : 0,
  };
}
