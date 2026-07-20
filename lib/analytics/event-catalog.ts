/** Human-readable catalog for first-party analytics (PRD Phase 9). */

export type EventMeta = {
  title: string;
  group: string;
  description: string;
};

export const EVENT_CATALOG: Record<string, EventMeta> = {
  landing_view: {
    title: "Landing viewed",
    group: "Acquisition",
    description: "Someone opened the marketing homepage.",
  },
  play_now_click: {
    title: "Play now clicked",
    group: "Acquisition",
    description: "CTA from the landing hero toward mode select.",
  },
  mode_select_view: {
    title: "Mode select viewed",
    group: "Acquisition",
    description: "Opened the How do you want to race? screen.",
  },
  mode_chosen: {
    title: "Mode chosen",
    group: "Acquisition",
    description:
      "Picked a mode. Props.mode: solo | open | quick | challenge.",
  },

  "auth.sign_in": {
    title: "Sign in",
    group: "Auth",
    description: "Sign-in attempt finished. Props.ok = success.",
  },
  "auth.sign_up": {
    title: "Sign up",
    group: "Auth",
    description: "Account creation finished. Props.ok = success.",
  },
  "auth.guest_claim": {
    title: "Guest runs claimed",
    group: "Auth",
    description:
      "Guest race history attached to an account after sign-in. Props.claimed = count.",
  },

  "open.session_created": {
    title: "Open Race created",
    group: "Open Race",
    description: "Host started a link-join race session.",
  },
  "open.link_copied": {
    title: "Open Race link copied",
    group: "Open Race",
    description: "Host copied the invite link.",
  },
  "open.join": {
    title: "Open Race join",
    group: "Open Race",
    description:
      "Someone tried to join. Props.result: success | full | in_progress | error.",
  },
  "open.leave": {
    title: "Open Race leave",
    group: "Open Race",
    description: "A racer left the session.",
  },
  "open.end_session": {
    title: "Open Race ended",
    group: "Open Race",
    description: "Host ended the race session.",
  },

  "quick.queue_enter": {
    title: "Quick Race queue enter",
    group: "Quick Race",
    description: "Player entered matchmaking.",
  },
  "quick.queue_timeout": {
    title: "Quick Race queue timeout",
    group: "Quick Race",
    description: "No match found before search timed out.",
  },
  "quick.assigned": {
    title: "Quick Race assigned",
    group: "Quick Race",
    description: "Matchmaking put the player into a session.",
  },
  "quick.commit_started": {
    title: "Quick Race commit started",
    group: "Quick Race",
    description: "Ready-commit countdown began (need ≥2 ready).",
  },
  "quick.commit_aborted_lt2": {
    title: "Quick Race commit aborted",
    group: "Quick Race",
    description: "Commit cancelled because fewer than 2 racers were ready.",
  },
  "quick.race_started": {
    title: "Quick Race started",
    group: "Quick Race",
    description: "A Quick Race round began typing.",
  },
  "quick.refill_joined": {
    title: "Quick Race refill joined",
    group: "Quick Race",
    description: "Player joined an existing session between rounds.",
  },
  "quick.race_again": {
    title: "Quick Race again",
    group: "Quick Race",
    description: "Player chose to race again / re-queue after a finish.",
  },

  "challenge.sent": {
    title: "Challenge sent",
    group: "Challenge",
    description: "Direct challenge invite created.",
  },
  "challenge.accepted": {
    title: "Challenge accepted",
    group: "Challenge",
    description: "Recipient accepted the invite.",
  },
  "challenge.declined": {
    title: "Challenge declined",
    group: "Challenge",
    description: "Recipient declined the invite.",
  },
  "challenge.expired": {
    title: "Challenge expired",
    group: "Challenge",
    description: "Invite timed out unused.",
  },
  "challenge.revoked": {
    title: "Challenge revoked",
    group: "Challenge",
    description: "Sender cancelled the invite.",
  },
  "challenge.email_invite_sent": {
    title: "Challenge email sent",
    group: "Challenge",
    description: "Offline invite email was queued/sent.",
  },
  "challenge.rematch_requested": {
    title: "Challenge rematch requested",
    group: "Challenge",
    description: "Someone asked for a rematch.",
  },
  "challenge.rematch_responded": {
    title: "Challenge rematch responded",
    group: "Challenge",
    description: "Rematch request was accepted or declined.",
  },

  "solo.setup_view": {
    title: "Race CPU setup",
    group: "Race CPU",
    description: "Opened Race CPU / Beat your best setup.",
  },
  "solo.race_start": {
    title: "Solo race start",
    group: "Race CPU",
    description: "Solo round started. Props.variant: cpu | ghost.",
  },
  "solo.race_finish": {
    title: "Solo race finish",
    group: "Race CPU",
    description:
      "Solo round finished. Props include variant, wpm, accuracy, placement.",
  },
  "solo.beat_best_click": {
    title: "Beat your best clicked",
    group: "Race CPU",
    description: "CTA to race the personal-best ghost (stats or setup).",
  },
  "solo.personal_best_set": {
    title: "Personal best set",
    group: "Race CPU",
    description: "A new verified PB was stored. Props: wpm, mode.",
  },

  "race.start": {
    title: "Race started",
    group: "Race",
    description: "A multiplayer/shared race round started.",
  },
  "race.finish": {
    title: "Race finished",
    group: "Race",
    description:
      "A racer finished. Props: mode, wpm, accuracy, placement, shadow_held.",
  },
  "race.forfeit_disconnect": {
    title: "Forfeit (disconnect)",
    group: "Race",
    description: "Racer left mid-race / connection dropped.",
  },
  "race.forfeit_idle_cap": {
    title: "Forfeit (idle)",
    group: "Race",
    description: "Racer hit the idle typing cap and was forfeited.",
  },

  streak_increment: {
    title: "Streak incremented",
    group: "Retention",
    description: "Daily play streak went up for a signed-in user.",
  },
  leaderboard_view: {
    title: "Leaderboard viewed",
    group: "Retention",
    description: "Opened boards. Props.scope: all_time | daily | weekly | rating.",
  },
  stats_view: {
    title: "Stats viewed",
    group: "Retention",
    description: "Opened the personal stats dashboard.",
  },
  settings_change: {
    title: "Settings changed",
    group: "Retention",
    description: "Profile/settings update (car, font, username, etc.).",
  },
  result_share_intent: {
    title: "Share intent",
    group: "Retention",
    description: "Tried to share a result or champion card. Props.kind.",
  },
  "champion.daily_awarded": {
    title: "Daily champion awarded",
    group: "Retention",
    description: "UTC daily crown was granted to a user.",
  },
  "champion.overall_held": {
    title: "Overall champion shown",
    group: "Retention",
    description: "UI rendered the all-time crown for a user.",
  },
  menu_open: {
    title: "Menu opened",
    group: "Retention",
    description: "Opened the in-app Menu (mode switcher).",
  },
  menu_navigate: {
    title: "Menu navigate",
    group: "Retention",
    description: "Picked a destination from the Menu. Props.target = path.",
  },
};

export function describeEvent(name: string): EventMeta {
  const known = EVENT_CATALOG[name];
  if (known) return known;
  const group = name.includes(".")
    ? name.split(".")[0]!.replace(/_/g, " ")
    : "Other";
  return {
    title: name.replace(/[._]/g, " "),
    group: group.charAt(0).toUpperCase() + group.slice(1),
    description: "Custom or uncatalogued event — see props for details.",
  };
}
