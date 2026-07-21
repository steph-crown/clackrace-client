import { describe, expect, it } from "vitest";
import { describeEvent, EVENT_CATALOG } from "./event-catalog";

/** PRD Phase 9 minimum taxonomy — every name should be documented. */
const PRD_EVENTS = [
  "landing_view",
  "play_now_click",
  "mode_select_view",
  "mode_chosen",
  "auth.sign_in",
  "auth.sign_up",
  "auth.guest_claim",
  "open.session_created",
  "open.link_copied",
  "open.join",
  "open.leave",
  "open.end_session",
  "quick.queue_enter",
  "quick.queue_timeout",
  "quick.assigned",
  "quick.commit_started",
  "quick.commit_aborted_lt2",
  "quick.race_started",
  "quick.refill_joined",
  "quick.race_again",
  "challenge.sent",
  "challenge.accepted",
  "challenge.declined",
  "challenge.expired",
  "challenge.revoked",
  "challenge.email_invite_sent",
  "challenge.rematch_requested",
  "challenge.rematch_responded",
  "solo.setup_view",
  "solo.race_start",
  "solo.race_finish",
  "solo.beat_best_click",
  "solo.personal_best_set",
  "race.start",
  "race.finish",
  "race.forfeit_disconnect",
  "race.forfeit_idle_cap",
  "streak_increment",
  "leaderboard_view",
  "stats_view",
  "settings_change",
  "result_share_intent",
  "champion.daily_awarded",
  "champion.overall_held",
  "menu_open",
  "menu_navigate",
] as const;

describe("event catalog", () => {
  it("documents every PRD taxonomy event", () => {
    for (const name of PRD_EVENTS) {
      expect(EVENT_CATALOG[name], name).toBeDefined();
      expect(EVENT_CATALOG[name]!.title.length).toBeGreaterThan(0);
      expect(EVENT_CATALOG[name]!.description.length).toBeGreaterThan(0);
    }
  });

  it("describeEvent falls back for unknown names", () => {
    const meta = describeEvent("custom.thing");
    expect(meta.title.length).toBeGreaterThan(0);
    expect(meta.description).toMatch(/uncatalogued|Custom/i);
  });
});
