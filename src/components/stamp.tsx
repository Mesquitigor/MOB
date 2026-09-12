import { STAMP_META, type StampType } from "@/lib/billings";
import { cn } from "@/lib/cn";

const symbols: Record<StampType, string> = {
  MENSTRUATION: "M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0",
  SPOTTING: "",
  DRY: "",
  FERTILE: "",
  INFERTILE: "",
};

function Symbol({ type, ink }: { type: StampType; ink: string }) {
  if (type === "MENSTRUATION") {
    return <circle cx="16" cy="16" r="5" fill={ink} />;
  }
  if (type === "SPOTTING") {
    return (
      <g fill={ink}>
        <circle cx="11.5" cy="12.5" r="2.1" />
        <circle cx="20.5" cy="12.5" r="2.1" />
        <circle cx="16" cy="19.8" r="2.1" />
      </g>
    );
  }
  if (type === "DRY") {
    return <rect x="14.7" y="8" width="2.6" height="16" rx="1.2" fill={ink} />;
  }
  if (type === "INFERTILE") {
    return (
      <g fill={ink}>
        <rect x="9.5" y="12.2" width="13" height="2.3" rx="1" />
        <rect x="9.5" y="17.5" width="13" height="2.3" rx="1" />
      </g>
    );
  }
  return (
    <g fill="none" stroke={ink} strokeWidth="1.8">
      <circle cx="16" cy="13.2" r="3.1" />
      <path
        d="M10.8 22.4c.6-3 2.6-4.6 5.2-4.6s4.6 1.6 5.2 4.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="13.2" r="1.15" fill={ink} stroke="none" />
    </g>
  );
}

void symbols;

type StampProps = {
  type: StampType;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-16 w-16",
};

export function Stamp({ type, size = "md", selected, className }: StampProps) {
  const meta = STAMP_META[type];
  const ink = type === "SPOTTING" ? "#171717" : meta.ink;
  const outlined = type === "FERTILE";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl shadow-[0_8px_18px_rgba(31,51,52,0.12)] ring-2 ring-transparent",
        sizes[size],
        selected && "ring-teal ring-offset-2 ring-offset-cream",
        className,
      )}
      style={{
        background: meta.color,
        boxShadow: outlined
          ? "inset 0 0 0 1.5px #14686E, 0 8px 18px rgba(31,51,52,0.08)"
          : undefined,
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-[70%] w-[70%]">
        <Symbol type={type} ink={ink} />
      </svg>
    </span>
  );
}

export function StampLegendItem({ type }: { type: StampType }) {
  const meta = STAMP_META[type];
  return (
    <div className="flex items-start gap-3">
      <Stamp type={type} size="sm" />
      <div>
        <p className="font-semibold text-ink">{meta.label}</p>
        <p className="text-sm text-muted">{meta.description}</p>
      </div>
    </div>
  );
}
