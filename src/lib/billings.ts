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
  sensation: Sensation | null;
  mucus: Mucus | null;
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
    short: "RICA",
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

export function isMucus(value: string | null | undefined): value is Mucus {
  return MUCUS_TYPES.includes(value as Mucus);
}

export function isBleeding(value: string | null | undefined): value is Bleeding {
  return BLEEDING_TYPES.includes(value as Bleeding);
}

export function suggestStamp(input: {
  sensation?: Sensation | null;
  mucus?: Mucus | null;
  bleeding?: Bleeding | null;
}): StampType | null {
  if (input.bleeding === "MENSTRUATION" || input.bleeding === "BLEEDING") {
    return "MENSTRUATION";
  }
  if (input.bleeding === "SPOTTING") return "SPOTTING";
  if (input.sensation === "SLIPPERY" || input.mucus === "EGG_WHITE") {
    return "FERTILE";
  }
  if (input.sensation === "DRY" && (!input.mucus || input.mucus === "NONE")) {
    return "DRY";
  }
  if (
    input.sensation === "STICKY" ||
    input.mucus === "MILKY" ||
    input.mucus === "CLOUDY" ||
    input.mucus === "FLAKY"
  ) {
    return "INFERTILE";
  }
  if (input.sensation === "WET" || input.sensation === "DAMP") {
    return "FERTILE";
  }
  return null;
}

export function entrySummary(entry: {
  stamp: StampType;
  sensation: Sensation | null;
  mucus: Mucus | null;
  notes: string;
}) {
  const parts = [STAMP_META[entry.stamp].short];
  if (entry.sensation) parts.push(SENSATION_META[entry.sensation].label);
  if (entry.mucus && entry.mucus !== "NONE") {
    parts.push(MUCUS_META[entry.mucus].label);
  }
  if (entry.notes.trim()) parts.push(entry.notes.trim());
  return parts.join(" · ");
}
