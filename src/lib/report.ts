export type ReportSections = {
  symbols: boolean;
  legend: boolean;
  tips: boolean;
  rules: boolean;
};

export const DEFAULT_REPORT_SECTIONS: ReportSections = {
  symbols: false,
  legend: false,
  tips: false,
  rules: false,
};

export const REPORT_SECTION_FIELDS = [
  {
    key: "symbols" as const,
    label: "Símbolos (selos)",
    hint: "A linha de selos coloridos no gráfico.",
  },
  {
    key: "legend" as const,
    label: "Cores e símbolos",
    hint: "A legenda dos selos no final do PDF.",
  },
  {
    key: "tips" as const,
    label: "Como anotar",
    hint: "As dicas de anotação.",
  },
  {
    key: "rules" as const,
    label: "Regras do método",
    hint: "As quatro regras no final do PDF.",
  },
];

function flag(value: unknown) {
  return value === "1" || value === "true" || value === true || value === 1;
}

function read(source: URLSearchParams | Record<string, unknown>, key: string) {
  if (source instanceof URLSearchParams) return source.get(key);
  return source[key];
}

export function parseReportSections(source: URLSearchParams | Record<string, unknown>): ReportSections {
  return {
    symbols: flag(read(source, "symbols")),
    legend: flag(read(source, "legend")),
    tips: flag(read(source, "tips")),
    rules: flag(read(source, "rules")),
  };
}

export function parsePadDays(source: URLSearchParams | Record<string, unknown>) {
  const raw = read(source, "pad");
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.min(Math.floor(value), 35) : undefined;
}

export function reportSearchParams(
  from: string,
  to: string,
  sections: ReportSections,
  pad?: number,
) {
  const params = new URLSearchParams({ from, to });
  (Object.keys(sections) as (keyof ReportSections)[]).forEach((key) => {
    if (sections[key]) params.set(key, "1");
  });
  if (pad) params.set("pad", String(pad));
  return params;
}
