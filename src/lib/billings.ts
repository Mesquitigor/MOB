export const STAMP_TYPES = [
  "MENSTRUATION",
  "SPOTTING",
  "DRY",
  "FERTILE",
  "INFERTILE",
] as const;

export type StampType = (typeof STAMP_TYPES)[number];

export const SENSATIONS = [
  "DRY",
  "WET",
  "DAMP",
  "STICKY",
  "SLIPPERY",
] as const;

export type Sensation = (typeof SENSATIONS)[number];

export const MUCUS_TYPES = [
  "NONE",
  "EGG_WHITE",
  "MILKY",
  "CLOUDY",
  "FLAKY",
] as const;

export type Mucus = (typeof MUCUS_TYPES)[number];

export const BLEEDING_TYPES = [
  "NONE",
  "MENSTRUATION",
  "BLEEDING",
  "SPOTTING",
] as const;

export type Bleeding = (typeof BLEEDING_TYPES)[number];

export type DayEntryView = {
  id: string;
  date: string;
  stamp: StampType;
  sensation: string | null;
  mucus: string | null;
  bleeding: Bleeding | null;
  intercourse: boolean;
  peak: boolean;
  notes: string;
  cycleDay: number | null;
};

export const STAMP_META: Record<
  StampType,
  {
    label: string;
    short: string;
    color: string;
    ink: string;
    symbol: string;
    description: string;
  }
> = {
  MENSTRUATION: {
    label: "Menstruação",
    short: "MENSTRUA",
    color: "#D64545",
    ink: "#FFFFFF",
    symbol: "closed-dot",
    description: "Sangramento com fluxo, ou menstruação após ovulação.",
  },
  SPOTTING: {
    label: "Manchas",
    short: "MANCHAS",
    color: "#D64545",
    ink: "#111111",
    symbol: "dots",
    description: "Manchas ou borra, sem fluxo.",
  },
  DRY: {
    label: "Seca",
    short: "SECA",
    color: "#2F9E5F",
    ink: "#FFFFFF",
    symbol: "dash",
    description: "Sensação de seca.",
  },
  FERTILE: {
    label: "Fértil",
    short: "FÉRTIL",
    color: "#FFFDF8",
    ink: "#1F3334",
    symbol: "baby",
    description: "Dias potencialmente férteis — muco e/ou sensação fértil.",
  },
  INFERTILE: {
    label: "Infértil",
    short: "PBI",
    color: "#E6C84A",
    ink: "#1F3334",
    symbol: "equal",
    description: "Fluxo infértil (PBI) ou fase pós-ovulatória.",
  },
};

export const SENSATION_META: Record<Sensation, { label: string; hint: string }> = {
  DRY: { label: "Seca", hint: "Sem umidade" },
  WET: { label: "Molhada", hint: "Lembra escape de xixi" },
  DAMP: { label: "Úmida", hint: "Como se estivesse suada" },
  STICKY: { label: "Pegajosa", hint: "Calcinha colando" },
  SLIPPERY: { label: "Escorregadia", hint: "Lembra lubrificante" },
};

export const SENSATION_SUGGESTIONS = [
  { label: "Seca", hint: "Sem umidade" },
  { label: "Úmida", hint: "Como se estivesse suada" },
  { label: "Molhada", hint: "Lembra escape de xixi" },
  { label: "Pegajosa", hint: "Calcinha colando" },
  { label: "Escorregadia", hint: "Lembra lubrificante" },
  { label: "Inchada", hint: "Vulva inchada, comum no ápice" },
  { label: "Clara de ovo", hint: "Muco elástico e transparente" },
] as const;

export const MUCUS_META: Record<Mucus, { label: string; hint: string }> = {
  NONE: { label: "Nada visível", hint: "Sem muco aparente" },
  EGG_WHITE: { label: "Clara de ovo", hint: "Transparente e elástico" },
  MILKY: { label: "Leitoso", hint: "Branco" },
  CLOUDY: { label: "Turvo", hint: "Amarelado" },
  FLAKY: { label: "Flocoso", hint: "Espesso, forma bolinhas" },
};

export const BLEEDING_META: Record<Bleeding, { label: string; hint: string }> = {
  NONE: { label: "Sem sangramento", hint: "" },
  MENSTRUATION: { label: "Menstruação", hint: "Quando precedido de ovulação" },
  BLEEDING: { label: "Sangramento", hint: "Fluxo que não é menstruação" },
  SPOTTING: { label: "Manchas / borra", hint: "Sem fluxo" },
};

export const BILLINGS_RULES = [
  {
    number: "01",
    title: "Sangramento forte",
    text: "Evitar relação sexual em dias de forte sangramento.",
  },
  {
    number: "02",
    title: "PBI",
    text: "Noites alternadas estão disponíveis durante o Padrão Básico Infértil.",
  },
  {
    number: "03",
    title: "PBI interrompido",
    text: "Para espaçar: suspender o ato conjugal. Para conquistar: esperar a sensação escorregadia (ou a de maior fertilidade).",
  },
  {
    number: "04",
    title: "Regra do ápice",
    text: "Para espaçar: após o ápice, abstinência por mais 3 dias e retorno na manhã do quarto. Para conquistar: relação quando a vulva estiver escorregadia e inchada, e nos 3 dias após o ápice.",
  },
] as const;

export const ANNOTATION_TIPS = [
  "Anote à noite, como última tarefa do dia.",
  "Primeiro o que sente, depois o que vê.",
  "Sem autoexame e sem toque no muco.",
  "A fidelidade às anotações é o que permite a leitura do ciclo.",
] as const;

export function isStampType(value: string): value is StampType {
  return STAMP_TYPES.includes(value as StampType);
}

export function isSensation(value: string | null | undefined): value is Sensation {
  return SENSATIONS.includes(value as Sensation);
}

export function sensationDisplay(value: string | null | undefined) {
  if (!value) return "";
  if (isSensation(value)) return SENSATION_META[value].label;
  return value;
}

export function inferSensation(value: string | null | undefined): Sensation | null {
  if (!value) return null;
  if (isSensation(value)) return value;
  const normalized = value.trim().toLowerCase();
  const byLabel = SENSATIONS.find((item) => SENSATION_META[item].label.toLowerCase() === normalized);
  if (byLabel) return byLabel;
  if (/escorreg|lubrific|clara de ovo|el[aá]stic/.test(normalized)) return "SLIPPERY";
  if (/molhad/.test(normalized)) return "WET";
  if (/[uú]mid/.test(normalized)) return "DAMP";
  if (/pegajos/.test(normalized)) return "STICKY";
  if (/seca/.test(normalized)) return "DRY";
  return null;
}

export function isMucus(value: string | null | undefined): value is Mucus {
  return MUCUS_TYPES.includes(value as Mucus);
}

export function mucusDisplay(value: string | null | undefined) {
  if (!value || value === "NONE") return "";
  if (isMucus(value)) return MUCUS_META[value].label;
  return value;
}

export function inferMucus(value: string | null | undefined): Mucus | null {
  if (!value) return null;
  if (isMucus(value)) return value;
  const normalized = value.trim().toLowerCase();
  const byLabel = MUCUS_TYPES.find((item) => MUCUS_META[item].label.toLowerCase() === normalized);
  if (byLabel) return byLabel;
  if (/clara de ovo|el[aá]stic|transparent/.test(normalized)) return "EGG_WHITE";
  if (/leitos/.test(normalized)) return "MILKY";
  if (/turvo|amarel/.test(normalized)) return "CLOUDY";
  if (/flocos|bolinha/.test(normalized)) return "FLAKY";
  if (/nada vis[ií]vel|nada|n[aã]o vi|sem muco/.test(normalized)) return "NONE";
  return null;
}

export function isBleeding(value: string | null | undefined): value is Bleeding {
  return BLEEDING_TYPES.includes(value as Bleeding);
}

export function suggestStamp(input: {
  sensation?: string | null;
  mucus?: string | null;
  bleeding?: Bleeding | null;
}): StampType | null {
  const sensation = inferSensation(input.sensation);
  const mucus = inferMucus(input.mucus);
  if (input.bleeding === "MENSTRUATION" || input.bleeding === "BLEEDING") {
    return "MENSTRUATION";
  }
  if (input.bleeding === "SPOTTING") return "SPOTTING";
  if (sensation === "SLIPPERY" || mucus === "EGG_WHITE") {
    return "FERTILE";
  }
  if (sensation === "DRY" && (!mucus || mucus === "NONE")) {
    return "DRY";
  }
  if (sensation === "STICKY" || mucus === "MILKY" || mucus === "CLOUDY" || mucus === "FLAKY") {
    return "INFERTILE";
  }
  if (sensation === "WET" || sensation === "DAMP") {
    return "FERTILE";
  }
  return null;
}

export function entrySummary(entry: {
  stamp: StampType;
  sensation: string | null;
  mucus: string | null;
  notes: string;
}) {
  const parts = [STAMP_META[entry.stamp].short];
  if (entry.sensation) parts.push(sensationDisplay(entry.sensation));
  const seen = mucusDisplay(entry.mucus);
  if (seen) parts.push(seen);
  if (entry.notes.trim()) parts.push(entry.notes.trim());
  return parts.join(" · ");
}
