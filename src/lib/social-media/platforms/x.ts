import type { PublishResult } from "../types";

/**
 * Publish a post to X (Twitter) via API v2.
 * Requires X_BEARER_TOKEN with `tweet.write` scope (OAuth 2.0 user context).
 */
export async function publishToX(text: string): Promise<PublishResult> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    return { platform: "x", ok: false, error: "X_BEARER_TOKEN not set" };
  }

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return { platform: "x", ok: false, error: `${res.status}: ${errBody}` };
  }

  const json = (await res.json()) as { data?: { id: string } };
  const id = json.data?.id;
  return {
    platform: "x",
    ok: !!id,
    postId: id,
    url: id ? `https://x.com/i/web/status/${id}` : undefined,
    error: id ? undefined : "missing id in response",
  };
}
