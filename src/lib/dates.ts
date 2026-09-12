import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function todayISO(timeZone = "America/Sao_Paulo") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseDate(iso: string) {
  return parseISO(`${iso}T12:00:00`);
}

export function addDaysISO(iso: string, amount: number) {
  return format(addDays(parseDate(iso), amount), "yyyy-MM-dd");
}

export function diffDays(from: string, to: string) {
  return differenceInCalendarDays(parseDate(to), parseDate(from));
}

export function formatDay(iso: string) {
  return format(parseDate(iso), "dd MMM", { locale: ptBR }).replace(".", "");
}

export function formatLong(iso: string) {
  return format(parseDate(iso), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatRange(from: string, to: string) {
  if (from === to) return formatLong(from);
  return `${format(parseDate(from), "d MMM yyyy", { locale: ptBR })} - ${format(parseDate(to), "d MMM yyyy", { locale: ptBR })}`;
}

export function eachDate(from: string, to: string) {
  const dates: string[] = [];
  const total = Math.max(0, diffDays(from, to));
  for (let i = 0; i <= total; i += 1) {
    dates.push(addDaysISO(from, i));
  }
  return dates;
}

export function startOfMonthISO(iso: string) {
  return format(parseDate(iso), "yyyy-MM-01");
}

export function startOfYearISO(iso: string) {
  return format(parseDate(iso), "yyyy-01-01");
}

export function endOfMonthISO(iso: string) {
  const date = parseDate(iso);
  return format(new Date(date.getFullYear(), date.getMonth() + 1, 0), "yyyy-MM-dd");
}

export function endOfYearISO(iso: string) {
  return format(parseDate(iso), "yyyy-12-31");
}
