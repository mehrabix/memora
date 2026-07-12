import { expect, type Page } from "@playwright/test";

export const DEMO_EMAIL = "demo@memora.app";
export const DEMO_PASSWORD = "password123";

export async function login(page: Page) {
  await page.goto("/auth/login");
  await page.fill('input[name="email"]', DEMO_EMAIL);
  await page.fill('input[name="password"]', DEMO_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard$/);
}
