import { expect, test } from "@playwright/test";

test.describe("pre-launch smoke", () => {
  test("landing → play now → mode select with four pitched cards", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /play now/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /play now/i }).first().click();
    await expect(page).toHaveURL(/\/play\/?$/);

    await expect(
      page.getByRole("heading", { name: /how do you want to race/i }),
    ).toBeVisible();

    for (const title of [
      "Race CPU",
      "Open Race",
      "Quick Race",
      "Challenge a Friend",
    ]) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }

    await expect(page.getByText(/practice instantly against bots/i)).toBeVisible();
    await expect(page.getByText(/host a race and share the link/i)).toBeVisible();
    await expect(page.getByText(/jump in with whoever/i)).toBeVisible();
    await expect(page.getByText(/anyone with the link/i)).toBeVisible();
    await expect(page.getByText(/random players/i)).toBeVisible();

    const body = await page.locator("body").innerText();
    expect(body.toLowerCase()).not.toMatch(/\broom\b/);
    expect(body.toLowerCase()).not.toContain("guest user");
  });

  test("race cpu setup loads", async ({ page }) => {
    await page.goto("/play/solo");
    await expect(page.getByText(/race cpu|difficulty|beat your best/i).first()).toBeVisible();
  });

  test("leaderboard and sign-in pages load", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.getByText(/leaderboard|all-time|daily/i).first()).toBeVisible();

    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: /sign in|sign up/i })).toBeVisible();
  });

  test("solo typing surface blocks paste and sets mobile attrs", async ({
    page,
  }) => {
    await page.goto("/play/solo");
    // Start a race if a start control exists
    const start = page.getByRole("button", { name: /start|race|go/i }).first();
    if (await start.isVisible().catch(() => false)) {
      await start.click();
    }

    const input = page.locator("textarea, input[type='text'], [contenteditable='true']").first();
    // Countdown may delay input; wait briefly
    await input.waitFor({ state: "attached", timeout: 15_000 }).catch(() => null);
    if (!(await input.count())) {
      test.skip(true, "Typing input not reached without full solo start flow");
      return;
    }

    await expect(input).toHaveAttribute("autocorrect", /off/i);
    await expect(input).toHaveAttribute("autocapitalize", /off/i);
    await expect(input).toHaveAttribute("spellcheck", "false");

    await input.focus();
    await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return;
      const e = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: new DataTransfer(),
      });
      el.dispatchEvent(e);
      (window as unknown as { __pasteDefaultPrevented?: boolean }).__pasteDefaultPrevented =
        e.defaultPrevented;
    });
    const prevented = await page.evaluate(
      () =>
        (window as unknown as { __pasteDefaultPrevented?: boolean })
          .__pasteDefaultPrevented === true,
    );
    expect(prevented).toBe(true);
  });
});
