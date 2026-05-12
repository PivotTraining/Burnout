import type { PublishResult } from "../types";

/**
 * Publish to a Facebook Page via Graph API.
 *
 * Requires:
 *   FACEBOOK_PAGE_ID
 *   FACEBOOK_PAGE_ACCESS_TOKEN — long-lived Page access token with
 *   pages_manage_posts.
 *
 * If imageUrl is provided, uses /{page-id}/photos so the image is the
 * post media (better engagement than relying on link-unfurl).
 */
export async function publishToFacebook(
  text: string,
  imageUrl?: string,
): Promise<PublishResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return {
      platform: "facebook",
      ok: false,
      error: "FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN not set",
    };
  }

  const endpoint = imageUrl
    ? `https://graph.facebook.com/v21.0/${pageId}/photos`
    : `https://graph.facebook.com/v21.0/${pageId}/feed`;
  const payload: Record<string, string> = imageUrl
    ? { url: imageUrl, caption: text, access_token: token }
    : { message: text, access_token: token };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return { platform: "facebook", ok: false, error: `${res.status}: ${errBody}` };
  }

  const json = (await res.json()) as { id?: string; post_id?: string };
  const id = json.post_id ?? json.id;
  return {
    platform: "facebook",
    ok: !!id,
    postId: id,
    url: id ? `https://facebook.com/${id}` : undefined,
    error: id ? undefined : "missing id in response",
  };
}
