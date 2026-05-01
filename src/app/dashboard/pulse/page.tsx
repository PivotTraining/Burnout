import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Pulse surveys · BurnoutIQ Console",
};

const pulses = [
  { title: "Q4 archetype pulse", status: "sent", sentAt: "2026-04-12", responses: 1086, total: 1240 },
  { title: "Q3 archetype pulse", status: "closed", sentAt: "2026-01-15", responses: 1041, total: 1240 },
  { title: "Q2 archetype pulse", status: "closed", sentAt: "2025-10-10", responses: 998, total: 1240 },
  { title: "Onboarding baseline", status: "closed", sentAt: "2025-07-08", responses: 720, total: 1240 },
];

export default function PulsePage() {
  return (
    <>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Pulse surveys</h1>
          <p className="text-sm text-navy/50">Quarterly archetype + burnout cadence. Subscription tier ships these on autopilot.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New pulse
        </button>
      </div>

      <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40 bg-light-bg">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Response rate</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pulses.map((p) => {
              const rate = Math.round((p.responses / p.total) * 100);
              return (
                <tr key={p.title} className="border-t border-border-gray">
                  <td className="px-4 py-3 font-semibold text-navy">{p.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        p.status === "sent"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-navy/10 text-navy/70"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy/70 tabular-nums">{p.sentAt}</td>
                  <td className="px-4 py-3 text-navy/70 tabular-nums">
                    {p.responses.toLocaleString()} / {p.total.toLocaleString()} ({rate}%)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href="#" className="text-ember font-semibold">View →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-navy/40 mt-4">
        Demo data. Wire to <code>pulse_surveys</code> table once Supabase is provisioned.
      </p>
    </>
  );
}
