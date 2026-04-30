import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_WEBINAR  = "Chris Davis at Pivot Training <webinar@burnoutiqtest.com>";
export const FROM_HELLO    = "Pivot Training <hello@burnoutiqtest.com>";
export const FROM_NOREPLY  = "BurnoutIQ <noreply@burnoutiqtest.com>";
export const REPLY_TO      = "hello@pivottraining.us";
export const NOTIFY_EMAIL  = "hello@pivottraining.us";

/* ─── Branded wrapper ───────────────────────────────────────────────────── */
export function brandedEmail({
  preheader = "",
  headerTitle,
  headerSubtitle = "",
  headerDark = true,
  body,
  footerExtra = "",
}: {
  preheader?: string;
  headerTitle: string;
  headerSubtitle?: string;
  headerDark?: boolean;
  body: string;
  footerExtra?: string;
}): string {
  const headerBg   = headerDark ? "#1A1A1A" : "#E8401C";
  const titleColor = headerDark ? "#C9952A" : "#ffffff";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${headerTitle}</title>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;</div>` : ""}
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- Header -->
      <tr><td style="background:${headerBg};padding:28px 36px;border-radius:8px 8px 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <span style="display:inline-block;width:28px;height:28px;background:#E8401C;border-radius:6px;text-align:center;line-height:28px;font-weight:900;font-size:14px;color:white;margin-right:10px;vertical-align:middle;">B</span>
              <span style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;vertical-align:middle;">PIVOT TRAINING</span>
            </td>
          </tr>
        </table>
        <h1 style="color:${titleColor};font-size:26px;font-weight:800;margin:16px 0 0;letter-spacing:0.5px;line-height:1.2;">${headerTitle}</h1>
        ${headerSubtitle ? `<p style="color:rgba(255,255,255,0.55);font-size:14px;margin:6px 0 0;">${headerSubtitle}</p>` : ""}
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#ffffff;padding:36px;border-radius:0 0 8px 8px;border:1px solid #e8e8e8;border-top:none;">
        ${body}
        <hr style="border:none;border-top:1px solid #f0f0f0;margin:32px 0 24px;"/>
        <p style="color:#aaa;font-size:12px;line-height:1.7;margin:0;">
          <strong style="color:#666;">Pivot Training &amp; Development</strong><br/>
          A Chris Marvel LLC Company · Atlanta, GA<br/>
          <a href="https://www.pivottraining.us" style="color:#E8401C;text-decoration:none;">pivottraining.us</a> ·
          <a href="https://burnoutiqtest.com" style="color:#E8401C;text-decoration:none;">burnoutiqtest.com</a>
        </p>
        ${footerExtra}
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ─── Reusable blocks ───────────────────────────────────────────────────── */
export function ctaButton(text: string, href: string, color = "#E8401C"): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td style="background:${color};border-radius:6px;">
    <a href="${href}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:700;font-size:14px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">${text} →</a>
  </td></tr>
</table>`;
}

export function infoBox(content: string, bg = "#fff8f0", border = "#E8401C"): string {
  return `<div style="background:${bg};border-left:4px solid ${border};padding:18px 20px;border-radius:0 6px 6px 0;margin:20px 0;">${content}</div>`;
}

export function zoomBox(meetingUrl: string, meetingId: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border-radius:6px;margin:20px 0;">
  <tr><td style="padding:24px 28px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;">Join Zoom Meeting</p>
    <table cellpadding="0" cellspacing="0" style="margin:12px 0;">
      <tr><td style="background:#1A1A1A;border-radius:4px;">
        <a href="${meetingUrl}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">Join the Webinar →</a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#666;"><strong>Meeting ID:</strong> ${meetingId}</p>
    <p style="margin:4px 0 0;"><a href="${meetingUrl}" style="color:#E8401C;font-size:12px;word-break:break-all;">${meetingUrl}</a></p>
  </td></tr>
</table>`;
}
