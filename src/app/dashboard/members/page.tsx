import { MOCK_ORG, archetypeName, archetypeAccent } from "@/lib/mock-data";
import type { ArchetypeKey } from "@/lib/archetypes";

export const metadata = { title: "Members · BurnoutIQ Console" };

const sample = [
  { name: "Avery Chen", department: "Emergency Department", archetype: "racer" as ArchetypeKey, risk: 72 },
  { name: "Jordan Patel", department: "Med-Surg", archetype: "carrier" as ArchetypeKey, risk: 58 },
  { name: "Sam Rivera", department: "ICU", archetype: "fixer" as ArchetypeKey, risk: 51 },
  { name: "Taylor Brooks", department: "Oncology", archetype: "giver" as ArchetypeKey, risk: 49 },
  { name: "Morgan Reyes", department: "Operating Room", archetype: "guard" as ArchetypeKey, risk: 32 },
  { name: "Casey Kim", department: "Outpatient Clinics", archetype: "giver" as ArchetypeKey, risk: 30 },
];

export default function MembersPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Members</h1>
        <p className="text-sm text-navy/50">{MOCK_ORG.headcount.toLocaleString()} employees · anonymized for org admins.</p>
      </div>

      <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40 bg-light-bg">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Archetype</th>
              <th className="px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {sample.map((m) => (
              <tr key={m.name} className="border-t border-border-gray">
                <td className="px-4 py-3 font-semibold text-navy">{m.name}</td>
                <td className="px-4 py-3 text-navy/70">{m.department}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: archetypeAccent(m.archetype) }}
                  >
                    {archetypeName(m.archetype)}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-navy/70">{m.risk}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-navy/40 mt-4">
        Demo only. Real implementation reads from <code>members</code> joined with the latest <code>assessments</code> per member.
      </p>
    </>
  );
}
