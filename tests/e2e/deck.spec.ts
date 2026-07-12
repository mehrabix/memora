import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("creates a manual deck and adds a card", async ({ page }) => {
  await login(page);

  await page.goto("/decks/new");
  const title = `E2E Deck ${Date.now()}`;
  await page.fill('input[name="title"]', title);
  await page.fill('textarea[name="description"]', "Created by Playwright");
  await page.getByRole("button", { name: /Create & add cards/i }).click();

  // Wait for the edit page (add-card form) to render.
  await expect(page.locator('input[name="front"]')).toBeVisible();

  await page.fill('input[name="front"]', "2 + 2");
  await page.fill('textarea[name="back"]', "4");
  await page.getByRole("button", { name: /Add card/i }).click();

  await expect(page.getByText("2 + 2")).toBeVisible();
});
