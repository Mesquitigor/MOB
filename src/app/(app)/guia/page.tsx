import { Stamp, StampLegendItem } from "@/components/stamp";
import { ANNOTATION_TIPS, BILLINGS_RULES, MUCUS_META, SENSATION_META, STAMP_TYPES } from "@/lib/billings";

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="card p-6 sm:p-8">
        <p className="text-sm text-muted">Guia</p>
        <h1 className="font-display text-3xl text-teal-dark">Como anotar</h1>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ANNOTATION_TIPS.map((tip) => (
            <li key={tip} className="rounded-2xl bg-cream px-4 py-3 text-sm text-ink">
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-2xl text-teal-dark">Cores e símbolos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {STAMP_TYPES.map((type) => (
            <StampLegendItem key={type} type={type} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-2xl text-teal-dark">O que sinto</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.values(SENSATION_META).map((item) => (
              <li key={item.label}>
                <span className="font-semibold">{item.label}</span>
                <span className="text-muted"> — {item.hint}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-2xl text-teal-dark">O que vejo</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.values(MUCUS_META).map((item) => (
              <li key={item.label}>
                <span className="font-semibold">{item.label}</span>
                {item.hint ? <span className="text-muted"> — {item.hint}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-2xl text-teal-dark">Quatro regras</h2>
        <ol className="mt-4 grid gap-3">
          {BILLINGS_RULES.map((rule) => (
            <li key={rule.number} className="flex gap-4 rounded-2xl bg-cream p-4">
              <span className="font-display text-2xl text-pink">{rule.number}</span>
              <div>
                <p className="font-semibold">{rule.title}</p>
                <p className="text-sm text-muted">{rule.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="flex items-center gap-2 px-2 pb-2 text-sm text-muted">
        <Stamp type="FERTILE" size="sm" />
        Material de apoio. Não substitui o acompanhamento com instrutora credenciada.
      </p>
    </div>
  );
}
