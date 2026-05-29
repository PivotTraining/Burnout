"use client";

/**
 * Tiny client component whose only job is to drop the team-challenge
 * invite token into sessionStorage so the results page can pick it up
 * and attribute the completion back to the inviter.
 *
 * sessionStorage (not localStorage) is intentional — the attribution
 * should not persist across browser sessions, and a stray token from
 * an old email shouldn't haunt a future assessment-take.
 */

import { useEffect } from "react";

export default function StashInviteToken({ token }: { token: string }) {
  useEffect(() => {
    try {
      sessionStorage.setItem("biq_team_invite_token", token);
    } catch {
      // best-effort
    }
  }, [token]);
  return null;
}
