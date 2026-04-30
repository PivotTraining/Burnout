/**
 * POST /api/webinar-reminder
 * Sends a reminder to everyone in the Webinar Registrants audience.
 * type: "day-before" | "day-of" | "recording"
 *
 * Protect with a secret key so only you can trigger it.
 * Call it the day before (May 19) and 30 min before (May 20).
 */
import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_WEBINAR, brandedEmail, ctaButton, zoomBox } from "@/lib/email";

const ZOOM_URL  = "https://us06web.zoom.us/j/7486866639";
const ZOOM_ID   = "748 686 6639";
const AUDIENCE  = process.env.RESEND_AUDIENCE_ID;
const SECRET    = process.env.REMINDER_SECRET;

const TEMPLATES = {
  "day-before": {
    subject: "Tomorrow at noon — Burned In, Not Burned Out (your Zoom link inside)",
    preheader: "We're live tomorrow. Here's your Zoom link.",
    headerTitle: "See You Tomorrow.",
    headerSubtitle: "Wednesday, May 20 · 12:00 PM EST",
    body: (firstName = "there") => `
      <p style="font-size:16px;color:#1a1a1a;margin-top:0;">Hi ${firstName},</p>
      <p style="color:#555;line-height:1.8;">Just a heads-up — <strong style="color:#1a1a1a;">Burned In, Not Burned Out</strong> is tomorrow at 12:00 PM EST. We've got a packed 75 minutes and zero fluff.</p>
      ${zoomBox(ZOOM_URL, ZOOM_ID)}
      <p style="color:#555;line-height:1.8;font-size:14px;">Haven't taken the BurnoutIQ assessment yet? Do it tonight — you'll walk into tomorrow's session with your own data in hand.</p>
      ${ctaButton("Take the Free Assessment", "https://burnoutiqtest.com/start", "#C9952A")}
      <p style="color:#999;font-size:13px;">See you tomorrow,<br/><strong style="color:#1a1a1a;">Chris &amp; the Pivot Training Team</strong></p>
    `,
  },
  "day-of": {
    subject: "We're live in 30 minutes — join now",
    preheader: "Burned In, Not Burned Out starts in 30 min. Click to join.",
    headerTitle: "We Go Live in 30.",
    headerSubtitle: "Today · 12:00 PM EST",
    body: (firstName = "there") => `
      <p style="font-size:16px;color:#1a1a1a;margin-top:0;">Hi ${firstName},</p>
      <p style="color:#555;line-height:1.8;">It's go time. <strong style="color:#1a1a1a;">Burned In, Not Burned Out</strong> starts in 30 minutes. Click below to join — we'll get started right at noon.</p>
      ${zoomBox(ZOOM_URL, ZOOM_ID)}
      <p style="color:#999;font-size:13px;">See you in a few,<br/><strong style="color:#1a1a1a;">Chris</strong></p>
    `,
  },
  "recording": {
    subject: "The replay is ready — Burned In, Not Burned Out",
    preheader: "Missed it or want to rewatch? The recording is here.",
    headerTitle: "Thanks For Showing Up.",
    headerSubtitle: "The replay is available now.",
    body: (firstName = "there") => `
      <p style="font-size:16px;color:#1a1a1a;margin-top:0;">Hi ${firstName},</p>
      <p style="color:#555;line-height:1.8;">Whether you were live or missed it, the full recording of <strong style="color:#1a1a1a;">Burned In, Not Burned Out</strong> is ready for you. The frameworks are just as powerful the second time.</p>
      ${ctaButton("Watch the Recording", "https://burnoutiqtest.com/webinar", "#E8401C")}
      <p style="color:#555;line-height:1.8;font-size:14px;">And if you haven't taken the BurnoutIQ assessment yet — now's the time. Apply what you just learned to your own score.</p>
      ${ctaButton("Take the Free Assessment", "https://burnoutiqtest.com/start", "#C9952A")}
      <p style="color:#999;font-size:13px;">Keep burning bright,<br/><strong style="color:#1a1a1a;">Chris Davis &amp; Pivot Training</strong></p>
    `,
  },
};

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get("x-reminder-secret");
  if (SECRET && auth !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, testEmail } = await req.json();
  const template = TEMPLATES[type as keyof typeof TEMPLATES];
  if (!template) {
    return NextResponse.json({ error: "Invalid type. Use: day-before, day-of, recording" }, { status: 400 });
  }

  // If testEmail provided, send just to that address
  if (testEmail) {
    await resend.emails.send({
      from: FROM_WEBINAR,
      to: [testEmail],
      subject: `[TEST] ${template.subject}`,
      html: brandedEmail({
        preheader: template.preheader,
        headerTitle: template.headerTitle,
        headerSubtitle: template.headerSubtitle,
        body: template.body("Chris"),
      }),
    });
    return NextResponse.json({ success: true, sent: "test", to: testEmail });
  }

  // Otherwise broadcast via Resend Broadcasts API
  if (!AUDIENCE) {
    return NextResponse.json({ error: "RESEND_AUDIENCE_ID not set" }, { status: 500 });
  }

  const broadcast = await resend.broadcasts.create({
    audienceId: AUDIENCE,
    from: FROM_WEBINAR,
    subject: template.subject,
    html: brandedEmail({
      preheader: template.preheader,
      headerTitle: template.headerTitle,
      headerSubtitle: template.headerSubtitle,
      body: template.body(),
    }),
    name: `Webinar ${type} — ${new Date().toISOString().slice(0, 10)}`,
  });

  await resend.broadcasts.send((broadcast as { id: string }).id);

  return NextResponse.json({ success: true, broadcast });
}
