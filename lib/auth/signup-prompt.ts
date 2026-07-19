export type SignupPromptVariant = "streak" | "leaderboard" | "rank";

const KEY = "clackrace_signup_variant";

/** Sticky A/B variant for post-race sign-up copy. */
export function getSignupPromptVariant(): SignupPromptVariant {
  if (typeof window === "undefined") return "streak";
  try {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("signupVariant");
    if (forced === "streak" || forced === "leaderboard" || forced === "rank") {
      localStorage.setItem(KEY, forced);
      return forced;
    }
    const stored = localStorage.getItem(KEY);
    if (stored === "streak" || stored === "leaderboard" || stored === "rank") {
      return stored;
    }
    const pick: SignupPromptVariant =
      (["streak", "leaderboard", "rank"] as const)[
        Math.floor(Math.random() * 3)
      ] ?? "streak";
    localStorage.setItem(KEY, pick);
    return pick;
  } catch {
    return "streak";
  }
}

export function signupPromptCopy(variant: SignupPromptVariant): {
  title: string;
  body: string;
} {
  switch (variant) {
    case "leaderboard":
      return {
        title: "Join the global leaderboard",
        body: "Sign up to keep this run on the all-time, daily, and weekly boards.",
      };
    case "rank":
      return {
        title: "Claim your rank",
        body: "Sign up to lock this WPM onto the boards — you might already be climbing.",
      };
    default:
      return {
        title: "Save this run and start your streak",
        body: "Create a free account so tomorrow’s race counts toward your streak.",
      };
  }
}
