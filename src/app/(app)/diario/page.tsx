import { CycleBoard } from "@/components/cycle-board";
import { todayISO } from "@/lib/dates";
import { getOpenCycle, mapCycleEntries } from "@/lib/entries";
import { getPrisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DiarioPage() {
  const session = await getSession();
  if (!session) redirect("/entrar");

  const prisma = getPrisma();
  const today = todayISO();
  const cycle = await getOpenCycle(session.id);
  const full = cycle
    ? await prisma.cycle.findUniqueOrThrow({
        where: { id: cycle.id },
        include: { entries: { orderBy: { date: "asc" } } },
      })
    : null;

  return (
    <CycleBoard
      today={today}
      startDate={full?.startDate ?? null}
      endDate={full?.endDate ?? today}
      entries={full ? mapCycleEntries(full) : []}
    />
  );
}
