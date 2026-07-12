import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("studies a deck and completes a session", async ({ page }) => {
  await login(page);

  await page.goto("/decks");
  await page.getByRole("link", { name: /Intro to Spaced Repetition/i }).click();
  await expect(page.getByText(/Card 1 of/i)).toBeVisible();

  const good = page.getByRole("button", { name: "Good" });
  const done = page.getByText(/Session complete/i);

  for (let i = 0; i < 10; i++) {
    if (await done.isVisible().catch(() => false)) break;
    await good.click({ timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(600);
  }

  await expect(done).toBeVisible();
});
