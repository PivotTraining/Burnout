import type { PublishResult } from "../types";

/**
 * Publish to a Facebook Page via Graph API.
 * Requires:
 *   FACEBOOK_PAGE_ID
 *   FACEBOOK_PAGE_ACCESS_TOKEN — a long-lived Page access token with pages_manage_posts.
 */
export async function publishToFacebook(text: string): Promise<PublishResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return {
      platform: "facebook",
      ok: false,
      error: "FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set",
    };
  }

  const url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, access_token: token }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return { platform: "facebook", ok: false, error: `${res.status}: ${errBody}` };
  }

  const json = (await res.json()) as { id?: string };
  return {
    platform: "facebook",
    ok: !!json.id,
    postId: json.id,
    url: json.id ? `https://facebook.com/${json.id}` : undefined,
    error: json.id ? undefined : "missing id in response",
  };
}
