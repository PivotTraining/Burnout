// Forces dynamic rendering for /assessment/results.
//
// The results page reads from useSearchParams (?r=<encoded result blob>),
// and Next 16's prerender pass refuses to build pages that call
// useSearchParams outside a Suspense boundary. Marking the route segment
// as force-dynamic skips prerendering for this segment, which is the
// correct behavior for a per-user results page anyway.

export const dynamic = "force-dynamic";

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
