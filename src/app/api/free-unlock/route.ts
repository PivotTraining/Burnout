// /api/free-unlock — dedicated endpoint for 100%-off comp promo fulfillment.
//
// This is the "make the route the same" fix: when a user redeems a 100%-off
// promo (e.g. PIVOT100, FAMILY), they should receive the same PDF in the
// same inbox as a paid customer. Bypasses Stripe entirely because $0
// sessions don't reliably trigger checkout.session.completed with the
// metadata pipeline intact.
//
// Mirrors the fulfillment logic in /api/stripe/webhook so the artifact
// produced is identical in both flows.

import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import {
  generatePremiumReportPDF,
  premiumReportEmailHtml,
} from "@/lib/premium-report-delivery";
import type { ArchetypeKey } from "@/lib/archetype-content";
import { validatePromoCode } from "@/lib/promo-codes";

const FROM =
  process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const customerEmail = body.customerEmail as string | undefined;
  const archetype = body.archetype as ArchetypeKey | undefined;
  const burnoutScore = Number(body.burnoutScore) || 0;
  const promoCode = body.promoCode as string | undefined;

  if (!customerEmail) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 },
    );
  }
  if (!archetype) {
    return NextResponse.json(
      { error: "Assessment results required." },
      { status: 400 },
    );
  }
  if (!promoCode) {
    return NextResponse.json(
      { error: "Promo code required." },
      { status: 400 },
    );
  }

  // Validate promo: must be valid AND a full 100% comp
  const promo = validatePromoCode(String(promoCode));
  if (!promo.valid) {
    return NextResponse.json(
      { error: promo.error || "Invalid promo code." },
      { status: 400 },
    );
  }
  if (typeof promo.discount !== "number" || promo.discount < 100) {
    return NextResponse.json(
      { error: "This endpoint is for 100% comp codes only." },
      { status: 400 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[/api/free-unlock] RESEND_API_KEY not configured");
    return NextResponse.json(
      { error: "Email delivery not configured." },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const pdfBuffer = await generatePremiumReportPDF({
      archetype,
      burnoutScore,
      customerName: "",
      customerEmail,
      purchaseDate: new Date(),
    });
    await resend.emails.send({
      from: FROM,
      to: customerEmail,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      subject: "Your BurnoutIQ Premium Report is ready",
      html: premiumReportEmailHtml(archetype, ""),
      attachments: [
        {
          filename: `BurnoutIQ-Premium-Report-${archetype}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    const origin = req.nextUrl.origin;
    return NextResponse.json({
      url: `${origin}/pro/success?free=1&promo=${encodeURIComponent(promo.code || "")}`,
      delivered: true,
    });
  } catch (err) {
    console.error("[/api/free-unlock] delivery failed", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Delivery failed.",
      },
      { status: 500 },
    );
  }
}
