import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { Resend } from "resend";
import { requireStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import {
  generatePremiumReportPDF,
  premiumReportEmailHtml,
} from "@/lib/premium-report-delivery";
import type { ArchetypeKey } from "@/lib/archetype-content";
import { provisionPersonalContinuum } from "@/lib/continuum-provisioning";
import { subscriptionWelcomeEmailHtml } from "@/lib/email";

const PREMIUM_PRODUCT_TAG = "burnoutiq_premium_report_v1";
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true, skipped: "stripe-not-configured" });
  }
  const stripe = requireStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `bad signature: ${(err as Error).message}` }, { status: 400 });
  }

  const sb = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // ─── Premium Report (one-time) — discriminated by metadata.product ─
      if (session.metadata?.product === PREMIUM_PRODUCT_TAG) {
        const archetype = session.metadata.archetype as ArchetypeKey | undefined;
      const sector = (session.metadata?.sector as string | undefined) || undefined;
        const burnoutScore = Number.parseInt(session.metadata.burnoutScore || "0", 10);
        const customerEmail =
          session.customer_details?.email || session.customer_email || null;
        const customerName = session.customer_details?.name || "";

        if (!customerEmail || !archetype) {
          console.error("[stripe webhook] premium-report missing email or archetype", session.id);
          return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }
        if (!process.env.RESEND_API_KEY) {
          console.error("[stripe webhook] RESEND_API_KEY not configured");
          return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
        }
        try {
          const resend = new Resend(process.env.RESEND_API_KEY ?? "re_build_placeholder");
          const pdfBuffer = await generatePremiumReportPDF({
            archetype,
            burnoutScore,
            customerName,
            customerEmail,
            purchaseDate: new Date(),
          });
          await resend.emails.send({
            from: FROM,
            to: customerEmail,
            ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
            subject: "Your BurnoutIQ Premium Report is ready",
            html: premiumReportEmailHtml(archetype, customerName),
            attachments: [
              {
                filename: `BurnoutIQ-Premium-Report-${archetype}.pdf`,
                content: pdfBuffer,
              },
            ],
          });
          return NextResponse.json({ received: true, delivered: true });
        } catch (err) {
          console.error("[stripe webhook] premium-report delivery failed", err);
          return NextResponse.json(
            { error: err instanceof Error ? err.message : "delivery failed" },
            { status: 500 },
          );
        }
      }

      // ─── Subscription completion path ──────────────────────────────
      // Continuum / Coach: provision the personal org + member + subscription
      // via the shared helper. Mirrors /api/continuum-unlock so paid and
      // $0-comp flows produce identical back-end state.
      const subId = session.subscription as string | null;
      const customerId = session.customer as string | null;
      const subscriberEmail =
        session.customer_details?.email || session.customer_email || null;
      if (subId && customerId && subscriberEmail) {
        try {
          const sub = await stripe.subscriptions.retrieve(subId);
          const periodEnd = sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null;
          await provisionPersonalContinuum({
            userEmail: subscriberEmail,
            productKind: "continuum",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subId,
            currentPeriodEnd: periodEnd,
          });

          // Send the welcome email. Without this, /continuum/success
          // tells the user to "check your inbox for a welcome email"
          // and nothing ever arrives.
          if (process.env.RESEND_API_KEY) {
            try {
              const resend = new Resend(process.env.RESEND_API_KEY);
              const firstName =
                session.customer_details?.name?.split(" ")[0] || null;
              await resend.emails.send({
                from: FROM,
                to: subscriberEmail,
                ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
                subject:
                  "Welcome to BurnoutIQ Continuum — start with your baseline",
                html: subscriptionWelcomeEmailHtml({
                  productKind: "continuum",
                  firstName,
                  manageUrl: "https://burnoutiqtest.com/home",
                }),
              });
            } catch (err) {
              console.error(
                "[stripe webhook] welcome email send failed (non-fatal)",
                err,
              );
            }
          }
        } catch (err) {
          console.error(
            "[stripe webhook] subscription provisioning failed",
            err,
          );
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await sb
        .from("subscriptions")
        .update({
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
