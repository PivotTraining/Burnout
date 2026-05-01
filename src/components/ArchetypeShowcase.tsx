import { ARCHETYPES } from "@/lib/archetypes";

export default function ArchetypeShowcase() {
  return (
    <section className="section-wide py-24">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
          The PressureIQ Engine
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-4">
          Burnout doesn’t look the same on every team.
        </h2>
        <p className="text-lg text-navy/60 leading-relaxed">
          Six behavioral archetypes, derived from a forced-pair scoring methodology
          across four pressure domains. Each archetype has a distinct burnout
          pattern — and a distinct intervention. This is the engine BurnoutIQ
          deploys inside your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ARCHETYPES.map((a) => (
          <article
            key={a.key}
            className="relative rounded-2xl border border-border-gray bg-white p-6 hover:shadow-lg transition-shadow"
          >
            <div
              className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
              style={{ backgroundColor: a.accent }}
            />
            <h3 className="text-xl font-bold text-navy mb-1">{a.name}</h3>
            <p className="text-sm text-navy/50 italic mb-5">{a.oneLiner}</p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-navy/40">
                  Enterprise signal
                </dt>
                <dd className="text-navy/80 mt-0.5">{a.enterpriseSignal}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-navy/40">
                  Burnout pattern
                </dt>
                <dd className="text-navy/80 mt-0.5">{a.burnoutPattern}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-navy/40">
                  Targeted intervention
                </dt>
                <dd className="text-navy/80 mt-0.5">{a.intervention}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
