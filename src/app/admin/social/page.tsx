"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  Inbox,
  Lock,
  MessageSquare,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";

type Platform = "x" | "linkedin" | "facebook";
type Theme =
  | "archetype_spotlight"
  | "driver_insight"
  | "stat_or_research"
  | "whitepaper_promo"
  | "assessment_cta"
  | "leadership_question"
  | "myth_vs_reality";

interface PostRow {
  id: string;
  created_at: string;
  platform: Platform;
  theme: Theme;
  body: string;
  hashtags: string[];
  link: string | null;
  headline: string | null;
  subtitle: string | null;
  image_url: string | null;
  rendered: string;
  published: boolean;
  platform_post_id: string | null;
  platform_url: string | null;
  error: string | null;
  dry_run: boolean;
}

const PLATFORMS: Platform[] = ["x", "linkedin", "facebook"];
const THEMES: Theme[] = [
  "archetype_spotlight",
  "driver_insight",
  "stat_or_research",
  "whitepaper_promo",
  "assessment_cta",
  "leadership_question",
  "myth_vs_reality",
];

interface MentionRow {
  id: string;
  created_at: string;
  platform: Platform;
  platform_mention_id: string;
  source_text: string;
  source_author: string | null;
  source_url: string | null;
  draft_reply: string | null;
  approved: boolean;
  sent: boolean;
  platform_reply_id: string | null;
  error: string | null;
}

export default function SocialAdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [tab, setTab] = useState<"posts" | "inbox">("posts");
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [mentions, setMentions] = useState<MentionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<string>("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [theme, setTheme] = useState<Theme | "">("");
  const [steer, setSteer] = useState("");

  const refresh = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    setError("");
    try {
      const [postsRes, mentionsRes] = await Promise.all([
        fetch("/api/social-media/posts?limit=50", {
          headers: { "x-admin-token": adminToken },
        }),
        fetch("/api/social-media/mentions?limit=50", {
          headers: { "x-admin-token": adminToken },
        }),
      ]);
      const postsJson = await postsRes.json();
      if (!postsRes.ok) throw new Error(postsJson.error || "Failed to load posts");
      setPosts(postsJson.posts);
      const mentionsJson = await mentionsRes.json();
      if (mentionsRes.ok) setMentions(mentionsJson.mentions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (adminToken) void refresh();
  }, [adminToken, refresh]);

  async function pollMentions() {
    setError("");
    setBusyAction("listen");
    try {
      const res = await fetch("/api/social-media/listen", {
        method: "POST",
        headers: { "x-admin-token": adminToken, "Content-Type": "application/json" },
        body: "{}",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Listen failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Listen failed");
    } finally {
      setBusyAction("");
    }
  }

  async function sendReply(mention: MentionRow, text: string) {
    setError("");
    setBusyAction(`reply-${mention.id}`);
    try {
      const res = await fetch("/api/social-media/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ mentionId: mention.id, text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Reply failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reply failed");
    } finally {
      setBusyAction("");
    }
  }

  async function runPost(opts: {
    platform?: Platform;
    theme?: Theme;
    steer?: string;
    dryRun: boolean;
  }) {
    setError("");
    setBusyAction(opts.dryRun ? "draft" : "publish");
    try {
      const res = await fetch("/api/social-media/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(opts),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Post failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Post failed");
    } finally {
      setBusyAction("");
    }
  }

  async function publishExisting(post: PostRow) {
    setError("");
    setBusyAction("publish");
    try {
      const res = await fetch("/api/social-media/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ postId: post.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Publish failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <main className="min-h-screen bg-light-bg py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-ember" />
          <p className="text-xs font-bold uppercase tracking-widest text-ember">
            Pivot Ops · Internal
          </p>
        </div>
        <h1 className="text-3xl font-bold text-navy mb-2">Social media agent</h1>
        <p className="text-navy/60 mb-8">
          Generate drafts, review what the cron has been posting, and re-publish
          a vetted dry-run draft.
        </p>

        <div className="bg-white border border-navy/10 rounded-2xl p-5 mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-2">
            Admin token
          </label>
          <input
            type="password"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className="w-full border border-navy/20 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {adminToken && (
          <div className="bg-white border border-navy/10 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-navy/60 mb-3">
              Generate a draft
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | "")}
                className="border border-navy/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Platform (rotation)</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme | "")}
                className="border border-navy/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Theme (rotation)</option>
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                value={steer}
                onChange={(e) => setSteer(e.target.value)}
                placeholder="Steering (optional)"
                className="border border-navy/20 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                disabled={!!busyAction}
                onClick={() =>
                  runPost({
                    platform: platform || undefined,
                    theme: theme || undefined,
                    steer: steer || undefined,
                    dryRun: true,
                  })
                }
                className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {busyAction === "draft" ? "Drafting…" : "Draft (dry run)"}
              </button>
              <button
                disabled={!!busyAction}
                onClick={() =>
                  runPost({
                    platform: platform || undefined,
                    theme: theme || undefined,
                    steer: steer || undefined,
                    dryRun: false,
                  })
                }
                className="bg-ember text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {busyAction === "publish" ? "Publishing…" : "Publish now"}
              </button>
              <button
                onClick={() => void refresh()}
                disabled={loading}
                className="ml-auto text-navy/60 px-3 py-2 rounded-lg text-sm hover:bg-navy/5 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {adminToken && (
          <div className="flex items-center gap-1 mb-4 border-b border-navy/10">
            <button
              onClick={() => setTab("posts")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 ${
                tab === "posts" ? "border-ember text-navy" : "border-transparent text-navy/50"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setTab("inbox")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 flex items-center gap-1.5 ${
                tab === "inbox" ? "border-ember text-navy" : "border-transparent text-navy/50"
              }`}
            >
              <Inbox className="w-4 h-4" />
              Inbox
              {mentions.filter((m) => !m.sent).length > 0 && (
                <span className="bg-ember text-white text-xs px-1.5 py-0.5 rounded-full">
                  {mentions.filter((m) => !m.sent).length}
                </span>
              )}
            </button>
          </div>
        )}

        {tab === "posts" && (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPublish={() => publishExisting(post)}
                disabled={!!busyAction}
              />
            ))}
            {posts.length === 0 && adminToken && !loading && (
              <p className="text-navy/50 text-sm text-center py-12">
                No posts yet. Generate a draft above.
              </p>
            )}
          </div>
        )}

        {tab === "inbox" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-navy/60">
                Mentions and comments the agent has seen. Draft replies are
                generated by Claude — review, edit if needed, then send.
              </p>
              <button
                onClick={pollMentions}
                disabled={!!busyAction}
                className="bg-navy text-white px-3 py-1.5 rounded-md text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3 h-3" />
                {busyAction === "listen" ? "Polling…" : "Poll now"}
              </button>
            </div>
            <div className="space-y-3">
              {mentions.map((m) => (
                <MentionCard
                  key={m.id}
                  mention={m}
                  onSend={(text) => sendReply(m, text)}
                  busy={busyAction === `reply-${m.id}`}
                  disabled={!!busyAction && busyAction !== `reply-${m.id}`}
                />
              ))}
              {mentions.length === 0 && (
                <p className="text-navy/50 text-sm text-center py-12">
                  No mentions yet. Click &quot;Poll now&quot; to check.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function MentionCard({
  mention,
  onSend,
  busy,
  disabled,
}: {
  mention: MentionRow;
  onSend: (text: string) => void;
  busy: boolean;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState(mention.draft_reply ?? "");
  useEffect(() => {
    // Sync when the parent reloads with a freshly-drafted reply.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(mention.draft_reply ?? "");
  }, [mention.draft_reply]);

  return (
    <div className="bg-white border border-navy/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-widest text-navy/60">
          {mention.platform}
        </span>
        {mention.source_author && (
          <span className="text-xs text-navy/60">@{mention.source_author}</span>
        )}
        {mention.sent ? (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
            Sent
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
            Pending
          </span>
        )}
        {mention.source_url && (
          <a
            href={mention.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-ember underline"
          >
            source
          </a>
        )}
        <span className="ml-auto text-xs text-navy/40">
          {new Date(mention.created_at).toLocaleString()}
        </span>
      </div>
      <div className="bg-navy/5 rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1">
          Mention
        </p>
        <p className="text-sm text-navy/80 whitespace-pre-wrap">{mention.source_text}</p>
      </div>
      <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-1">
        Draft reply
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={mention.sent}
        rows={4}
        className="w-full border border-navy/20 rounded-lg px-3 py-2 text-sm mb-2 disabled:bg-navy/5"
      />
      {mention.error && (
        <p className="text-xs text-red-700 mb-2 bg-red-50 rounded px-2 py-1">
          {mention.error}
        </p>
      )}
      {!mention.sent && (
        <button
          onClick={() => onSend(draft)}
          disabled={disabled || busy || !draft.trim()}
          className="bg-ember text-white px-3 py-1.5 rounded-md text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-3 h-3" />
          {busy ? "Sending…" : "Approve & send"}
        </button>
      )}
    </div>
  );
}

function PostCard({
  post,
  onPublish,
  disabled,
}: {
  post: PostRow;
  onPublish: () => void;
  disabled: boolean;
}) {
  const status = post.error
    ? { label: "Error", classes: "bg-red-100 text-red-800" }
    : post.dry_run
      ? { label: "Dry run", classes: "bg-navy/10 text-navy" }
      : post.published
        ? { label: "Published", classes: "bg-emerald-100 text-emerald-800" }
        : { label: "Pending", classes: "bg-amber-100 text-amber-800" };

  return (
    <div className="bg-white border border-navy/10 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-navy/60">
            {post.platform}
          </span>
          <span className="text-xs text-navy/40">·</span>
          <span className="text-xs text-navy/60">{post.theme}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.classes}`}>
            {status.label}
          </span>
          {post.published && post.platform_url && (
            <a
              href={post.platform_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-ember underline"
            >
              view on {post.platform}
            </a>
          )}
        </div>
        <span className="text-xs text-navy/40 whitespace-nowrap">
          {new Date(post.created_at).toLocaleString()}
        </span>
      </div>

      {post.headline && (
        <p className="text-base font-bold text-navy mb-1">{post.headline}</p>
      )}
      <p className="text-sm text-navy/80 whitespace-pre-wrap mb-2">{post.body}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {post.hashtags.map((h) => (
          <span key={h} className="text-xs text-navy/50">
            #{h}
          </span>
        ))}
      </div>

      {post.image_url && (
        <a
          href={post.image_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-ember underline mr-3"
        >
          preview card
        </a>
      )}
      {post.link && (
        <a
          href={post.link}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-ember underline"
        >
          CTA link
        </a>
      )}

      {post.error && (
        <p className="text-xs text-red-700 mt-3 bg-red-50 rounded px-2 py-1">
          {post.error}
        </p>
      )}

      {post.dry_run && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onPublish}
            disabled={disabled}
            className="text-xs bg-ember text-white px-3 py-1.5 rounded-md font-semibold disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            Approve &amp; publish
          </button>
          <span className="text-xs text-navy/50 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Publishes this exact draft as-is.
          </span>
        </div>
      )}
    </div>
  );
}
