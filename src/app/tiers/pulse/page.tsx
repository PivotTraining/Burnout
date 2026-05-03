import { redirect } from "next/navigation";

// /tiers/pulse has been renamed to /tiers/teams as part of the
// monetization overhaul (Pulse positioning collided with the consumer
// Continuum monthly product). next.config.ts also issues a 301 to
// preserve SEO; this page-level redirect catches client-side hits.
export default function PulseRedirect(): never {
  redirect("/tiers/teams");
}
