import type { PublishResult } from "../types";

/**
 * Publish a tweet via X API v2, optionally with one attached image.
 *
 * Requires X_BEARER_TOKEN with tweet.write + media.write scopes
 * (OAuth 2.0 user context).
 */
export async function replyOnX(
  text: string,
  inReplyToTweetId: string,
): Promise<PublishResult> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return { platform: "x", ok: false, error: "X_BEARER_TOKEN not set" };

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      reply: { in_reply_to_tweet_id: inReplyToTweetId },
    }),
  });
  if (!res.ok) {
    return { platform: "x", ok: false, error: `${res.status}: ${await res.text()}` };
  }
  const json = (await res.json()) as { data?: { id: string } };
  const id = json.data?.id;
  return {
    platform: "x",
    ok: !!id,
    postId: id,
    url: id ? `https://x.com/i/web/status/${id}` : undefined,
  };
}

export async function publishToX(
  text: string,
  imageUrl?: string,
): Promise<PublishResult> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    return { platform: "x", ok: false, error: "X_BEARER_TOKEN not set" };
  }

  let mediaIds: string[] | undefined;
  if (imageUrl) {
    const upload = await uploadImageToX(imageUrl, token);
    if (!upload.ok) {
      return { platform: "x", ok: false, error: `media upload: ${upload.error}` };
    }
    mediaIds = [upload.mediaId];
  }

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      mediaIds ? { text, media: { media_ids: mediaIds } } : { text },
    ),
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

async function uploadImageToX(
  imageUrl: string,
  token: string,
): Promise<{ ok: true; mediaId: string } | { ok: false; error: string }> {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return { ok: false, error: `fetch image ${imgRes.status}` };
  const bytes = Buffer.from(await imgRes.arrayBuffer());

  const form = new FormData();
  form.append("media_category", "tweet_image");
  form.append(
    "media",
    new Blob([new Uint8Array(bytes)], { type: "image/png" }),
    "card.png",
  );

  const res = await fetch("https://api.x.com/2/media/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `${res.status}: ${err}` };
  }
  const json = (await res.json()) as { data?: { id?: string } };
  const id = json.data?.id;
  return id
    ? { ok: true, mediaId: id }
    : { ok: false, error: "missing media id" };
}
