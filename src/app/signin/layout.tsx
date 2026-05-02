// Forces dynamic rendering for /signin.
//
// The signin page reads ?next=<path> from useSearchParams to know where
// to redirect after auth. Next 16's prerender pass refuses to build
// pages that call useSearchParams outside a Suspense boundary; mark
// the segment as force-dynamic — signin is per-request anyway.

export const dynamic = "force-dynamic";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
