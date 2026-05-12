import type { PublishResult } from "../types";

/**
 * Publish to a LinkedIn organization page via UGC Posts API.
 * Requires:
 *   LINKEDIN_ACCESS_TOKEN — token with w_organization_social scope.
 *   LINKEDIN_ORG_URN — e.g. "urn:li:organization:12345678".
 */
export async function publishToLinkedIn(text: string): Promise<PublishResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgUrn = process.env.LINKEDIN_ORG_URN;
  if (!token || !orgUrn) {
    return {
      platform: "linkedin",
      ok: false,
      error: "LINKEDIN_ACCESS_TOKEN or LINKEDIN_ORG_URN not set",
    };
  }

  const body = {
    author: orgUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return {
      platform: "linkedin",
      ok: false,
      error: `${res.status}: ${errBody}`,
    };
  }

  const id = res.headers.get("x-restli-id") ?? undefined;
  return {
    platform: "linkedin",
    ok: true,
    postId: id,
    url: id ? `https://www.linkedin.com/feed/update/${id}` : undefined,
  };
}
