import { redirect } from "next/navigation";
import { ExportPanel } from "@/components/export-panel";
import { todayISO } from "@/lib/dates";
import { getOpenCycle } from "@/lib/entries";
import { getSession } from "@/lib/session";

export default async function ExportPage() {
  const session = await getSession();
  if (!session) redirect("/entrar");
  const cycle = await getOpenCycle(session.id);

  return (
    <ExportPanel
      today={todayISO()}
      cycleStart={cycle?.startDate ?? null}
      cycleEnd={cycle?.endDate ?? todayISO()}
      email={session.email}
    />
  );
}
