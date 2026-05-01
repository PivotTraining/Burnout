export const metadata = { title: "Settings · BurnoutIQ Console" };

export default function SettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-navy/50">Org configuration, billing, integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Organization" body="Acme Health System (demo) · 1,240 employees · Tier 2 Core + Subscription" />
        <Card title="Billing" body="Stripe customer cust_demo · 1,240 seats · $43,400 ARR · next renewal Q4" />
        <Card title="HRIS connector" body="Workday (manual CSV sync). Live connector on the roadmap." />
        <Card title="Email sender" body="hello@pivottraining.us via Resend" />
        <Card title="Slack / Teams" body="Not configured. Available in nudge channel v2." />
        <Card title="Data retention" body="Anonymized aggregate forever. Individual responses purged after 24 months." />
      </div>
    </>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border-gray bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">{title}</p>
      <p className="text-sm text-navy/80 leading-relaxed">{body}</p>
    </div>
  );
}
