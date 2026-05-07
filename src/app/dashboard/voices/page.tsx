"use client";

import { useEffect, useState } from "react";
import { Lock, MessageSquare } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  workload: "Workload",
  team: "Team",
  management: "Management",
  recognition: "Recognition",
  culture: "Culture",
  other: "Other",
};

const CATEGORY_COLOR: Record<string, string> = {
  workload: "#EA580C",
  team: "#2563EB",
  management: "#7C3AED",
  recognition: "#D4A843",
  culture: "#0D7377",
  other: "#475569",
};

interface Voice {
  id: string;
  category: string;
  message: string;
  created_at: string;
}

interface VoicesData {
  ok: boolean;
  floor: number;
  counts: Record<string, number>;
  visible: Voice[];
  hiddenCount: number;
  totalCount: number;
  error?: string;
}

export default function VoicesPage() {
  const [data, setData] = useState<VoicesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/voices")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-navy/50 text-sm">Loading voices…</div>;
  if (!data?.ok) {
    return <div className="text-red-600 text-sm">{data?.error || "Couldn't load voices."}</div>;
  }

  const allCategories = Object.keys(CATEGORY_LABEL);
  const visibleByCategory = allCategories.map((cat) => ({
    cat,
    count: data.counts[cat] || 0,
    visible: data.visible.filter((v) => v.category === cat),
  }));

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Voices</h1>
          <p className="text-sm text-navy/50">
            Anonymous feedback from your team. Aggregated, not individualized.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-ember bg-ember-pale px-2 py-1 rounded">
          {data.totalCount} submitted · {data.visible.length} visible
        </span>
      </div>

      {/* Privacy floor explainer */}
      <div className="rounded-2xl bg-light-bg border border-border-gray p-4 mb-6 flex items-start gap-3">
        <Lock className="w-5 h-5 text-ember mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-navy font-semibold mb-1">
            Privacy floor: {data.floor} submissions per category
          </p>
          <p className="text-navy/60 leading-relaxed">
            Individual messages stay hidden until at least {data.floor} employees have submitted in
            the same category. At lower N, individual messages are de facto identifiable. Counts
            are always shown so you can encourage participation in quiet categories.
          </p>
        </div>
      </div>

      {/* Category counters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
        {visibleByCategory.map(({ cat, count }) => {
          const visible = count >= data.floor;
          return (
            <div
              key={cat}
              className={`rounded-xl border p-3 ${
                visible ? "border-ember/40 bg-ember/5" : "border-border-gray bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLOR[cat] }}
                />
                {visible && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-ember">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">
                {CATEGORY_LABEL[cat]}
              </p>
              <p className="text-xl font-extrabold text-navy mt-1 tabular-nums">{count}</p>
              {!visible && count > 0 && (
                <p className="text-[10px] text-navy/40 mt-1">
                  {data.floor - count} more to unlock
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Visible messages by category */}
      {data.visible.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border-gray bg-white p-8 text-center">
          <MessageSquare className="w-8 h-8 text-navy/20 mx-auto mb-3" />
          <p className="text-navy font-semibold mb-1">No category has reached the privacy floor yet.</p>
          <p className="text-sm text-navy/50 max-w-md mx-auto">
            Once a category receives {data.floor}+ submissions, all messages in that category
            unlock here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {visibleByCategory
            .filter(({ count }) => count >= data.floor)
            .map(({ cat, visible }) => (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLOR[cat] }}
                  />
                  <h2 className="text-lg font-bold text-navy">{CATEGORY_LABEL[cat]}</h2>
                  <span className="text-xs text-navy/40">{visible.length} message{visible.length === 1 ? "" : "s"}</span>
                </div>
                <div className="space-y-2">
                  {visible.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-xl bg-white border border-border-gray p-4"
                    >
                      <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">
                        {v.message}
                      </p>
                      <p className="text-[10px] text-navy/30 mt-2">
                        {new Date(v.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
