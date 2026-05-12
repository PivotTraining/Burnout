import type { PublishResult } from "../types";

/**
 * Publish to a LinkedIn organization page via UGC Posts API.
 *
 * Requires:
 *   LINKEDIN_ACCESS_TOKEN — token with w_organization_social scope.
 *   LINKEDIN_ORG_URN — e.g. "urn:li:organization:12345678".
 *
 * When imageUrl is provided, performs the 3-step asset upload:
 *   1. POST /v2/assets?action=registerUpload → upload URL + asset URN
 *   2. PUT image bytes to upload URL
 *   3. Reference asset URN in the UGC post as IMAGE media.
 */
export async function publishToLinkedIn(
  text: string,
  imageUrl?: string,
): Promise<PublishResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgUrn = process.env.LINKEDIN_ORG_URN;
  if (!token || !orgUrn) {
    return {
      platform: "linkedin",
      ok: false,
      error: "LINKEDIN_ACCESS_TOKEN or LINKEDIN_ORG_URN not set",
    };
  }

  let mediaBlock:
    | undefined
    | Array<{ status: string; media: string; title: { text: string } }>;
  if (imageUrl) {
    const asset = await uploadImageToLinkedIn(imageUrl, token, orgUrn);
    if (!asset.ok) {
      return { platform: "linkedin", ok: false, error: `media upload: ${asset.error}` };
    }
    mediaBlock = [
      { status: "READY", media: asset.assetUrn, title: { text: "BurnoutIQ" } },
    ];
  }

  const body = {
    author: orgUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: mediaBlock ? "IMAGE" : "NONE",
        ...(mediaBlock ? { media: mediaBlock } : {}),
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
    return { platform: "linkedin", ok: false, error: `${res.status}: ${errBody}` };
  }

  const id = res.headers.get("x-restli-id") ?? undefined;
  return {
    platform: "linkedin",
    ok: true,
    postId: id,
    url: id ? `https://www.linkedin.com/feed/update/${id}` : undefined,
  };
}

async function uploadImageToLinkedIn(
  imageUrl: string,
  token: string,
  orgUrn: string,
): Promise<{ ok: true; assetUrn: string } | { ok: false; error: string }> {
  // Step 1: register upload
  const registerRes = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: orgUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    },
  );
  if (!registerRes.ok) {
    return { ok: false, error: `register ${registerRes.status}: ${await registerRes.text()}` };
  }
  type RegisterResp = {
    value?: {
      asset?: string;
      uploadMechanism?: {
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"?: {
          uploadUrl?: string;
        };
      };
    };
  };
  const reg = (await registerRes.json()) as RegisterResp;
  const uploadUrl =
    reg.value?.uploadMechanism?.[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]?.uploadUrl;
  const assetUrn = reg.value?.asset;
  if (!uploadUrl || !assetUrn) {
    return { ok: false, error: "missing uploadUrl/asset URN in register response" };
  }

  // Step 2: fetch the image bytes
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return { ok: false, error: `fetch image ${imgRes.status}` };
  const bytes = Buffer.from(await imgRes.arrayBuffer());

  // Step 3: PUT bytes to the upload URL
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "image/png",
    },
    body: new Uint8Array(bytes),
  });
  if (!putRes.ok) {
    return { ok: false, error: `put ${putRes.status}: ${await putRes.text()}` };
  }

  return { ok: true, assetUrn };
}
